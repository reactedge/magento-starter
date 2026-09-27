import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { applyConfiguration, previewConfiguration, readConfiguration, retainAdvancedSsrSettings } from './configuration.ts';

test('preview and save cover all configuration outputs without touching a real host', () => {
    const root = mkdtempSync(join(tmpdir(), 'reactedge-config-'));
    const targetParent = mkdtempSync(join(tmpdir(), 'reactedge-target-'));
    try {
        mkdirSync(join(root, 'workspace.sample'), { recursive: true });
        writeFileSync(join(root, 'workspace.sample/registry.json'), '{}');
        mkdirSync(join(root, 'widgets/usp/public'), { recursive: true });
        mkdirSync(join(root, 'packages/widget-template/runtime/public'), { recursive: true });
        writeFileSync(join(root, '.env.sample'), 'SITEURL=https://example.org\nALLOWED_HOSTS=localhost\n');
        const config = {
            ...readConfiguration(root, 'fr'), targetRoot: join(targetParent, 'magento'),
            siteUrl: 'https://example.org/', observabilityEnabled: true, turnstileEnabled: true,
            turnstileSiteKey: 'site-key', googleMapsEnabled: true, googleReviewsEnabled: true,
            googleMapsApiKey: 'a"b\\c', googlePlaceId: 'place-123',
        };
        const preview = previewConfiguration(root, config);
        assert.equal(preview.workspace, 'create from sample');
        assert.ok(preview.changed.includes('widgets/usp/public/reactedge-runtime.json'));
        assert.ok(preview.changed.includes('services/orchestrator/.env.fr'));
        assert.throws(() => readFileSync(join(root, '.env.fr')));
        applyConfiguration(root, config);
        assert.deepEqual(JSON.parse(readFileSync(join(root, 'widgets/usp/public/reactedge-runtime.json'), 'utf8')).integrations.googleMaps,
            { apiKey: 'a"b\\c', placeId: 'place-123' });
        assert.equal(readFileSync(join(root, 'workspace/fr/registry.json'), 'utf8'), '{}');
        assert.equal(readConfiguration(root, 'fr').googleMapsApiKey, 'a"b\\c');
        assert.equal(previewConfiguration(root, config).changed.length, 0);
    } finally {
        rmSync(root, { recursive: true, force: true });
        rmSync(targetParent, { recursive: true, force: true });
    }
});

test('rejects unsafe store paths and incomplete optional services before writing', () => {
    const root = mkdtempSync(join(tmpdir(), 'reactedge-config-'));
    try {
        mkdirSync(join(root, 'workspace.sample'));
        writeFileSync(join(root, 'workspace.sample/registry.json'), '{}');
        const defaults = readConfiguration(root, 'default');
        assert.throws(() => previewConfiguration(root, { ...defaults, storeCode: '../other' }), /Store code/);
        assert.throws(() => previewConfiguration(root, { ...defaults, googleReviewsEnabled: true }), /Google Maps/);
        assert.throws(() => previewConfiguration(root, { ...defaults, targetRoot: 'relative/path' }), /absolute/);
        assert.throws(() => previewConfiguration(root, { ...defaults, category: "one' two" }), /apostrophe/);
    } finally { rmSync(root, { recursive: true, force: true }); }
});

test('sites without a catalog do not require or write demo SKU and category', () => {
    const root = mkdtempSync(join(tmpdir(), 'reactedge-config-'));
    const targetParent = mkdtempSync(join(tmpdir(), 'reactedge-target-'));
    try {
        mkdirSync(join(root, 'workspace.sample'));
        mkdirSync(join(root, 'widgets/usp/public'), { recursive: true });
        writeFileSync(join(root, 'workspace.sample/registry.json'), '{}');
        const defaults = readConfiguration(root, 'site');
        assert.throws(() => previewConfiguration(root, { ...defaults, sku: '', category: '' }), /catalog/);
        const config = { ...defaults, hasCatalog: false, sku: '', category: '', targetRoot: join(targetParent, 'site') };
        assert.match(previewConfiguration(root, config).note, /Catalog widgets/);
        applyConfiguration(root, config);
        const env = readFileSync(join(root, '.env.site'), 'utf8');
        assert.match(env, /CATALOG_ENABLED='0'/);
        assert.doesNotMatch(env, /^SKU=|^CATEGORY=/m);
        const runtime = JSON.parse(readFileSync(join(root, 'widgets/usp/public/reactedge-runtime.json'), 'utf8'));
        assert.deepEqual(runtime.context, { storeCode: 'site' });
        assert.equal(readConfiguration(root, 'site').hasCatalog, false);
    } finally {
        rmSync(root, { recursive: true, force: true });
        rmSync(targetParent, { recursive: true, force: true });
    }
});

test('hidden SSR settings survive saving other fields and disabling SSR', () => {
    const root = mkdtempSync(join(tmpdir(), 'reactedge-config-'));
    const targetParent = mkdtempSync(join(tmpdir(), 'reactedge-target-'));
    try {
        mkdirSync(join(root, 'workspace.sample'));
        writeFileSync(join(root, 'workspace.sample/registry.json'), '{}');
        writeFileSync(join(root, '.env.site'), "SSR_PORT='4501'\nSSR_BASE_URL='https://legacy.example/ssr'\nSSR_ENABLED='1'\n");
        const submitted: Record<string, unknown> = {
            ...readConfiguration(root, 'site'), ssrEnabled: false, category: 'new-category', targetRoot: join(targetParent, 'site'),
        };
        delete submitted.ssrPort;
        delete submitted.ssrBaseUrl;
        applyConfiguration(root, retainAdvancedSsrSettings(root, submitted));
        const env = readFileSync(join(root, '.env.site'), 'utf8');
        assert.match(env, /SSR_ENABLED='0'/);
        assert.match(env, /SSR_PORT='4501'/);
        assert.match(env, /SSR_BASE_URL='https:\/\/legacy.example\/ssr'/);
        assert.match(readFileSync(join(root, 'services/ssr/.env'), 'utf8'), /SSR_PORT='4501'/);
    } finally {
        rmSync(root, { recursive: true, force: true });
        rmSync(targetParent, { recursive: true, force: true });
    }
});

test('maps and reviews independently require the shared Google API key', () => {
    const root = mkdtempSync(join(tmpdir(), 'reactedge-config-'));
    const targetParent = mkdtempSync(join(tmpdir(), 'reactedge-target-'));
    try {
        mkdirSync(join(root, 'workspace.sample'));
        mkdirSync(join(root, 'widgets/storefinder/public'), { recursive: true });
        writeFileSync(join(root, 'workspace.sample/registry.json'), '{}');
        const defaults = { ...readConfiguration(root, 'maps'), targetRoot: join(targetParent, 'site') };
        assert.throws(() => previewConfiguration(root, { ...defaults, googleMapsEnabled: true }), /API key/);
        const maps = { ...defaults, googleMapsEnabled: true, googleMapsApiKey: 'shared-key' };
        applyConfiguration(root, maps);
        const mapRuntime = JSON.parse(readFileSync(join(root, 'widgets/storefinder/public/reactedge-runtime.json'), 'utf8'));
        assert.deepEqual(mapRuntime.integrations.googleMaps, { apiKey: 'shared-key' });
        assert.equal(readConfiguration(root, 'maps').googleMapsEnabled, true);
        assert.match(readFileSync(join(root, '.env.maps'), 'utf8'), /GOOGLE_MAPS_API_KEY='shared-key'/);

        const reviews = { ...maps, storeCode: 'reviews', googleMapsEnabled: false, googleReviewsEnabled: true };
        assert.throws(() => previewConfiguration(root, reviews), /Place ID/);
        applyConfiguration(root, { ...reviews, googlePlaceId: 'place-123' });
        const reviewsRuntime = JSON.parse(readFileSync(join(root, 'widgets/storefinder/public/reactedge-runtime.json'), 'utf8'));
        assert.deepEqual(reviewsRuntime.integrations.googleMaps, { apiKey: 'shared-key', placeId: 'place-123' });
        assert.equal(readConfiguration(root, 'reviews').googleMapsEnabled, false);
        assert.equal(readConfiguration(root, 'reviews').googleReviewsEnabled, true);
    } finally {
        rmSync(root, { recursive: true, force: true });
        rmSync(targetParent, { recursive: true, force: true });
    }
});
