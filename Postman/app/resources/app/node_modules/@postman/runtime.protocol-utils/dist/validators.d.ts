export declare function validateHexadecimal(str: string): string;
export declare function validateBase64(str: string): string;
/**
 * Helper function to detect whether a give value is JSON or not
 *
 * @note This function only determines whether a given value is
 * JSON on best-effort basis and thus might result in false positives
 *
 * @param {String} value
 * @returns {Boolean}
 */
export declare function isJSON(value: string): boolean;
