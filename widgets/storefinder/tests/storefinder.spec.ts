import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

test.describe('Storefinder Widget', () => {
    let storefinder: Locator;

    test.beforeEach(async ({ page }) => {
        await page.goto('/?reactedge_debug=eager');
        storefinder = page.locator('storefinder-widget');
        await expect(storefinder).toBeVisible();
    });

    test('Storefinder widget renders its configured title', async () => {
        const title = storefinder.locator(
            '[data-storefinder-title]'
        );

        await expect(title).toBeVisible();
    });
});