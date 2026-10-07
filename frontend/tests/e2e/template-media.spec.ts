import { expect, test } from '@playwright/test';

const demoUrl = 'https://demo.example.com/theme/index.html?theme=food#home';
const thumbnail = 'https://media.example.com/storage/templates/demo.png';
const template = {
  id: 99001, name: 'External demo', slug: 'external-demo', description: 'Demo',
  price: 50000, features: [], thumbnail: 'templates/demo.png', full_thumbnail_url: thumbnail,
  preview_url: demoUrl, preview_mode: 'external', preview_pages: [], preview_gallery: [],
  is_active: true, sector_id: 1, sector: { id: 1, name: 'Services', slug: 'services' },
};

test.beforeEach(async ({ page, context }) => {
  await page.route('https://media.example.com/**', route => route.fulfill({
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWZkAAAAASUVORK5CYII=', 'base64'),
  }));
  await context.route('https://demo.example.com/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>External demo</h1>' }));
  await page.route('**/templates/99001', route => route.request().resourceType() === 'document'
    ? route.continue() : route.fulfill({ json: template }));
  await page.route('**/templates/99001/reviews*', route => route.fulfill({ json: { data: [], summary: { average_rating: 0, reviews_count: 0 } } }));
});

for (const suffix of ['', '/preview']) {
  test(`external demo shows thumbnail and direct link on ${suffix || 'detail'}`, async ({ page }) => {
    await page.goto(`/templates/99001${suffix}`);
    const link = page.getByRole('link', { name: 'Ouvrir la démo dans un nouvel onglet' });
    await expect(link).toHaveAttribute('href', demoUrl);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(page.locator('iframe')).toHaveCount(0);
    const image = page.getByRole('img', { name: 'Aperçu de External demo', exact: true });
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  });

  test(`embedded demo keeps exact URL and direct fallback on ${suffix || 'detail'}`, async ({ page }) => {
    await page.route('**/templates/99001', route => route.request().resourceType() === 'document'
      ? route.continue() : route.fulfill({ json: { ...template, preview_mode: 'iframe' } }));
    await page.goto(`/templates/99001${suffix}`);
    await expect(page.locator('iframe')).toHaveAttribute('src', demoUrl);
    await expect(page.getByRole('link', { name: 'Ouvrir la démo dans un nouvel onglet' })).toHaveAttribute('href', demoUrl);
  });
}

test('catalogue displays uploaded thumbnail from backend host', async ({ page }) => {
  await page.route('**/templates', route => route.request().resourceType() === 'document'
    ? route.continue() : route.fulfill({ json: [template] }));
  await page.route('**/sectors', route => route.fulfill({ json: [] }));
  const imageResponse = page.waitForResponse(thumbnail);
  await page.goto('/templates');
  await expect(page.getByText('External demo', { exact: true }).first()).toBeVisible();
  expect((await imageResponse).ok()).toBe(true);
  await expect(page.locator('[style*="media.example.com"]').first()).toBeVisible();
});

test('mobile external preview opens the exact demo in a new tab', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/templates/99001/preview');
  const link = page.getByRole('link', { name: 'Ouvrir la démo dans un nouvel onglet' });
  await expect(link).toBeVisible();
  await page.screenshot({ path: '/tmp/frilo-external-preview-mobile.png' });
  const popupPromise = page.waitForEvent('popup');
  await link.click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(demoUrl);
});
