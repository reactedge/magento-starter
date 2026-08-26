import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

test.describe('__WIDGET_PASCAL_NAME__ Widget', () => {
    let __WIDGET_NAME__: Locator;

    test.beforeEach(async ({ page }) => {
        await page.goto('/?reactedge_debug=eager');
        __WIDGET_NAME__ = page.locator('__WIDGET_NAME__-widget');
        await expect(__WIDGET_NAME__).toBeVisible();
    });

    test('__WIDGET_PASCAL_NAME__ widget renders its configured title', async () => {
        const title = __WIDGET_NAME__.locator(
            '[data-__WIDGET_NAME__-title]'
        );

        await expect(title).toBeVisible();
    });

    test('__WIDGET_PASCAL_NAME__ widget renders the title colour', async () => {
        const title = __WIDGET_NAME__.locator(
            '[data-__WIDGET_NAME__-title]'
        );

        const colour = await title.evaluate(
            (element: HTMLElement) =>
                getComputedStyle(element).color
        );

        expect(colour).not.toBe('rgb(0, 0, 0)');
    });
});