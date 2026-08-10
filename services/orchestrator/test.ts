import {Report} from "./build/report.ts";
import {loadRegistry} from "./build/rebuild-registry/registry-loader.ts";
import {selectTarget} from "./build/target-selection.ts";
import {selectWidgets} from "./build/widget-selection.ts";
import {loadConfig} from "./config.ts";
import {runCiVerification} from "./test/playwright-verification.ts";

const target = await selectTarget()
loadConfig(target);

const report = new Report();

const registry =
    loadRegistry();

report.info(
    'Registry loaded',
    {
        "widgets & instances": Object.keys(registry).length
    }
);

const widgets = await selectWidgets(registry)
await runCiVerification(
    widgets,
    report
);

await new Promise(
    resolve => setTimeout(resolve, 10000)
);