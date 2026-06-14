import { expect, Page, test } from '@playwright/test';

async function quietBusinessApis(page: Page) {
  await page.route('**/api/frilo/testimonials**', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/frilo/faqs**', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/frilo/order-options**', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/frilo/sectors**', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/frilo/templates**', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/frilo/public/pricing**', (route) => route.fulfill({
    json: {
      currency_label: 'FCFA',
      starting_price: 50000,
      standard: {
        name: 'Standard',
        price: 50000,
        billing_label: 'Paiement unique',
        cta_label: 'Choisir',
        features: [],
      },
      premium: {
        name: 'Premium',
        price: 75000,
        billing_label: 'Paiement unique',
        cta_label: 'Choisir',
        features: [],
      },
    },
  }));
}

test('homepage shows editorial fallback when public content api is unavailable', async ({ page }) => {
  await quietBusinessApis(page);
  await page.route('**/api/frilo/public/content/home', (route) => route.fulfill({
    status: 500,
    json: { message: 'Indisponible' },
  }));

  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Envoyez vos infos/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Commencer avec un modèle/i }).first()).toBeVisible();
});

test('homepage renders safe free content blocks from public content api', async ({ page }) => {
  await quietBusinessApis(page);
  await page.route('**/api/frilo/public/content/home', (route) => route.fulfill({
    json: {
      page: {
        key: 'home',
        name: 'Accueil',
        route_pattern: '/',
        seo: {
          title: 'FRILO',
          description: 'Accueil FRILO',
          is_indexable: true,
        },
      },
      sections: [
        {
          key: 'home.hero',
          name: 'Hero',
          position: 10,
          renderer: 'home.hero',
          content: {
            eyebrow: 'Test éditorial',
            headline: 'Un accueil piloté depuis le backoffice.',
            description: 'Le contenu public peut changer sans dégrader la page.',
            primary_cta: { label: 'Voir les modèles', url: '/templates' },
            secondary_cta: { label: 'Voir les étapes', url: '/#how-it-works' },
          },
        },
      ],
      blocks: [
        {
          id: 91,
          anchor_section_key: 'home.hero',
          position: 10,
          layout: 'full_width',
          settings: {},
          content: {
            body: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Bloc éditorial libre affiché sans HTML brut.',
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
  }));

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Un accueil piloté depuis le backoffice.' })).toBeVisible();
  await expect(page.getByText('Bloc éditorial libre affiché sans HTML brut.')).toBeVisible();
});
