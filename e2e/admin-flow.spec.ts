import { test, expect } from "@playwright/test";

test("redirige un visiteur vers le login admin", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Back Office" })).toBeVisible();
});

test("connecte un admin et affiche le dashboard", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("admin@tdev.tg");
  await page.getByLabel("Mot de passe").fill("TdevAdmin2026!");
  await page.getByRole("button", { name: "Entrer" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Produits" })).toBeVisible();
});

test("le staff n'a pas le menu catalogue", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("staff@tdev.tg");
  await page.getByLabel("Mot de passe").fill("TdevStaff2026!");
  await page.getByRole("button", { name: "Entrer" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Commandes" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Produits" })).toHaveCount(0);
});

test("un admin peut inviter un membre depuis les paramètres", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("admin@tdev.tg");
  await page.getByLabel("Mot de passe").fill("TdevAdmin2026!");
  await page.getByRole("button", { name: "Entrer" }).click();
  await page.goto("/admin/settings");
  await expect(page.getByRole("heading", { name: "Inviter un membre" })).toBeVisible();
  await page.getByLabel("Nom").fill("Ops Festival");
  await page.getByLabel("Email").fill("ops.festival@tdev.tg");
  await page.getByLabel("Rôle").selectOption("staff");
  await page.getByRole("button", { name: "Inviter" }).click();
  await expect(page.getByText("Identifiants à transmettre")).toBeVisible();
  await expect(page.getByText("ops.festival@tdev.tg")).toBeVisible();
});
