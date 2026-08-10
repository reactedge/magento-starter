import {checkbox} from "@inquirer/prompts";
import type {BuildWidgetRegistry} from "@reactedge/framework/contracts/BuildWidgetRegistry.ts";

export async function selectWidgets(registry: BuildWidgetRegistry): Promise<string[]> {
    const deployableWidgets =
        Object.keys(registry)
            .filter(
                key => !('widget' in registry[key])
            );

    return await checkbox({
        message: 'Select widgets to deploy',
        choices: deployableWidgets.map(
            widget => ({
                name: widget,
                value: widget
            })
        )
    });
}