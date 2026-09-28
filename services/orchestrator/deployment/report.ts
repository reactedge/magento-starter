import type { Span } from '@opentelemetry/api';

export type ReportLevel =
    | 'info'
    | 'success'
    | 'warning'
    | 'error';

export interface ReportEntry {
    timestamp: Date;
    level: ReportLevel;
    message: string;
    context?: Record<string, unknown>;
}

export class Report {
    private entries: ReportEntry[] = [];

    info(
        message: string,
        context?: Record<string, unknown>,
        span?: Span
    ) {
        this.add(
            'info',
            message,
            context,
            span
        );
    }

    success(message: string, context?: Record<string, unknown>, span?: Span) {
        this.add('success', message, context, span);
    }

    warning(message: string, context?: Record<string, unknown>, span?: Span) {
        this.add('warning', message, context, span);
    }

    error(message: string, context?: Record<string, unknown>, span?: Span) {
        this.add('error', message, context, span);
    }

    renderConsole(): void {

        console.log('\n====================================');
        console.log('ReactEdge Build Report');
        console.log('====================================');

        for (const entry of this.entries) {

            const prefix = {
                info: '[INFO]',
                success: '[OK]',
                warning: '[WARN]',
                error: '[ERROR]'
            }[entry.level];

            console.log(
                `${prefix} ${entry.message}`
            );

            if (entry.context) {
                console.log(
                    `       ${JSON.stringify(entry.context)}`
                );
            }
        }

        console.log('====================================');
    }

    getEntries(): ReportEntry[] {
        return this.entries;
    }

    private add(
        level: ReportLevel,
        message: string,
        context?: Record<string, unknown>,
        span?: Span
    ) {
        const event = {
            timestamp: new Date(),
            level,
            message,
            context
        };

        if (!span) this.entries.push(event);
    }
}