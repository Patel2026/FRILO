import { expect, test, type Page } from '@playwright/test';

async function registerClient(page: Page, baseURL: string, suffix: string) {
  await page.goto(`${baseURL}/register`);

  await page.locator('input[placeholder="Jean Dupont"]').fill(`Client ${suffix}`);
  await page.locator('input[placeholder="vous@exemple.com"]').fill(`client-${suffix}@frilo.test`);

  const passwordInputs = page.locator('input[placeholder="••••••••"]');
  await passwordInputs.first().fill('password1234');
  await passwordInputs.nth(1).fill('password1234');

  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test('public auth UX: user connecté voit Dashboard et auth routes redirigent', async ({ page, baseURL }) => {
  const appBaseURL = baseURL || 'http://localhost:3000';
  const suffix = Date.now().toString();

  await registerClient(page, appBaseURL, suffix);

  await page.goto(`${appBaseURL}/`);
  await expect(page.getByRole('link', { name: 'Dashboard' }).first()).toBeVisible();
  await expect(page.locator('a[href="/login"]')).toHaveCount(0);
  await expect(page.locator('a[href="/register"]')).toHaveCount(0);

  await page.goto(`${appBaseURL}/login`);
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto(`${appBaseURL}/register`);
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('tunnel commande: bypass étape auth pour client connecté', async ({ page, baseURL }) => {
  const appBaseURL = baseURL || 'http://localhost:3000';
  const suffix = (Date.now() + 1).toString();

  await registerClient(page, appBaseURL, suffix);

  await page.goto(`${appBaseURL}/templates`);
  const firstTemplateLink = page.locator('a[href^="/templates/"]').first();
  await expect(firstTemplateLink).toBeVisible();
  await firstTemplateLink.click();
  await expect(page).toHaveURL(/\/templates\/\d+$/);

  await page.getByRole('link', { name: /Commander/ }).first().click();
  await expect(page).toHaveURL(/\/commande\?templateId=\d+/);

  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page.getByText('Détails de votre projet')).toBeVisible();
  await expect(page.getByText('Connexion ou inscription')).toHaveCount(0);
});

test('contact: soumission réelle du formulaire', async ({ page, baseURL }) => {
  const appBaseURL = baseURL || 'http://localhost:3000';
  const suffix = (Date.now() + 2).toString();

  await page.goto(`${appBaseURL}/contact`);

  await page.locator('input[placeholder="Jean Dupont"]').fill(`Prospect ${suffix}`);
  await page.locator('input[placeholder="vous@exemple.com"]').fill(`prospect-${suffix}@frilo.test`);
  await page.locator('input[placeholder="+229 00 00 00 00"]').fill('+22997112233');
  await page.locator('input[placeholder="Mon entreprise"]').fill('Entreprise Prospect');
  await page.locator('input[placeholder="J\'ai une question sur…"]').fill('Question avant commande');
  await page.locator('textarea[placeholder="Dites-nous en plus sur votre projet…"]').fill(
    'Bonjour, je souhaite être rappelé pour choisir le template le plus adapté.'
  );

  await page.getByRole('button', { name: 'Envoyer' }).click();
  await expect(page.getByText('Message envoyé.')).toBeVisible();
});

test('dashboard: navigation vers détail commande client', async ({ page, baseURL }) => {
  const appBaseURL = baseURL || 'http://localhost:3000';
  const suffix = (Date.now() + 3).toString();

  await registerClient(page, appBaseURL, suffix);

  await page.goto(`${appBaseURL}/templates`);
  const firstTemplateLink = page.locator('a[href^="/templates/"]').first();
  await expect(firstTemplateLink).toBeVisible();
  await firstTemplateLink.click();
  await expect(page).toHaveURL(/\/templates\/\d+$/);

  await page.getByRole('link', { name: /Commander/ }).first().click();
  await expect(page).toHaveURL(/\/commande\?templateId=\d+/);

  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page.getByText('Détails de votre projet')).toBeVisible();

  await page.locator('input[placeholder="mon-restaurant.com"]').fill('client-dashboard.frilo');
  await page.locator('textarea[placeholder*="Dites-nous en plus"]').fill(
    'Commande de test e2e pour vérifier la navigation vers le détail.'
  );
  await page.locator('input[placeholder*="Bleu et Blanc"]').fill('Noir, Blanc');
  await page.getByRole('button', { name: /Valider et continuer/ }).click();

  await page.getByRole('button', { name: /Valider la commande/ }).click();
  await expect(page.getByText('Commande confirmée.')).toBeVisible({ timeout: 20_000 });

  const orderRefText = (await page.getByText(/^#ORD-\d+$/).first().textContent()) || '';
  const orderIdMatch = orderRefText.match(/#ORD-(\d+)/);
  expect(orderIdMatch).not.toBeNull();
  const orderId = (orderIdMatch?.[1] || '0').replace(/^0+/, '') || '0';

  await page.getByRole('link', { name: 'Suivre ma commande' }).click();
  await expect(page).toHaveURL(/\/dashboard\/orders$/);

  const orderRowLink = page.locator(`a[href="/dashboard/orders/${orderId}"]`).first();
  await expect(orderRowLink).toBeVisible();
  await orderRowLink.click();

  await expect(page).toHaveURL(new RegExp(`/dashboard/orders/${orderId}$`));
  await expect(page.getByRole('heading', { level: 1, name: new RegExp(`#${String(Number(orderId)).padStart(4, '0')}`) })).toBeVisible();
  await expect(page.getByText('Instructions client')).toBeVisible();
});
