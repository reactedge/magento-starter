import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";
import {WIDGET_ID} from "../src/Config";

test.describe('Product Gallery Widget', () => {
    let widget: Locator;

    test.beforeEach(async ({page}) => {
        await page.goto('/?reactedge_debug=eager');
        widget = page.locator(`${WIDGET_ID}-widget`);
        await expect(widget).toBeVisible();
    });

    test('mounts the custom element', async () => {
        await expect(widget).toBeVisible();
    });

    test('switches from tiled to classic view', async () => {
        const switchButton = widget.locator('[data-gallery-switch]');
        const tiledView = widget.locator('[data-gallery-tiled]');
        const classicView = widget.locator('[data-gallery-classic]');

        // Initial state
        await expect(switchButton).toBeVisible();
        await expect(tiledView).toBeVisible();
        await expect(classicView).toHaveCount(0); // better than "hidden" if not rendered

        // Switch
        await switchButton.click();

        // After switch: classic is visible, tiled is gone
        await expect(classicView).toBeVisible();
        await expect(tiledView).toHaveCount(0);
    });

    test('renders main image and thumbnails in classic view', async () => {
        const switchButton = widget.locator('[data-gallery-switch]');
        await switchButton.click();

        const mainImage = widget.locator('[data-gallery-main]');
        await expect(mainImage).toBeVisible();

        const thumbnails = widget.locator('[data-gallery-thumb]');
        await expect(thumbnails).toHaveCount(3);
        await expect(thumbnails.first()).toBeVisible();
    });

    test('renders tiled images in tiled view', async () => {
        const tiledView = widget.locator('[data-gallery-tiled]');
        await expect(tiledView).toBeVisible();

        // In tiled mode, classic elements should not exist
        await expect(widget.locator('[data-gallery-main]')).toHaveCount(0);
        await expect(widget.locator('[data-gallery-thumb]')).toHaveCount(0);

        // // And tiled tiles should exist (add a dedicated selector if you can)
        const tiles = widget.locator('[data-gallery-tile]');
        await expect(tiles).toHaveCount(3);
    });

    test('clicking a thumbnail updates the main image', async () => {
        const switchButton = widget.locator('[data-gallery-switch]');
        await switchButton.click(); // ensure classic mode

        const mainImage = widget.locator('[data-gallery-main]');
        const thumbnails = widget.locator('[data-gallery-thumb]');

        await expect(thumbnails).toHaveCount(3);

        const initialSrc = await mainImage.getAttribute('src');

        expect(initialSrc).not.toBeNull();

        if (initialSrc === null) {
            throw new Error("Expected gallery tile to have a src attribute");
        }

        // Click second thumbnail
        await thumbnails.nth(1).click();

        // Wait for update
        await expect(mainImage).not.toHaveAttribute('src', initialSrc);
    });

    test('next and prev arrow update the main image', async () => {
        const switchButton = widget.locator('[data-gallery-switch]');
        await switchButton.click(); // ensure classic mode

        const mainImage = widget.locator('[data-gallery-main]');
        const nextButton = widget.locator('[data-gallery-next]');

        const initialSrc = await mainImage.getAttribute('src');
        expect(initialSrc).not.toBeNull();

        if (initialSrc === null) {
            throw new Error("Expected gallery tile to have a src attribute");
        }

        await nextButton.click();
        await expect(mainImage).not.toHaveAttribute('src', initialSrc);

        const prevButton = widget.locator('[data-gallery-prev]');
        await prevButton.click();
        await expect(mainImage).toHaveAttribute('src', initialSrc);
    });

    test('clicking a tile enters zoom mode', async () => {
        const tiles = widget.locator('[data-gallery-tile]');
        await expect(tiles).toHaveCount(3);

        const firstTile = tiles.first();
        const tileSrc = await firstTile.getAttribute('src');

        expect(tileSrc).not.toBeNull();

        if (tileSrc === null) {
            throw new Error("Expected gallery tile to have a src attribute");
        }

        await firstTile.click();

        const zoomView = widget.locator('[data-gallery-zoom]');
        await expect(zoomView).toBeVisible();

        const mainImage = widget.locator('[data-gallery-main]');
        await expect(mainImage).toHaveAttribute('src', tileSrc);

        // Tiled view should be gone
        await expect(widget.locator('[data-gallery-tiled]')).toHaveCount(0);
    });

    test('zoom next arrow updates image', async () => {
        const tiles = widget.locator('[data-gallery-tile]');
        await tiles.first().click();

        const mainImage = widget.locator('[data-gallery-main]');
        const next = widget.locator('[data-gallery-next]');

        const initialSrc = await mainImage.getAttribute('src');

        expect(initialSrc).not.toBeNull();

        if (initialSrc === null) {
            throw new Error("Expected gallery tile to have a src attribute");
        }

        await next.click();

        await expect(mainImage).not.toHaveAttribute('src', initialSrc);
    });

    test('minify exits zoom mode and returns to tiled', async () => {
        const tiles = widget.locator('[data-gallery-tile]');
        await tiles.first().click();

        const minify = widget.locator('[data-gallery-minify]');
        await expect(minify).toBeVisible();

        await minify.click();

        await expect(widget.locator('[data-gallery-tiled]')).toBeVisible();
        await expect(widget.locator('[data-gallery-zoom]')).toHaveCount(0);
    });
});
