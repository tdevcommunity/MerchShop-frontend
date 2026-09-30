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
