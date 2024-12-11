import {FetchExecutor, FetchExecutorInit} from "@/executors/types";
import {FetchMiddleware} from "@/middlewares/types";

/**
 * Applies a middleware to an executor.
 * 
 * @returns a new executor that is a composition of the original executor and the middleware
 * 
 * @example
 * const fetcher = applyMiddleware(basicExecutor(), urlBuilder());
 */
export function applyMiddleware<
    MiddlewareInitType,
    MiddlewareResponseType,
    ExecutorInitType,
    ExecutorResponseType,
>(executor: FetchExecutor<ExecutorInitType, ExecutorResponseType>, middleware: FetchMiddleware<MiddlewareInitType, MiddlewareResponseType, ExecutorInitType, ExecutorResponseType>): FetchExecutor<MiddlewareInitType & ExecutorInitType, MiddlewareResponseType> {
    return (req) => middleware(req, executor);
}

/**
 * Helper class to build the fetcher with a chain of calls instead of nested arguments
 * 
 * @example
 * const fetcher = FetchBuilder.from(basicExecutor())
 *     .applyMiddleware(urlBuilder())
 *     .applyMiddleware(retrier())
 *     .build();
 */
export class FetchBuilder<
    ExecutorInitType,
    ExecutorResponseType
> {
    private readonly executor: FetchExecutor<ExecutorInitType, ExecutorResponseType>;

    constructor(executor: FetchExecutor<ExecutorInitType, ExecutorResponseType>) {
        this.executor = executor;
    }

    applyMiddleware<
        MiddlewareInitType = ExecutorInitType,
        MiddlewareResponseType = ExecutorResponseType,
    >(middleware: FetchMiddleware<MiddlewareInitType, MiddlewareResponseType, ExecutorInitType, ExecutorResponseType>) {
        return new FetchBuilder<MiddlewareInitType & ExecutorInitType, MiddlewareResponseType>(applyMiddleware(this.executor, middleware));
    }

    build() {
        return this.executor;
    }

    static from<ExecutorInitType, ExecutorResponseType>(
        executor: FetchExecutor<ExecutorInitType, ExecutorResponseType>
    ) {
        return new FetchBuilder(executor);
    }
}

/**
 * Applies default values to the executor.
 * 
 * @returns a new executor that is a composition of the original executor and the defaults
 * 
 * @example
 * const fetcher = withDefaults(basicExecutor(), {
 *     fetch: fetch,
 *     logger: console,
 * });
 */
export function withDefaults<ExecutorInitType, ExecutorResponseType>(
    executor: FetchExecutor<ExecutorInitType, ExecutorResponseType>,
    defaults: (Partial<ExecutorInitType> & FetchExecutorInit) | ((req: ExecutorInitType & FetchExecutorInit) => ExecutorInitType & FetchExecutorInit),
): FetchExecutor<ExecutorInitType, ExecutorResponseType> {
    if (typeof defaults === 'object') {
        return (req: ExecutorInitType & FetchExecutorInit) => executor({...defaults, ...req});
    } else {
        return (req: ExecutorInitType & FetchExecutorInit) => executor({...req, ...defaults(req)});
    }
}