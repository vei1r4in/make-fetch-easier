import {BaseResponseHandlers, FetchResponseMiddleware} from "@/middlewares/response/base";

export type VoidResponseHandler = { void: () => Promise<void> };

export function responseVoid<
    ExecutorInitType,
    ExecutorResponseType extends BaseResponseHandlers
>(): FetchResponseMiddleware<
    {},
    VoidResponseHandler,
    ExecutorInitType,
    ExecutorResponseType
> {
    return function(
        req,
        next
    ) {
        const parent = next(req);
        return {
            ...parent,
            void: async function() {
                await (await parent.execute()).arrayBuffer()
            }
        };
    }
}