import type {Report} from "../build/report.ts";
import {testWidget} from "./test-widget.ts";

export async function runCiVerification(
    processedWidgets: string[],
    report: Report
) {
    return await Promise.all(
        processedWidgets.map(widget =>
                testWidget(
                    widget,
                    report
                )
            )
        );
}