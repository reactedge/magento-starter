import { execSync } from 'child_process';
import path from 'path';
import type {Report} from "../build/report.ts";
import {ReactEdgeRoot} from "@reactedge/filesystem/reactedgeRoot.ts";

export function testWidget(
    widgetName: string,
    report: Report
): void {

    report.info(
        'Testing widget',
        {
            widget: widgetName
        }
    );

    try {
        const playwright = path.join(
            ReactEdgeRoot.get(),
            'node_modules',
            '.bin',
            'playwright'
        );

        execSync(
            `${playwright} test --config=tests/playwright.stage.config.ts widgets/${widgetName}/tests`,
            {
                cwd: ReactEdgeRoot.get(),
                stdio: 'inherit',
                env: {
                    ...process.env,
                    ...(process.env.PWDEBUG === '1' && {
                        PWDEBUG: '1'
                    })
                }
            }
        );

        report.success(
            'Widget test completed',
            {
                widget: widgetName
            }
        );

    } catch {

        report.error(
            'Widget test failed',
            {
                widget: widgetName
            }
        );
    }
}