import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

test.describe('Contactus Widget', () => {
    let contactus: Locator;

    test.beforeEach(async ({ page }) => {
        await page.goto('/?reactedge_debug=eager');
        contactus = page.locator('contactus-widget');
        await expect(contactus).toBeVisible();
    });

    test('Contactus widget renders its configured title', async () => {
        const title = contactus.locator(
            '[data-contactus-title]'
        );

        await expect(title).toBeVisible();
    });

    test('Contactus widget renders the title colour', async () => {
        const title = contactus.locator(
            '[data-contactus-title]'
        );

        const colour = await title.evaluate(
            (element: HTMLElement) =>
                getComputedStyle(element).color
        );

        expect(colour).not.toBe('rgb(0, 0, 0)');
    });
});