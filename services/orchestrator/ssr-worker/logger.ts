export const workerLogger = {
    info(message: string, context?: Record<string, unknown>) {
        process.stdout.write(
            `${JSON.stringify({
                level: 'info',
                message,
                ...context,
            })}\n`,
        );
    },

    error(message: string, context?: Record<string, unknown>) {
        process.stderr.write(
            `${JSON.stringify({
                level: 'error',
                message,
                ...context,
            })}\n`,
        );
    },
};