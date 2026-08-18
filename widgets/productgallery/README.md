# ReactEdge – Product Gallery Widget

An embeddable **Product Gallery widget** designed to integrate safely into existing websites without owning the page or application lifecycle.

This repository is part of the **ReactEdge** series — a collection of frontend widgets built around a consistent embedding contract, strict isolation discipline, and predictable behaviour.

The widget is independently built and deployable product gallery that can replace the
native product-media presentation on a Magento / Mage-OS product detail page.

Product Gallery is the reference ReactEdge widget: it demonstrates how a
meaningful storefront capability can have its own frontend implementation,
tests and deployment lifecycle while remaining integrated with the host
commerce application.

---

## Capabilities

- Standard gallery with main image and thumbnails
- Tiled product-image layout
- Fullscreen/zoom navigation
- Magento product imagery through GraphQL
- Configurable-product image selection
- Server-side rendering
- Client-side hydration
- External product-selection signals
- Independent build and deployment
- Magento configuration-controlled enable/disable

Gallery mode is configured through the widget contract. It is not switched
by the shopper at runtime.

## Magento integration

When Product Gallery is disabled, the native Magento/Hyvä product gallery
remains in place.

When Product Gallery is enabled, the supplied WidgetBridge integration
replaces the native product-media capability with ReactEdge Product Gallery.

This does not require changes to Magento core, database schema, or the
host theme template.

Product data is retrieved through the configured Magento GraphQL integration.
The host storefront can propagate configurable-product selections to the
widget through ReactEdgeSignals.

Example:

    ReactEdgeSignals.emit({
        type: "product_attribute_changed",
        code: "color",
        value: "57"
    });

The gallery responds to the selection and incorporates the corresponding
product imagery.

## Rendering modes

### Gallery

Displays a primary image with thumbnail navigation.

### Tile

Displays product imagery as a configurable tiled grid. Selecting an image
opens the zoom view with previous/next navigation.

For products containing only one image, the image is rendered directly
rather than presenting unnecessary gallery controls.

## Local Development

For all the commands below, we assume we are in the widget folder

```bash
cd widgets/productgallery
```

Install dependencies:

```bash
npm ci
```

Run locally:

```bash
npm run dev
```

To run the widget in SSR mode:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npx tsx  \
   --tsconfig widgets/productgallery/tsconfig.app.json  \
   packages/widget-build/ssr-generation/render-page.ts \
   productgallery  \
   widgets/productgallery/public/default.json
```

To run the test suite:
Run tests:

```bash
npx playwright test   --config=../../tests/playwright.dev.config.ts   tests/productgallery.spec.ts
```

---

## Building for Production

```bash
npm run build
```

This produces a versioned JavaScript artefact in the `workspace/source/` directory:
The widget runs as a static asset and does not require a backend runtime once built.

---

