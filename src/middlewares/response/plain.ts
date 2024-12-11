import {BaseResponseHandlers, FetchResponseMiddleware} from "@/middlewares/response/base";

export type PlainTextResponseHandler = { text: () => Promise<string> };

export function responsePlainText<
    ExecutorInitType,
    ExecutorResponseType extends BaseResponseHandlers
>(): FetchResponseMiddleware<
    {},
    PlainTextResponseHandler,
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
            text: async function() {
                return (await parent.execute()).text()
            }
        };
    }
}