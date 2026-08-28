import { chromium } from 'playwright';
import type {
    PdpSignalProbeResult,
    ObservedSignal
} from "../types/signals.ts";
import {getConfig} from "../config.js";

export async function probePdpSignals(url: string): Promise<PdpSignalProbeResult> {
    const browser = await chromium.launch({
        headless: true,
    });

    const config = getConfig()

    const targetUrl = new URL(url, config.targetSiteUrl);

    if (targetUrl.origin !== config.targetSiteUrl) {
        throw new Error(
            `URL must belong to configured site: ${config.targetSiteUrl}`
        );
    }

    try {
        const context = await browser.newContext({
            ignoreHTTPSErrors: true,
        });

        const page = await context.newPage();

        const observedSignals: ObservedSignal[] = [];

        await page.exposeFunction(
            'captureReactEdgeSignal',
            (signal: unknown) => {
                observedSignals.push(signal);
            }
        );

        await page.addInitScript(() => {
            window.addEventListener('reactedge:signal', (event) => {
                void window.captureReactEdgeSignal(
                    (event as CustomEvent).detail
                );
            });
        });

        await page.goto(targetUrl.href);

        const swatches = page.locator('[data-swatch-type="visual"]');

        await swatches.first().click();

        return {
            surface: 'pdp',
            signals: observedSignals,
        };
    } finally {
        await browser.close();
    }
}
