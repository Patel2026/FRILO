import { expect, test } from '@playwright/test';

const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:8080';

test('critical path: visiteur -> commande -> admin -> suivi client', async ({ browser, page, baseURL }) => {
  const runId = Date.now();
  const clientEmail = `e2e-${runId}@frilo.test`;
  const clientPassword = 'password1234';

  await page.goto(`${baseURL}/templates`);
  await expect(page.getByRole('heading', { name: 'Nos modèles.' })).toBeVisible();

  const firstTemplateLink = page.locator('a[href^="/templates/"]').first();
  await expect(firstTemplateLink).toBeVisible();
  await firstTemplateLink.click();
  await expect(page).toHaveURL(/\/templates\/\d+$/);

  await page.getByRole('link', { name: /Commander/ }).first().click();
  await expect(page).toHaveURL(/\/commande\?templateId=\d+/);

  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByRole('button', { name: 'Inscription' }).click();

  await page.locator('input[placeholder="Jean Dupont"]').fill('Client E2E');
  await page.locator('input[placeholder="vous@exemple.com"]').fill(clientEmail);

  const registerPasswordInputs = page.locator('input[placeholder="••••••••"]');
  await registerPasswordInputs.first().fill(clientPassword);
  await registerPasswordInputs.nth(1).fill(clientPassword);
  await page.getByRole('button', { name: 'Créer mon compte' }).click();

  await expect(page.getByText('Détails de votre projet')).toBeVisible();
  await page.locator('input[placeholder="mon-restaurant.com"]').fill('e2e-client.frilo');
  await page.locator('textarea[placeholder*="Dites-nous en plus"]').fill(
    'Nous sommes un commerce local et nous voulons un site vitrine moderne.'
  );
  await page.locator('input[placeholder*="Bleu et Blanc"]').fill('Bleu, Blanc');
  await page.getByRole('button', { name: /Valider et continuer/ }).click();

  await expect(page.getByText('Paiement sécurisé')).toBeVisible();
  await page.getByRole('button', { name: /Valider la commande/ }).click();
  await expect(page.getByText('Commande confirmée.')).toBeVisible({ timeout: 20_000 });

  const orderRefText = (await page.getByText(/^#ORD-\d+$/).first().textContent()) || '';
  const orderIdMatch = orderRefText.match(/#ORD-(\d+)/);
  expect(orderIdMatch, 'Référence commande introuvable sur la page de confirmation').not.toBeNull();

  const orderId = (orderIdMatch?.[1] || '0').replace(/^0+/, '') || '0';
  const orderIdAdminDisplay = orderId.padStart(5, '0');
  const orderIdClientDisplay = orderId.padStart(4, '0');

  await page.goto(`${baseURL}/dashboard/orders`);
  await expect(page.getByText(new RegExp(`#${orderIdClientDisplay}`))).toBeVisible();
  await expect(page.getByText('En attente')).toBeVisible();

  const adminPage = await browser.newPage();
  await adminPage.goto(`${BACKEND_URL}/login`);
  await adminPage.locator('#email').fill('admin@frilo.com');
  await adminPage.locator('#password-input').fill('password');
  await adminPage.getByRole('button', { name: 'Se connecter' }).click();

  await adminPage.goto(`${BACKEND_URL}/admin/orders`);
  await expect(adminPage.getByRole('heading', { name: 'Commandes' })).toBeVisible();

  const orderRow = adminPage.locator('tr', { hasText: `#${orderIdAdminDisplay}` }).first();
  await expect(orderRow).toBeVisible();
  await orderRow.getByRole('link', { name: /Voir/ }).click();

  await expect(adminPage.getByText('Statut de la commande')).toBeVisible();
  await adminPage.getByRole('button', { name: /En cours/ }).click();
  await expect(adminPage.getByText('Statut mis à jour')).toBeVisible();

  await page.reload();
  await expect(page.getByText(new RegExp(`#${orderIdClientDisplay}`))).toBeVisible();
  await expect(page.getByText('En cours')).toBeVisible();
});
