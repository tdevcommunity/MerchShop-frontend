import { test, expect, type Page } from "@playwright/test";

/*
 * La navigation du back-office est une barre laterale sur grand ecran, et un
 * menu replie derriere le bouton « Menu » sur petit ecran (le projet
 * `mobile-chrome` joue la meme page en Pixel 7). Les tests qui cherchent un
 * lien du menu doivent donc l'ouvrir au besoin : un lien absent du DOM n'est
 * pas un lien interdit, c'est un lien que l'ecran n'a pas encore montre.
 */
async function openNav(page: Page) {
  const menu = page.getByRole("button", { name: "Menu" });

  if (await menu.isVisible().catch(() => false)) {
    await menu.click();
  }
}

test("redirige un visiteur vers le login admin", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Back Office" })).toBeVisible();
});

test("connecte un admin et affiche le dashboard", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("admin@merchshop.test");
  await page.getByLabel("Mot de passe", { exact: true }).fill("password");
  await page.getByRole("button", { name: "Entrer" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await openNav(page);
  await expect(page.getByRole("link", { name: "Produits" })).toBeVisible();
});

test("le staff n'a pas le menu catalogue", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("staff@merchshop.test");
  await page.getByLabel("Mot de passe", { exact: true }).fill("password");
  await page.getByRole("button", { name: "Entrer" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await openNav(page);
  await expect(page.getByRole("link", { name: "Commandes" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Produits" })).toHaveCount(0);
});

test("un admin peut inviter un membre depuis les paramètres", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("admin@merchshop.test");
  await page.getByLabel("Mot de passe", { exact: true }).fill("password");
  await page.getByRole("button", { name: "Entrer" }).click();
  /*
   * On attend que la connexion ait effectivement ouvert la session et conduit
   * au dashboard. Sans cette attente, `goto` part pendant la requete de
   * connexion : le middleware ne voit encore aucun cookie et renvoie vers le
   * formulaire — un echec qui ressemble a une saisie refusee.
   */
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.goto("/admin/settings");
  await expect(page.getByRole("heading", { name: "Inviter un membre" })).toBeVisible();
  await page.getByLabel("Nom").fill("Ops Festival");
  await page.getByLabel("Email").fill("ops.festival@tdev.tg");
  await page.getByLabel("Rôle", { exact: true }).selectOption("staff");
  await page.getByRole("button", { name: "Inviter" }).click();
  await expect(page.getByText("Identifiants à transmettre")).toBeVisible();
  await expect(page.getByText("ops.festival@tdev.tg")).toBeVisible();
});
