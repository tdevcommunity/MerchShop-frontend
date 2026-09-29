import { test, expect } from "@playwright/test";

test("parcours catalogue vers panier", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /merch officiel/i }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Voir le catalogue" }).click();
  await expect(page.getByRole("heading", { name: "Catalogue" })).toBeVisible();

  await page.getByRole("link", { name: /T-shirt TDEV Core/i }).click();
  await expect(
    page.getByRole("heading", { name: "T-shirt TDEV Core" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Ajouter au panier" }).click();
  await page.getByRole("link", { name: /Panier/ }).click();
  await expect(page.getByRole("heading", { name: "Panier" })).toBeVisible();
  await expect(page.getByText("T-shirt TDEV Core")).toBeVisible();
});
