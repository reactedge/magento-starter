import { execSync } from 'child_process';
import path from 'path';
import {Report} from "../report.ts";
import {getConfig} from "../../config.ts";

const buildCache = new Set<string>();

export function buildWidget(
    widgetName: string,
    widgetPath: string,
    report: Report
): void {
    const config = getConfig()

    if (buildCache.has(widgetName)) {

        report.info(
            'Widget build skipped (cached)',
            {
                widget: widgetName
            }
        );

        return;
    }

    const buildCommand = config.ssrEnabled
        ? "build:ssr"
        : "build";


    report.info(
        'Building widget',
        {
            widget: widgetName,
            buildCommand
        }
    );

    try {
        execSync(
            `npm run ${buildCommand} --prefix ${path.join(
                widgetPath
            )}`,
            {
                stdio: 'inherit'
            }
        );

        buildCache.add(
            widgetName
        );

        report.success(
            'Widget build completed',
            {
                widget: widgetName
            }
        );

    } catch (error) {

        report.error(
            'Widget build failed',
            {
                widget: widgetName
            }
        );

        throw error;
    }
}