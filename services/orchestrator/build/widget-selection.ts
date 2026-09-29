import {checkbox} from "@inquirer/prompts";
import type {BuildWidgetRegistry} from "@reactedge/framework/contracts/BuildWidgetRegistry.ts";

export class WidgetSelector {
    constructor(
        private readonly registry: BuildWidgetRegistry
    ) {}

    async select(): Promise<string[]> {
        const deployableWidgets =
            Object.keys(this.registry)
                .filter(
                    key => !('widget' in this.registry[key])
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
}
