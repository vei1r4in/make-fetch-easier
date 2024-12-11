/**
 * Pauses execution for a given number of milliseconds.
 * @param ms The number of milliseconds to pause
 * @returns A Promise that resolves when the pause is complete
 * @example
 * sleep(1000).then(() => console.log("done"));
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}