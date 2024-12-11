import {BaseResponseHandlers, FetchResponseMiddleware} from "@/middlewares/response/base";

export type BufferResponseHandler = { buffer: () => Promise<Buffer> };

export function responseBuffer<
    ExecutorInitType,
    ExecutorResponseType extends BaseResponseHandlers
>(): FetchResponseMiddleware<
    {},
    BufferResponseHandler,
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
            buffer: async function() {
                return Buffer.from(await (await parent.execute()).arrayBuffer())
            }
        };
    }
}