import { expect, test, type Page } from '@playwright/test';

async function openImmersivePreview(page: Page, appBaseURL: string): Promise<void> {
  await page.goto(`${appBaseURL}/templates`);

  const firstTemplateLink = page.locator('a[href^="/templates/"]').first();
  await expect(firstTemplateLink).toBeVisible();
  await firstTemplateLink.click();
  await expect(page).toHaveURL(/\/templates\/\d+$/);

  const immersiveLink = page.getByRole('link', { name: /Démo immersive/i }).first();
  await immersiveLink.scrollIntoViewIfNeeded();
  await expect(immersiveLink).toBeVisible();
  await immersiveLink.click();

  await expect(page).toHaveURL(/\/templates\/\d+\/preview$/);
}

test('preview immersive desktop: navigation sections + rendu iframe', async ({ page, baseURL }) => {
  const appBaseURL = baseURL || 'http://localhost:3000';
  await openImmersivePreview(page, appBaseURL);

  await expect(page.getByRole('button', { name: 'Desktop' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mobile' })).toBeVisible();

  await page.getByTestId('immersive-page-services').click();
  const iframe = page.locator('iframe[title^="Demo"]').first();
  await expect(iframe).toHaveAttribute('src', /\/services$/);

  await page.getByTestId('immersive-page-contact').click();
  await expect(iframe).toHaveAttribute('src', /\/contact$/);
  await expect(
    page.frameLocator('iframe[title^="Demo"]').getByRole('heading', { name: 'Contact' })
  ).toBeVisible({ timeout: 20_000 });
});

test('preview immersive mobile: navigation contact + interaction dans la démo', async ({ page, baseURL }) => {
  const appBaseURL = baseURL || 'http://localhost:3000';
  await page.setViewportSize({ width: 390, height: 844 });
  await openImmersivePreview(page, appBaseURL);

  await expect(page.getByRole('button', { name: 'Desktop' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Mobile' })).toHaveCount(0);

  await page.getByTestId('immersive-page-contact').click();
  const iframe = page.locator('iframe[title^="Demo"]').first();
  await expect(iframe).toHaveAttribute('src', /\/contact$/);

  const demo = page.frameLocator('iframe[title^="Demo"]');
  await expect(demo.getByRole('heading', { name: 'Contact' })).toBeVisible({ timeout: 20_000 });
  const nameInput = demo.getByPlaceholder('Nom');
  await nameInput.fill('Client Test');
  await expect(nameInput).toHaveValue('Client Test');
});
