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

    test('Googlereviews widget renders the title colour', async () => {
        const title = googlereviews.locator(
            '[data-googlereviews-title]'
        );

        const colour = await title.evaluate(
            element => getComputedStyle(element).color
        );

        expect(colour).not.toBe('rgb(0, 0, 0)');
    });

    test('Googlereviews widget renders product data', async () => {
        const product = googlereviews.locator(
            '[data-googlereviews-product]'
        );

        await expect(product).toBeVisible();

        await expect(
            product.getByText('SKU', { exact: true })
        ).toBeVisible();

        await expect(
            product.getByText('Name', { exact: true })
        ).toBeVisible();
    });

    test('Googlereviews widget loads product data from GraphQL', async () => {
        const product = googlereviews.locator(
            '[data-googlereviews-product]'
        );

        await expect(product).toBeVisible();

        const values = product.locator('dd');

        await expect(values).toHaveCount(2);
        await expect(values.nth(0)).toHaveText(/\S+/);
        await expect(values.nth(1)).toHaveText(/\S+/);
    });
});