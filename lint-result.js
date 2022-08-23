/**
 * Lint result object.
 * @typedef LintResult
 * @property {boolean} isSuccess 
 * @property {object[]} warning 
 * @property {object[]} error 

/**
 * Returns an object for storing linting results
 * @returns {LintResult} - Default object
 */
 function initLintResult() {
	return {
		isSuccess: true, 
		warning: [],
		error: [],
	};
}


module.exports = {
	initLintResult,
};