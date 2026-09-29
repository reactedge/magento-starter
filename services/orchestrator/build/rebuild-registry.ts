/**
 * Entry point. Orchestrates the rebuild process. Knows the overall workflow but performs no business logic itself.
 */

import { Report } from "../deployment/report.ts";
import { resolveWidgets } from '../deployment/registry-loader.ts';
import { processWidget } from './widget-processor.ts';
import type { BuildWidgetRegistry } from "@reactedge/framework/contracts/buiild/BuildWidgetRegistry.ts";

export class RegistryRebuilder {
    constructor(
        private readonly registry: BuildWidgetRegistry,
        private readonly report: Report
    ) {}

    async rebuild(selectedWidgets: string[]): Promise<void> {
        const widgets =
            resolveWidgets(
                selectedWidgets,
                this.registry
            );

        this.report.info(
            'Widget selection resolved',
            {
                widgets: widgets.length
            }
        );

        const processedWidgets =
            await Promise.all(
                widgets.map(widget =>
                    processWidget(
                        widget,
                        this.registry,
                        this.report
                    )
                )
            );

        this.report.success(
            'Widget processing completed',
            {
                widgets: processedWidgets.length
            }
        );

        this.report.success(
            'Registry rebuild completed'
        );

        this.report.renderConsole();
    }
}
