// Resume lisible de `npm outdated --json` dans le resume du job GitHub Actions.
// Echoue des qu'une dependance a une mise a jour disponible.
// Aucune correction automatique : le job constate, l'humain met a jour.
// Usage : node .github/scripts/npm-outdated-summary.mjs npm-outdated.json

import { readFileSync, appendFileSync } from "node:fs";

const reportPath = process.argv[2] ?? "npm-outdated.json";
const raw = readFileSync(reportPath, "utf8").trim();
const report = raw ? JSON.parse(raw) : {};
const rows = Object.entries(report);

const order = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"];

function typeOf(pkg) {
  return pkg.type ?? "dependencies";
}

function statusOf(pkg) {
  if (!pkg.wanted || !pkg.current) return "inconnu";
  if (pkg.latest && pkg.current === pkg.latest) return "a jour";
  if (pkg.wanted !== pkg.current) return "compatible";
  return "majeure";
}

const lines = ["### npm outdated", ""];

if (rows.length === 0) {
  lines.push("Toutes les dependances sont a jour.");
} else {
  rows.sort(([nameA, a], [nameB, b]) => {
    const byType = order.indexOf(typeOf(a)) - order.indexOf(typeOf(b));
    return byType !== 0 ? byType : nameA.localeCompare(nameB);
  });

  lines.push(
    `${rows.length} dependance(s) a mettre a jour :`,
    "",
    "| Paquet | Type | Actuelle | Voulue | Derniere | Etat |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows.map(([name, pkg]) => {
      const current = pkg.current ?? "-";
      const wanted = pkg.wanted ?? "-";
      const latest = pkg.latest ?? "-";
      return `| \`${name}\` | ${typeOf(pkg)} | ${current} | ${wanted} | ${latest} | ${statusOf(pkg)} |`;
    }),
    "",
    "Mise a jour manuelle : `npm update` pour les versions compatibles, puis",
    "`npm install <paquet>@latest` pour les montees de version majeure.",
    "Relire le diff de `package-lock.json`, verifier `lint`, `typecheck`, `test`",
    "et `build`, puis committer soi-meme.",
  );
}

appendFileSync(process.env.GITHUB_STEP_SUMMARY ?? "/dev/stdout", `${lines.join("\n")}\n`);

if (rows.length > 0) {
  console.error(
    `::error::${rows.length} dependance(s) a mettre a jour. Voir le resume du job pour la liste des versions.`,
  );
  process.exitCode = 1;
}

