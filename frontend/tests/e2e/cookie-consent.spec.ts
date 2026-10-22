import { expect, test, type Page } from '@playwright/test';

test.use({ video: 'off' });

const key = 'frilo.cookie-consent.v1';
const banner = (page: Page) => page.getByRole('region', { name: 'Préférences de cookies' });

for (const mobile of [false, true]) {
  test.describe(mobile ? 'cookies mobile' : 'cookies desktop', () => {
    test.use({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 } });
    for (const action of ['accept', 'refuse', 'custom'] as const) {
      for (const blocked of [false, true]) {
        test(`${action}, storage ${blocked ? 'blocked' : 'available'}`, async ({ page }) => {
          const errors: string[] = [];
          page.on('pageerror', error => errors.push(error.message));
          if (blocked) {
            await page.addInitScript(() => {
              Storage.prototype.setItem = () => { throw new DOMException('Storage blocked', 'QuotaExceededError'); };
            });
          }
          await page.goto('/');
          await expect(banner(page)).toBeVisible();
          if (action === 'custom') {
            await banner(page).getByRole('button', { name: 'Gérer les paramètres' }).click();
            await expect(banner(page).getByRole('button', { name: /Cookies nécessaires/ })).toBeDisabled();
            const audience = banner(page).getByRole('button', { name: /Mesure d’audience/ });
            const personalization = banner(page).getByRole('button', { name: /Personnalisation/ });
            await expect(audience).toHaveAttribute('aria-pressed', 'false');
            await audience.click();
            await expect(audience).toHaveAttribute('aria-pressed', 'true');
            await personalization.click();
            await expect(personalization).toHaveAttribute('aria-pressed', 'true');
            await personalization.click();
            await expect(personalization).toHaveAttribute('aria-pressed', 'false');
            await banner(page).getByRole('button', { name: 'Enregistrer' }).click();
          } else {
            await banner(page).getByRole('button', { name: action === 'accept' ? 'Accepter' : 'Tout refuser', exact: true }).click();
          }
          await expect(banner(page)).toHaveCount(0);
          if (!blocked) {
            const consent = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)!), key);
            expect(consent.choice).toBe({ accept: 'accepted', refuse: 'refused', custom: 'custom' }[action]);
            expect(consent.preferences).toEqual({ necessary: true, analytics: action !== 'refuse', personalization: action === 'accept' });
            await page.reload();
            await expect(banner(page)).toHaveCount(0);
            // Wait for hydration so a server/client mismatch cannot pass unnoticed.
            await page.waitForLoadState('networkidle');
          } else {
            await page.reload();
            await expect(banner(page)).toBeVisible();
          }
          expect(errors).toEqual([]);
        });
      }
    }
  });
}
