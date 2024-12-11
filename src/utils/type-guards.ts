/**
 * Checks if a value is an object.
 * @param v The value to check
 * @returns true if the value is an object, false otherwise
 * @example
 * isObject({}) // Returns true
 */
export function isObject(v?: unknown): v is object {
    return v?.constructor === Object || v?.constructor === Array;
}

/**
 * Checks if a value is a Buffer.
 * @param val The value to check
 * @returns true if the value is a Buffer, false otherwise
 * @example
 * isBuffer(new Buffer()) // Returns true
 */
export function isBuffer(val: unknown): val is Buffer {
    return val?.constructor === Buffer;
}

/**
 * Checks if a value is a number.
 * @param val The value to check
 * @returns true if the value is a finite number, false otherwise
 * @example
 * isNumber(123) // Returns true
 * isNumber(NaN) // Returns false
 * isNumber(Infinity) // Returns false
 */
export function isNumber(val: unknown): val is number {
    return Number.isFinite(val);
}