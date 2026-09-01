import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

test.describe('Intentdiscovery Widget', () => {
    let intentdiscovery: Locator;

    test.beforeEach(async ({ page }) => {
        await page.goto('/?reactedge_debug=eager');
        intentdiscovery = page.locator('intentdiscovery-widget');
        await expect(intentdiscovery).toBeVisible();
    });

    test('Intentdiscovery widget renders its configured title', async () => {
        const title = intentdiscovery.locator(
            '[data-intentdiscovery-title]'
        );

        await expect(title).toBeVisible();
    });

    test('Intentdiscovery widget renders the title colour', async () => {
        const title = intentdiscovery.locator(
            '[data-intentdiscovery-title]'
        );

        const colour = await title.evaluate(
            (element: HTMLElement) =>
                getComputedStyle(element).color
        );

        expect(colour).not.toBe('rgb(0, 0, 0)');
    });
});