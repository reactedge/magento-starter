import { Queue, QueueEvents } from "bullmq";
import { createRedisConnection } from "./connection";
import {
    GENERATE_SSR_JOB,
    SSR_GENERATION_QUEUE,
    type SsrGenerationRequest,
    type SsrGenerationResult,
} from "./job-types";

const queue = new Queue<SsrGenerationRequest>(
    SSR_GENERATION_QUEUE,
    {
        connection: createRedisConnection(),
    },
);

const queueEvents = new QueueEvents(
    SSR_GENERATION_QUEUE,
    {
        connection: createRedisConnection(),
    },
);

export async function enqueueSsrGeneration(
    input: SsrGenerationRequest,
): Promise<SsrGenerationResult> {
    const job = await queue.add(
        GENERATE_SSR_JOB,
        input,
        {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1_000,
            },
        },
    );

    return job.waitUntilFinished(queueEvents);
}