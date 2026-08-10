import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";
import {WIDGET_ID} from "../src/Config";

test.describe('Megamenu widget (WordPress embed)', () => {
    let widget: Locator;

    test.beforeEach(async ({page}) => {
        await page.goto('/?reactedge_debug=eager');
        widget = page.locator(`${WIDGET_ID}-widget`);
        await expect(widget).toBeVisible();
    });

    test('Megamenu widget mounts', async () => {
        await expect(widget).toBeAttached();
    });

    test('Megamenu renders top-level items', async () => {
        await expect(widget.getByText('Men').first()).toBeVisible();
        await expect(widget.getByText('Women')).toBeVisible();
    });

    test('Megamenu renders CTA item', async () => {
        const cta = widget.getByText('Gear');
        await expect(cta).toBeVisible();
    });

    test('Megamenu shows submenu on interaction', async () => {
        await widget.getByText('Women').click();
        await expect(widget.getByText('Bras & Tanks')).toBeVisible();
    });
});