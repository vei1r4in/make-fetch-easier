import {FetchMiddleware} from "@/middlewares/types";
import { JsonObject, JsonValue } from "@/utils/types";
import FormData from "form-data";
import { flatten, stringifyQueryParams } from "@/utils/serialization";
import { isBuffer } from "@/utils/type-guards";

export type BodyInit = {
    json: JsonValue,
    plain: string,
    multipart: object,
    urlencoded: JsonObject,
}

export function bodyBuilder<ExecutorInitType, ExecutorResponseType>(): FetchMiddleware<
    Partial<BodyInit>,
    ExecutorResponseType,
    ExecutorInitType,
    ExecutorResponseType
> {
    return function(
        req,
        next,
    ) {
        if (req.body) {
            return next(req);
        }

        const {
            json,
            plain,
            multipart,
            urlencoded,
        } = req;

        let body: RequestInit["body"] | undefined = undefined;
        let contentType: string | undefined = undefined;
        let headers: RequestInit["headers"] | undefined = req.headers;

        if (plain) {
            body = plain;
            contentType = 'text/plain';
        }

        if (json) {
            body = JSON.stringify(json);
            contentType = 'application/json';
        }

        if (urlencoded) {
            body = stringifyQueryParams(urlencoded);
            contentType = 'application/x-www-form-urlencoded';
        }

        if (multipart) {
            const flattened = flatten(multipart);
            const formData = new FormData();
            for (const [ k, v ] of Object.entries(flattened)) {
                if (isBuffer(v)) {
                    formData.append(k, v, {
                        filename: 'file'
                    });
                } else {
                    formData.append(k, String(v));
                }
            }
            body = formData.getBuffer();
            headers = Object.assign({...headers}, formData.getHeaders());
        }

        if (contentType) {
            headers = Object.assign({...headers}, {
                'content-type': contentType,
            });
        }

        return next(Object.assign({
            ...req,
        }, {
            body,
            headers,
            method: req.method ? req.method : (
                body ? 'post' : 'get'
            ),
        }));
    }
}