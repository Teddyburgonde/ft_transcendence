/*
* Check if a value is a string or not.
*
* @param {*} value The value to check.
* @return {boolean} Returns `true` if `value` is a string, else `false`.
*
* @example
*
*   isString('a'); // return true
*   isString([]);  // return false
*/
const isString = (value) => {
  return typeof value === 'string';
};

/**
* Check if a value is an object or not
*
* @param {*} value The value to check.
* @return {boolean} Returns `true` if `value` is a string, else `false`.
*
* @example
*
*   isObject(null); // return false
*   isObject({});  // return true
 */
const isObject = (value) => {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
};

module.exports = {
  isString,
  isObject
};
