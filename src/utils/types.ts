/**
 * Represents a JSON object with string keys and JsonValue values
 */
export type JsonObject = {[Key in string]: JsonValue};

/**
 * Represents a JSON array containing JsonValue elements
 */
export interface JsonArray extends Array<JsonValue> {}

/**
 * Represents primitive JSON values: string, number, boolean, null or undefined
 */
export type JsonPrimitive = string | number | boolean | null | undefined;

/**
 * Represents any valid JSON value: primitives, objects or arrays
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
