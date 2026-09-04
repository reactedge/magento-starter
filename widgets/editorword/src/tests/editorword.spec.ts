import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

test.describe('Editorword Widget', () => {
    let editorword: Locator;

    test.beforeEach(async ({ page }) => {
        await page.goto('/?reactedge_debug=eager');
        editorword = page.locator('editorword-widget');
        await expect(editorword).toBeVisible();
    });

    test('Editorword widget renders its configured title', async () => {
        const title = editorword.locator(
            '[data-editorword-title]'
        );

        await expect(title).toBeVisible();
    });

    test('Editorword widget renders the title colour', async () => {
        const title = editorword.locator(
            '[data-editorword-title]'
        );

        const colour = await title.evaluate(
            (element: HTMLElement) =>
                getComputedStyle(element).color
        );

        expect(colour).not.toBe('rgb(0, 0, 0)');
    });
});