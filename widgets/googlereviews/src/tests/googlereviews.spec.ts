import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

test.describe('Googlereviews Widget', () => {
    let googlereviews: Locator;

    test.beforeEach(async ({ page }) => {
        await page.goto('/?reactedge_debug=eager');
        googlereviews = page.locator('googlereviews-widget');
        await expect(googlereviews).toBeVisible();
    });

    test('Googlereviews widget renders its configured title', async () => {
        const title = googlereviews.locator(
            '[data-googlereviews-title]'
        );

        await expect(title).toBeVisible();
    });
});