import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

test.describe('Sellerfinder Widget', () => {
    let sellerfinder: Locator;

    test.beforeEach(async ({ page }) => {
        await page.goto('/?reactedge_debug=eager');
        sellerfinder = page.locator('sellerfinder-widget');
        await expect(sellerfinder).toBeVisible();
    });

    test('Sellerfinder widget renders its configured title', async () => {
        const title = sellerfinder.locator(
            '[data-sellerfinder-title]'
        );

        await expect(title).toBeVisible();
    });

    test('Sellerfinder widget renders the title colour', async () => {
        const title = sellerfinder.locator(
            '[data-sellerfinder-title]'
        );

        const colour = await title.evaluate(
            (element: HTMLElement) =>
                getComputedStyle(element).color
        );

        expect(colour).not.toBe('rgb(0, 0, 0)');
    });
});