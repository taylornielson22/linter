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

/**
 * Returns summary warnings and errors from linting result
 * @param {LintResult} lintResult - Linter Output
 * @returns {string} - Summary
 */
function getLintSummary(lintResult) {
	const numErrors = lintResult.error.length;
	const numWarnings = lintResult.warning.length;
	// Build and log a summary of linting errors/warnings
	if (numWarnings > 0 && numErrors > 0) {
		return `${numErrors} error${numErrors > 1 ? "s" : ""} and ${numWarnings} warning${
			numWarnings> 1 ? "s" : ""
		}`;
	}
	if (numErrors > 0) {
		return `${numErrors} error${numErrors > 1 ? "s" : ""}`;
	}
	if (numWarnings > 0) {
		return `${numWarnings} warning${numWarnings > 1 ? "s" : ""}`;
	}
	return `no issues`;
}

module.exports = {
	getLintSummary,
	initLintResult,
};