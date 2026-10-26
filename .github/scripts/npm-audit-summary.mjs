// Resume lisible de `npm audit --json` dans le resume du job GitHub Actions.
// Echoue des qu'une vulnerabilite est presente, quelle que soit sa severite.
// Usage : node .github/scripts/npm-audit-summary.mjs npm-audit.json

import { readFileSync } from "node:fs";
import { appendFileSync } from "node:fs";

const reportPath = process.argv[2] ?? "npm-audit.json";
const report = JSON.parse(readFileSync(reportPath, "utf8"));
const vulnerabilities = Object.values(report.vulnerabilities ?? {});
const counts = { critical: 0, high: 0, moderate: 0, low: 0, info: 0 };

for (const vulnerability of vulnerabilities) {
  const severity = vulnerability.severity?.toLowerCase();
  if (severity in counts) counts[severity]++;
}

const order = ["critical", "high", "moderate", "low", "info"];
// Toute vulnerabilite fait echouer le job, meme low/info.
const blocking = vulnerabilities.length;

function describeFix(vulnerability) {
  const fix = vulnerability.fixAvailable;
  if (!fix) return "aucun correctif";
  if (fix === true) return "`npm audit fix`";
  if (typeof fix === "object") {
    return fix.isSemVerMajor
      ? `\`npm audit fix --force\` (breaking : ${fix.name}@${fix.version})`
      : `\`npm audit fix\` (${fix.name}@${fix.version})`;
  }
  return "inconnu";
}

const lines = [
  "### npm audit",
  "",
  `| Severite | Nombre |`,
  `| --- | ---: |`,
  ...order.map((severity) => `| ${severity} | ${counts[severity]} |`),
  "",
];

if (vulnerabilities.length === 0) {
  lines.push("Aucune vulnerabilite connue detectee.");
} else {
  const rows = [...vulnerabilities]
    .sort(
      (a, b) =>
        order.indexOf(a.severity) - order.indexOf(b.severity) ||
        a.name.localeCompare(b.name),
    )
    .map((vulnerability) => {
      const advisories = (vulnerability.via ?? [])
        .filter((via) => typeof via === "object")
        .map((via) => via.title ?? via.name ?? "")
        .filter(Boolean);
      const title = advisories.length
        ? advisories.join("<br>")
        : String(vulnerability.via ?? "");
      const direct = vulnerability.isDirect ? "directe" : "transitive";
      return `| \`${vulnerability.name}\` | ${vulnerability.severity} | ${direct} | ${describeFix(vulnerability)} | ${title} |`;
    });

  lines.push(
    "| Paquet | Severite | Type | Correctif | Avis |",
    "| --- | --- | --- | --- | --- |",
    ...rows,
    "",
    "Correctifs automatiques : lancer `npm audit fix` (securise) ou le workflow **Security fixes**.",
  );
}

const summary = `${lines.join("\n")}\n`;
appendFileSync(process.env.GITHUB_STEP_SUMMARY ?? "/dev/stdout", summary);

if (blocking > 0) {
  console.error(
    `::error::${blocking} vulnerabilite(s) detectee(s), toutes severites confondues. Voir le resume du job pour la liste et les correctifs.`,
  );
  process.exitCode = 1;
}
