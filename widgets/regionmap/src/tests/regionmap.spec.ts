import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

test.describe('Regionmap Widget', () => {
    let regionmap: Locator;

    test.beforeEach(async ({ page }) => {
        await page.goto('/?reactedge_debug=eager');
        regionmap = page.locator('regionmap-widget');
        await expect(regionmap).toBeVisible();
    });

    test('Regionmap widget renders its configured title', async () => {
        const title = regionmap.locator(
            '[data-regionmap-title]'
        );

        await expect(title).toBeVisible();
    });

    test('Regionmap widget renders the title colour', async () => {
        const title = regionmap.locator(
            '[data-regionmap-title]'
        );

        const colour = await title.evaluate(
            (element: HTMLElement) =>
                getComputedStyle(element).color
        );

        expect(colour).not.toBe('rgb(0, 0, 0)');
    });
});