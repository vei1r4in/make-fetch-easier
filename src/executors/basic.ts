import {FetchExecutor} from "@/executors/types";
import {
    stringifyResponseLine,
    stringifyHttpHeaders,
    stringifyRequestLine
} from "@/utils/serialization";

type Fetch = typeof fetch;

type BasicFetchInit = {
    fetch: Fetch;
}

function getDefaultFetch(): Fetch {
    const isBrowser = typeof window !== 'undefined';
    const globalObject = isBrowser ? window : global;

    if (globalObject?.fetch === undefined) {
        throw new Error("no fetch or fetch polyfill available in current context: " + (isBrowser ? "browser" : "node"));
    }

    return globalObject.fetch;
}

function shouldProduceDebugAndTraceLogs(): boolean {
    return (
        typeof process !== 'undefined' &&
        process.env !== undefined &&
        process.env.NODE_ENV !== 'production'
    );
}

export function basicExecutor(): FetchExecutor<Partial<BasicFetchInit>, Promise<Response>> {
    return async (req) => {
        const fetch = req.fetch || getDefaultFetch();
        const logger = req.logger || console;

        const { url, fetch: ignored, ...init } = req;
        if (url === undefined) {
            throw new Error("url must be provided");
        }
        
        if (shouldProduceDebugAndTraceLogs()) {
            logger.debug(stringifyRequestLine({...req, url}));
            logger.trace(stringifyHttpHeaders(req.headers));
        }

        const start = Date.now();
        const response = await fetch(url, init);

        if (shouldProduceDebugAndTraceLogs()) {
            logger.debug(`>....${Date.now() - start}ms ${stringifyResponseLine(response)}`);
            logger.trace(stringifyHttpHeaders(response.headers));
        }
        return response;
    }
}
