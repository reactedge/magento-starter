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
            element => getComputedStyle(element).color
        );

        expect(colour).not.toBe('rgb(0, 0, 0)');
    });

    test('Intentdiscovery widget renders product data', async () => {
        const product = intentdiscovery.locator(
            '[data-intentdiscovery-product]'
        );

        await expect(product).toBeVisible();

        await expect(
            product.getByText('SKU', { exact: true })
        ).toBeVisible();

        await expect(
            product.getByText('Name', { exact: true })
        ).toBeVisible();
    });

    test('Intentdiscovery widget loads product data from GraphQL', async () => {
        const product = intentdiscovery.locator(
            '[data-intentdiscovery-product]'
        );

        await expect(product).toBeVisible();

        const values = product.locator('dd');

        await expect(values).toHaveCount(2);
        await expect(values.nth(0)).toHaveText(/\S+/);
        await expect(values.nth(1)).toHaveText(/\S+/);
    });
});