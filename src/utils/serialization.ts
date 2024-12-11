import {isObject} from "@/utils/type-guards";
import {JsonObject} from "@/utils/types";

/**
 * Flattens a nested object into a single-level object with dot notation keys.
 * @param obj The object to flatten
 * @returns A flattened object where nested keys are joined with brackets
 * @example
 * flatten({ a: { b: 1 } }) // Returns { "a[b]": 1 }
 */
export function flatten<L>(obj: object): Record<string, L> {
    function doFlatten(obj: object, isRoot: boolean = true): Record<string, L> {
        const newObj: Record<string, L> = {};
        for (const [ k, v ] of Object.entries(obj)) {
            if (isObject(v)) {
                const flattened = doFlatten(v, false);
                for (const [ fk, fv ] of Object.entries(flattened)) {
                    newObj[`${isRoot ? k : `[${k}]` }${fk}`] = fv;
                }
            } else if (v !== undefined) {
                newObj[isRoot ? k : `[${k}]`] = v;
            }
        }
        return newObj;
    }

    return doFlatten(obj);
}

/**
 * Converts a request into a string representation of its request line.
 * @param req The request object containing method and URL
 * @returns A string in the format "METHOD URL"
 * @example
 * stringifyRequestLine({ method: "POST", url: "/api" }) // Returns "POST /api"
 */
export function stringifyRequestLine(req: RequestInit & { url: string }): string {
    return `${req.method?.toUpperCase() || 'GET'} ${req.url}`;
}

/**
 * Converts a Response object into a string representation of its status line.
 * @param res The Response object
 * @returns A string in the format "STATUS STATUS_TEXT"
 * @example
 * stringifyResponseLine(new Response("", { status: 200 })) // Returns "200 OK"
 */
export function stringifyResponseLine(res: Response): string {
    return `${res.status} ${res.statusText}`;
}

/**
 * Converts an object into URL query parameters.
 * @param obj The object to convert to query parameters
 * @returns A URL-encoded query string
 * @example
 * stringifyQueryParams({ page: 1, filter: { active: true } }) 
 * // Returns "page=1&filter[active]=true"
 */
export function stringifyQueryParams(obj: JsonObject): string {
    const urlSearchParams = new URLSearchParams();
    Object.entries(flatten(obj)).forEach(([key, val]) => {
        urlSearchParams.set(key, String(val));
    });
    return urlSearchParams.toString();
}

/**
 * Converts HTTP headers into a string representation.
 * @param headers The headers to stringify
 * @returns A string with each header on a new line in "key: value" format
 * @example
 * stringifyHttpHeaders({ "Content-Type": "application/json" })
 * // Returns "content-type: application/json"
 */
export function stringifyHttpHeaders(headers: HeadersInit | undefined): string {
    if (headers === undefined) {
        return '';
    }

    const headersObj = new Headers(headers);
    return Array.from(headersObj.entries())
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
}
