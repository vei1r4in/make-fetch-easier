import {FetchMiddleware} from "@/middlewares/types";
import { JsonObject } from "@/utils/types"
import { stringifyQueryParams } from "@/utils/serialization"

export type UrlInit = {
    scheme: string
    host: string
    port: number
    baseUrl: string
    path: string
    query: JsonObject
}

export function urlBuilder<ExecutorInitType, ExecutorResponseType>(): FetchMiddleware<
    Partial<UrlInit>,
    ExecutorResponseType,
    ExecutorInitType,
    ExecutorResponseType
> {
    return function(
        req,
        next
    ) {
        const {
            url: urlInit = "",
            host,
            scheme,
            port,
            baseUrl: baseUrlInit,
            path,
            query,
        } = req;

        // try build baseUrl from host, scheme, port if provided
        let baseUrl = baseUrlInit;
        if (!baseUrl && host) {

            baseUrl = `${scheme ?? host.endsWith('.local') ? 'http' : 'https'}://${host}${port ? `:${port}` : ''}`;
        }

        // try build url from baseUrl and path if provided
        let url = urlInit;
        if (!url && baseUrl) {
            url = baseUrl;
            if (path) {
                url = baseUrl.replace(/\/+$/, '')
                    + '/'
                    + path.replace(/^\/+/, '');
            } else {
                url = baseUrl;
            }
        } else if (!url) {
            throw new Error("one of url and baseUrl must be defined!");
        }

        if (query !== undefined) {
            const qs = stringifyQueryParams(query);
            if (qs) {
                if (url.includes("?")) {
                    url += `&${qs}`;
                } else {
                    url += `?${qs}`;
                }
            }
        }

        return next({
            ...req,
            url,
        });
    }
}