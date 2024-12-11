import {FetchMiddleware} from "@/middlewares/types";

export type BaseResponseHandlers = { execute: () => Promise<Response> };

export type FetchResponseMiddleware<
    MiddlewareInitType,
    MiddlewareResponseType,
    ExecutorInitType,
    ExecutorResponseType extends BaseResponseHandlers,
> = FetchMiddleware<
    MiddlewareInitType,
    MiddlewareResponseType & ExecutorResponseType,
    ExecutorInitType,
    ExecutorResponseType
>;

export function baseResponseMiddleware<T>(): FetchMiddleware<
    {},
    BaseResponseHandlers,
    T,
    Promise<Response>
> {
    return function(req, next) {
        return {
            execute: () => next(req)
        }
    }
}