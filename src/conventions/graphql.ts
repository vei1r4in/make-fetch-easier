import {FetchExecutor} from "@/executors/types";
import {makeFetch} from "@/index";
import {BodyInit} from "@/middlewares/request/body";
import {JsonResponseHandler} from "@/middlewares/response/json";
import {JsonObject} from "@/utils/types";

type GraphQLInput = Partial<{
    query: string;
    variables: JsonObject;
    [key: string]: unknown;
}>;

type GraphQLFetchExecutor<ExecutorInitType extends Partial<BodyInit>> = FetchExecutor<
    Partial<ExecutorInitType>,
    JsonResponseHandler
>;

type GraphQLFetchExecutorInit<ExecutorInitType extends Partial<BodyInit>> =
    Parameters<GraphQLFetchExecutor<ExecutorInitType>>[0];

type GraphQLError = {
    message: string
}

function graphQLQueryString(fields: object): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
        if (typeof value === "object") {
            result[key] = JSON.stringify(value);
        } else if (value !== undefined) {
            result[key] = value.toString();
        }
    }
    return result;
}

export class GraphQLAPIError extends Error {
    private readonly data?: unknown;
    private readonly errors: GraphQLError[];

    constructor(errors: GraphQLError[], data: unknown) {
        super(errors.map(e => e.message || 'unknown_error').join('; '));
        this.errors = errors;
    }

    getErrors(): GraphQLError[] {
        return this.errors;
    }

    getData<T>(): T {
        return this.data as T;
    }
}

export class GraphQlAPI<ExecutorInitType extends Partial<BodyInit>> {
    private readonly executor: GraphQLFetchExecutor<ExecutorInitType>
    private readonly baseUrl: string;
    private readonly method: 'GET' | 'POST';

    constructor(
        baseUrl: string,
        method: 'GET' | 'POST',
        executor: GraphQLFetchExecutor<ExecutorInitType>,
    ) {
        this.executor = executor;
        this.baseUrl = baseUrl;
        this.method = method;
    }

    async execute<T>(
        input: GraphQLInput,
        init: GraphQLFetchExecutorInit<ExecutorInitType>,
    ) {
        const method = init.method || this.method || "POST";

        const resp = await this.executor({
            baseUrl: this.baseUrl,
            ...init,
            method,
            ...(method.toUpperCase() === "GET"
                ? { query: graphQLQueryString(input) }
                : { json: input }),
        }).json<{
            data?: unknown;
            errors?: GraphQLError[];
        } | void>();

        if (resp?.errors) {
            throw new GraphQLAPIError(resp.errors, resp.data);
        }

        if (resp?.data) {
            return resp.data as T;
        }

        throw new Error(
            "graphql query failed with invalid response: " +
            JSON.stringify(resp),
        );
    }
}

export function createGraphQlAPI<ExecutorInitType extends Partial<BodyInit>>(
    baseUrl: string,
    method: "POST" | "GET" = "POST",
    executor: GraphQLFetchExecutor<ExecutorInitType> = makeFetch,
): GraphQlAPI<ExecutorInitType> {
    return new GraphQlAPI(baseUrl, method, executor);
}
