import {RegistryRebuilder} from "./build/rebuild-registry.ts";
import {Report} from "./deployment/report.ts";
import {loadRegistry} from "./deployment/registry-loader.ts";
import {TargetSelector} from "./build/target-selection.ts";
import {WidgetSelector} from "./build/widget-selection.ts";
import {loadConfig} from "./deployment/config.ts";

const target = await new TargetSelector().select()
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

const widgets = await new WidgetSelector(registry).select()
new RegistryRebuilder(registry, report).rebuild(widgets)

await new Promise(
    resolve => setTimeout(resolve, 10000)
);
