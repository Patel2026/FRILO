import { expect, test, type Page } from '@playwright/test';

const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:8080';

async function registerClient(page: Page, baseURL: string, suffix: string) {
  await page.goto(`${baseURL}/register`);

  await page.locator('input[placeholder="Jean Dupont"]').fill(`Client ${suffix}`);
  await page.locator('input[placeholder="vous@exemple.com"]').fill(`client-${suffix}@frilo.test`);
  await page.locator('select').first().selectOption({ index: 1 });

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

  await expect(page.getByRole('heading', { name: 'Adaptons ce modèle à votre activité.' })).toBeVisible();
  await expect(page.getByText('Avant de vérifier')).toHaveCount(0);
});

test('contact: soumission réelle du formulaire', async ({ page, baseURL }) => {
  const appBaseURL = baseURL || 'http://localhost:3000';
  const suffix = (Date.now() + 2).toString();

  await page.goto(`${appBaseURL}/contact`);

  await page.locator('input[placeholder="Jean Dupont"]').fill(`Prospect ${suffix}`);
  await page.locator('input[placeholder="vous@exemple.com"]').fill(`prospect-${suffix}@frilo.test`);
  await page.locator('input[placeholder="+229 00 00 00 00"]').fill('+22997112233');
  await page.locator('input[placeholder="Mon entreprise"]').fill('Entreprise Prospect');
  await page.locator('input[placeholder="#ORD-00042"]').fill('#ORD-00042');
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

  await page.locator('input[placeholder="Ex : Maison Adja"]').fill('Client Dashboard');
  await page.locator('textarea[placeholder*="Que vendez-vous"]').fill(
    'Commande de test e2e pour vérifier la navigation vers le détail.'
  );
  await page.locator('input[placeholder*="Sobre, noir et rouge"]').fill('Noir, Blanc');
  await page.getByRole('button', { name: /Vérifier ma commande/ }).click();

  await page.getByRole('button', { name: /Continuer vers le paiement/ }).click();
  await page.getByRole('button', { name: /Payer maintenant/ }).click();
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

test('profil client: mise à jour name/email self-service', async ({ page, baseURL }) => {
  const appBaseURL = baseURL || 'http://localhost:3000';
  const suffix = (Date.now() + 4).toString();
  const updatedSuffix = (Date.now() + 5).toString();

  await registerClient(page, appBaseURL, suffix);

  await page.goto(`${appBaseURL}/dashboard/profile`);
  await expect(page.getByRole('heading', { name: 'Mon profil' })).toBeVisible();

  const nameInput = page.locator('#profile-name');
  const emailInput = page.locator('#profile-email');

  await nameInput.fill(`Client Modifié ${updatedSuffix}`);
  await emailInput.fill(`client-modifie-${updatedSuffix}@frilo.test`);

  await page.getByRole('button', { name: 'Enregistrer les modifications' }).click();
  await expect(page.getByText('Profil mis à jour avec succès.')).toBeVisible();
  await expect(nameInput).toHaveValue(`Client Modifié ${updatedSuffix}`);
  await expect(emailInput).toHaveValue(`client-modifie-${updatedSuffix}@frilo.test`);
});

test('catalogue templates: recherche + état vide guidé + reset filtres', async ({ page, baseURL }) => {
  const appBaseURL = baseURL || 'http://localhost:3000';

  await page.goto(`${appBaseURL}/templates`);
  await expect(page.getByRole('heading', { name: 'Nos modèles.' })).toBeVisible();

  const searchInput = page.locator('#templates-search');

  await searchInput.fill('ImmoPrestige');
  await expect(page.getByRole('link', { name: /ImmoPrestige/ }).first()).toBeVisible();

  await searchInput.fill('zzzz-template-introuvable');
  await expect(page.getByText('Aucun modèle ne correspond à vos filtres.')).toBeVisible();

  await page.getByRole('button', { name: 'Réinitialiser les filtres' }).first().click();
  await expect(page.getByRole('link', { name: /Le Gourmet/ }).first()).toBeVisible();
});

test('détail template: preuves métier + FAQ interactive + CTA mobile', async ({ page, baseURL }) => {
  const appBaseURL = baseURL || 'http://localhost:3000';

  await page.goto(`${appBaseURL}/templates`);
  const firstTemplateLink = page.locator('a[href^="/templates/"]').first();
  await expect(firstTemplateLink).toBeVisible();
  await firstTemplateLink.click();
  await expect(page).toHaveURL(/\/templates\/\d+$/);

  await expect(page.getByText('Engagements FRILO V1')).toBeVisible();
  await expect(page.getByText('2 cycles de révision inclus')).toBeVisible();

  const faqTrigger = page.getByRole('button', { name: 'Comment se passent les révisions ?' });
  await faqTrigger.click();
  await expect(page.getByText('Vous disposez de 2 cycles de retours inclus.')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('link', { name: /^Commander$/ })).toBeVisible();
});

test('P2 templates: favoris et comparaison locale', async ({ page, baseURL }) => {
  const appBaseURL = baseURL || 'http://localhost:3000';

  await page.goto(`${appBaseURL}/templates`);
  await expect(page.getByRole('heading', { name: 'Nos modèles.' })).toBeVisible();

  const favoriteButtons = page.locator('[data-testid^="template-favorite-"]');
  await expect(favoriteButtons.first()).toBeVisible();
  await favoriteButtons.first().click();

  await page.getByRole('button', { name: /Favoris/ }).click();
  await expect(page.locator('[data-testid^="template-favorite-"]')).toHaveCount(1);
  await expect(page.locator('[data-testid^="template-favorite-"][aria-pressed="true"]')).toHaveCount(1);

  await page.getByRole('button', { name: /Favoris/ }).click();

  const compareButtons = page.locator('[data-testid^="template-compare-"]');
  await expect(compareButtons.nth(1)).toBeVisible();
  await compareButtons.first().click();
  await compareButtons.nth(1).click();

  const compareLink = page.getByRole('link', { name: /Comparer \(2\)/ });
  await expect(compareLink).toBeVisible();
  await compareLink.click();

  await expect(page).toHaveURL(/\/templates\/compare/);
  await expect(page.getByRole('heading', { name: 'Comparez vos modèles.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Commander' }).first()).toBeVisible();
});

test('P2 analytics funnel: événements view_template et start_order stockés localement', async ({ page, baseURL }) => {
  const appBaseURL = baseURL || 'http://localhost:3000';

  await page.goto(`${appBaseURL}/templates`);
  await page.evaluate(() => localStorage.removeItem('frilo.analytics.funnel.v1'));

  const firstTemplateLink = page.locator('a[href^="/templates/"]').first();
  await expect(firstTemplateLink).toBeVisible();
  await firstTemplateLink.click();
  await expect(page).toHaveURL(/\/templates\/\d+$/);

  await expect.poll(async () => {
    return page.evaluate(() => {
      const raw = localStorage.getItem('frilo.analytics.funnel.v1');
      const events = raw ? JSON.parse(raw) : [];
      return events.some((event: { name?: string }) => event?.name === 'view_template');
    });
  }).toBe(true);

  await page.getByRole('link', { name: /Commander/ }).first().click();
  await expect(page).toHaveURL(/\/commande\?templateId=\d+/);

  await page.locator('input[placeholder="Ex : Maison Adja"]').fill('Test Analytics');
  await page.locator('textarea[placeholder*="Que vendez-vous"]').fill(
    'Activité de test pour vérifier le suivi du parcours de commande.'
  );
  await page.getByRole('button', { name: /Vérifier ma commande/ }).click();

  await expect.poll(async () => {
    return page.evaluate(() => {
      const raw = localStorage.getItem('frilo.analytics.funnel.v1');
      const events = raw ? JSON.parse(raw) : [];
      return events.some((event: { name?: string }) => event?.name === 'start_order');
    });
  }).toBe(true);
});

test('tunnel commande: échec auth affiche un message explicite', async ({ page, baseURL }) => {
  const appBaseURL = baseURL || 'http://localhost:3000';

  await page.goto(`${appBaseURL}/templates`);
  const firstTemplateLink = page.locator('a[href^="/templates/"]').first();
  await expect(firstTemplateLink).toBeVisible();
  await firstTemplateLink.click();
  await expect(page).toHaveURL(/\/templates\/\d+$/);

  await page.getByRole('link', { name: /Commander/ }).first().click();
  await expect(page).toHaveURL(/\/commande\?templateId=\d+/);

  await page.locator('input[placeholder="Ex : Maison Adja"]').fill('Test Auth');
  await page.locator('textarea[placeholder*="Que vendez-vous"]').fill(
    'Activité de test pour vérifier le message en cas d’échec de connexion.'
  );
  await page.getByRole('button', { name: /Vérifier ma commande/ }).click();
  await expect(page.getByText('Avant de vérifier')).toBeVisible();

  await page.locator('input[placeholder="vous@exemple.com"]').fill(`invalide-${Date.now()}@frilo.test`);
  await page.locator('input[placeholder="••••••••"]').first().fill('motdepasse-invalide');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await expect(page.getByText('Email ou mot de passe incorrect.')).toBeVisible();
});

test('catalogue public: template inactif non visible et inaccessible', async ({ page, browser, baseURL }) => {
  const appBaseURL = baseURL || 'http://localhost:3000';
  const suffix = Date.now();
  const templateName = `Template Inactif ${suffix}`;

  const adminPage = await browser.newPage();
  await adminPage.goto(`${BACKEND_URL}/login`);
  await adminPage.locator('#email').fill('admin@frilo.com');
  await adminPage.locator('#password-input').fill('password');
  await adminPage.getByRole('button', { name: 'Se connecter' }).click();

  await adminPage.goto(`${BACKEND_URL}/admin/templates/create`);
  await expect(adminPage.getByRole('heading', { name: 'Nouveau template' })).toBeVisible();
  await adminPage.selectOption('select[name="sector_id"]', { index: 1 });
  await adminPage.locator('input[name="name"]').fill(templateName);
  await adminPage.locator('textarea[name="description"]').fill('Template E2E inactif pour validation du catalogue public.');
  await adminPage.locator('input[name="price"]').fill('49000');
  await adminPage.locator('textarea[name="features_raw"]').fill('Landing page\nFormulaire de contact');
  await adminPage.locator('#is_active').uncheck();
  await adminPage.getByRole('button', { name: 'Créer le template' }).click();

  await expect(adminPage.getByText('Template créé.')).toBeVisible();
  const createdRow = adminPage.locator('tr', { hasText: templateName }).first();
  await expect(createdRow).toBeVisible();
  await expect(createdRow.locator('span.badge-soft-danger', { hasText: 'Inactif' })).toBeVisible();

  const editHref = await createdRow
    .locator('a[href*="/admin/templates/"][href$="/edit"]')
    .first()
    .getAttribute('href');
  expect(editHref).not.toBeNull();
  const idMatch = editHref?.match(/\/admin\/templates\/(\d+)\/edit$/);
  expect(idMatch).not.toBeNull();
  const templateId = idMatch?.[1] || '0';
  await adminPage.close();

  await page.goto(`${appBaseURL}/templates`);
  await page.locator('#templates-search').fill(templateName);
  await expect(page.getByText('Aucun modèle ne correspond à vos filtres.')).toBeVisible();
  await expect(page.locator(`a[href="/templates/${templateId}"]`)).toHaveCount(0);

  await page.goto(`${appBaseURL}/templates/${templateId}`);
  await expect(page.getByText('Modèle introuvable.')).toBeVisible();
});
