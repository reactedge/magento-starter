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
            element => getComputedStyle(element).color
        );

        expect(colour).not.toBe('rgb(0, 0, 0)');
    });

    test('__WIDGET_PASCAL_NAME__ widget renders product data', async () => {
        const product = __WIDGET_NAME__.locator(
            '[data-__WIDGET_NAME__-product]'
        );

        await expect(product).toBeVisible();

        await expect(
            product.getByText('SKU', { exact: true })
        ).toBeVisible();

        await expect(
            product.getByText('Name', { exact: true })
        ).toBeVisible();
    });

    test('__WIDGET_PASCAL_NAME__ widget loads product data from GraphQL', async () => {
        const product = __WIDGET_NAME__.locator(
            '[data-__WIDGET_NAME__-product]'
        );

        await expect(product).toBeVisible();

        const values = product.locator('dd');

        await expect(values).toHaveCount(2);
        await expect(values.nth(0)).toHaveText(/\S+/);
        await expect(values.nth(1)).toHaveText(/\S+/);
    });
});