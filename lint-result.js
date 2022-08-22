/**
 * Lint result object.
 * @typedef LintResult
 * @property {boolean} isSuccess Whether the result is success.
 * @property {object[]} warning Warnings.
 * @property {object[]} error Errors.
 */

/**
 * Returns an object for storing linting results
 * @returns {LintResult} - Default object
 */
 function initLintResult() {
	return {
		isSuccess: true, // Usually determined by the exit code of the linting command
		warning: [],
		error: [],
	};
}
module.exports = {
	initLintResult,
};