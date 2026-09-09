// this file must remain at the root of the orchestrator project to ensure to be loading the config accordinglly

import { Worker } from "bullmq";
import { createRedisConnection } from "./ssr-worker/connection";
import { loadConfig } from "./config"
import {
    GENERATE_SSR_JOB,
    SSR_GENERATION_QUEUE,
    type SsrGenerationRequest,
} from "./ssr-worker/job-types";
import { generateSsrArtifact } from "./ssr-worker/jobs/generate-ssr";
import {workerLogger} from "./ssr-worker/logger";

const worker = new Worker<SsrGenerationRequest>(
    SSR_GENERATION_QUEUE,
    async (job) => {
        if (job.name !== GENERATE_SSR_JOB) {
            throw new Error(
                `Unsupported job type: ${job.name}`,
            );
        }

        loadConfig(job.data.target); // reload config since we start a separate process to the deployment one

        workerLogger.info(
            'Generating SSR',
            {
                widget: job.data.widget,
                variant: job.data.variant,
                jobId: job.id,
            },
        );

        return generateSsrArtifact(job.data);
    },
    {
        connection: createRedisConnection(),
        concurrency: 1,
    },
);

worker.on("completed", (job, result) => {
    workerLogger.info(
        'Completed job - Artifact generated',
        {
            artifactPath: result.artifactPath,
            jobId: job.id,
        },
    );
});

worker.on("failed", (job, error) => {
    workerLogger.error(
        'Failed job',
        {
            jobId: job.id,
            error: error instanceof Error
                ? error.message
                : String(error),
        },
    );
});

worker.on("error", (error) => {
    workerLogger.error(
        'SSR worker error',
        {
            error: error instanceof Error
                ? error.message
                : String(error),
        },
    );
});

async function shutdown(): Promise<void> {
    workerLogger.info('Stopping SSR worker');
    await worker.close();
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

workerLogger.info( `Listening on queue: ${SSR_GENERATION_QUEUE}`);