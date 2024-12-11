import {FetchMiddleware} from "@/middlewares/types";
import { isNumber } from "@/utils/type-guards";
import { sleep } from "@/utils/time";

const defaultRetryConfig = {
    count: 3,
    statuses: [429, 500, 502, 503, 504],
    errors: ['ECONNRESET'],
    delayMs: 5000,
    exponentialBackOffFactor: 1.2,
}

export type RetryConfig = {
    count: number
    statuses: number[]
    errors: string[]
    delayMs: number
    exponentialBackOffFactor: number
};

export type RetryInit = {
    retry: Partial<RetryConfig>
        | number
        | number[]
        | boolean
        | undefined
}

function resolveRetryWaitPeriodMs(response: Response | undefined, defaultWaitMs: number) {
    const retryAfterValue = Number.parseInt(response?.headers.get('retry-after') || '');
    if (isNumber(retryAfterValue)) {
        return retryAfterValue * 1000;
    } else {
        return defaultWaitMs;
    }
}

function resolveRetryConfig(retry?: RetryInit["retry"]): RetryConfig {
    if (!retry) {
        return {
            ...defaultRetryConfig,
            count: 0,
        }
    }

    if (retry === true) {
        return defaultRetryConfig;
    }

    if (isNumber(retry)) {
        return {
            ...defaultRetryConfig,
            count: retry,
        }
    }

    if (Array.isArray(retry)) {
        return {
            ...defaultRetryConfig,
            statuses: retry,
        }
    }

    return {
        ...defaultRetryConfig,
        ...retry
    };
}

export function retrier<ExecutorInitType>(): FetchMiddleware<Partial<RetryInit>, Promise<Response>, ExecutorInitType, Promise<Response>> {
    return async function(
        req,
        next
    ) {
        const { logger = console } = req;
        const { retry } = req;

        const {
            count,
            statuses,
            delayMs,
            exponentialBackOffFactor,
            errors,
        } = resolveRetryConfig(retry);

        let response: undefined | Response;
        let error: undefined | { code?: string };

        try {
            response = await next(req);
        } catch (e) {
            error = e as { code?: string };
        }

        let attemptsLeft = count;
        let currentDelayMs = delayMs;
        while (statuses.includes(response?.status ?? 0) || errors.includes(error?.code ?? '')) {
            if (attemptsLeft-- <= 0) {
                break;
            }

            const retryAfterMs = resolveRetryWaitPeriodMs(response, currentDelayMs);

            logger.warn(`failed to fetch [${response?.status ?? error?.code}]: retrying after ${Math.round(retryAfterMs / 1000)} seconds; ${attemptsLeft} attempts left`);

            // wait for some time until next retry
            await sleep(retryAfterMs);

            try {
                response = await next(req);
            } catch (e) {
                error = e as { code?: string };
            }
            currentDelayMs *= exponentialBackOffFactor;
        }

        if (response === undefined) {
            throw error;
        }

        return response;
    }
}