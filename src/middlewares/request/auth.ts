import {FetchMiddleware} from "@/middlewares/types";

export type AuthInit = {
    basicAuth: [string, string],
    bearerToken: string,
}

export function auth<ExecutorInitType, ExecutorResponseType>(): FetchMiddleware<
    Partial<AuthInit>,
    ExecutorResponseType,
    ExecutorInitType,
    ExecutorResponseType
> {
    return function(
        req,
        next,
    ) {
        const {
            basicAuth,
            bearerToken,
        } = req;

        const headers = {
            ...req.headers,
        };

        if (basicAuth) {
            const [ username, password ] = basicAuth;
            Object.assign(headers, {
                authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
            })
        }

        if (bearerToken) {
            Object.assign(headers, {
                authorization: `Bearer ${bearerToken}`,
            });
        }

        return next({
            ...req,
            headers,
        });
    }
}