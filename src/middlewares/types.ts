import {FetchExecutor, FetchExecutorInit} from "@/executors/types";

export type FetchMiddleware<
    MiddlewareInitType,
    MiddlewareResponseType,
    ExecutorInitType,
    ExecutorResponseType,
> = (
    req: MiddlewareInitType & ExecutorInitType & FetchExecutorInit,
    next: FetchExecutor<ExecutorInitType, ExecutorResponseType>,
) => MiddlewareResponseType;
