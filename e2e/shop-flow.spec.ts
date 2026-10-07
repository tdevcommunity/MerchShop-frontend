import { test, expect } from "@playwright/test";

test("parcours catalogue vers panier", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /porte/i })).toBeVisible();

  await page.getByRole("link", { name: "Voir la boutique" }).first().click();
  await expect(page.getByRole("heading", { name: "La boutique" })).toBeVisible();

  await page.getByRole("link", { name: /T-shirt TDEV Core/i }).first().click();
  await expect(
    page.getByRole("heading", { name: "T-shirt TDEV Core" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Ajouter au panier" }).click();
  await expect(page.getByRole("link", { name: /Panier, 1 article/ })).toBeVisible();
  await page.getByRole("link", { name: /Panier/ }).click();
  await expect(page.getByRole("heading", { name: "Mon panier" })).toBeVisible();
  await expect(page.getByText("T-shirt TDEV Core")).toBeVisible();
});

test("parcours checkout mocké jusqu'au reçu", async ({ page }) => {
  await page.goto("/shop/tshirt-tdev-core");
  await page.getByRole("button", { name: "Ajouter au panier" }).click();
  await expect(page.getByRole("link", { name: /Panier, 1 article/ })).toBeVisible();
  await page.goto("/cart");
  await page.getByRole("link", { name: "Continuer", exact: true }).click();

  await expect(
    page.getByRole("heading", { name: /comment tu reçois/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /retrait jour j/i }).click();
  await page.getByRole("button", { name: "Continuer" }).click();

  await page.getByLabel("Prénom").fill("Ama");
  await page.getByLabel("Nom", { exact: true }).fill("Koffi");
  await page.getByLabel("Email").fill("ama.koffi@example.com");
  await page
    .getByRole("button", {
      name: /continuer vers le paiement|passer au paiement/i,
    })
    .click();

  await page.getByRole("button", { name: /mobile money/i }).click();
  await page.getByLabel("Numéro de téléphone").fill("+22890123456");
  await page.getByRole("button", { name: /payer/i }).click();

  await expect(
    page.getByRole("heading", { name: /tdev-|paiement réussi/i }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByText(/merch official pass|pass de retrait/i).first(),
  ).toBeVisible();
  await expect(page.getByText("ama.koffi@example.com")).toBeVisible();
});
