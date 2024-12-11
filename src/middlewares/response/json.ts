import {BaseResponseHandlers, FetchResponseMiddleware} from "@/middlewares/response/base";

export type JsonResponseHandler = { json: <R> () => Promise<R> };

export function responseJson<
    ExecutorInitType,
    ExecutorResponseType extends BaseResponseHandlers
>():FetchResponseMiddleware<
    {},
    JsonResponseHandler,
    ExecutorInitType,
    ExecutorResponseType
> {
    return function(
        req,
        next
    ) {
        const base = next(req);
        return {
            ...base,
            json: async function<R>() {
                return await ((await base.execute()).json()) as R
            }
        };
    }
}