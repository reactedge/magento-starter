export const logger = {
    info(message: string, meta?: unknown) {
        // eslint-disable-next-line no-console
        console.log(message, meta ?? '');
    },

    error(message: string, error?: unknown) {
        // eslint-disable-next-line no-console
        console.error(message, error ?? '');
    },

    debug(message: string, meta?: unknown) {
        if (process.env.DEBUG === 'true') {
            // eslint-disable-next-line no-console
            console.debug(message, meta ?? '');
        }
    }
};