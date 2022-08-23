const { sep } = require("path");

const core = require("@actions/core");

const { run } = require("./action");
const { initLintResult } = require("./lint-result");

const PARSE_REGEX = /^(.*):([0-9]+):[0-9]+: (\w*) (.*)$/gm;

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

/**
 * http://flake8.pycqa.org
 */
class Flake8 {
	static get name() {
		return "Flake8";
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {number} COMMIT_COUNT= - commit count
	 * @returns {LintResult} - Parsed lint result
	 */
	static lint(COMMIT_COUNT=1) {
		const output = run(`git diff --name-only --diff-filter=ACMRTUX ${ core.getInput("sha") } | grep -E .pyi*$ | xargs --max-lines=50000 flake8`);
        const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;
		const matches = output.stdout.matchAll(PARSE_REGEX);
		for (const match of matches) {
			const [_, pathFull, line, rule, text] = match;
			const leadingSep = `.${sep}`;
			let path = pathFull;
			if (path.startsWith(leadingSep)) {
				path = path.substring(2); // Remove "./" or ".\" from start of path
			}
			const lineNumber = parseInt(line, 10);
			lintResult.error.push({
				path,
				firstLine: lineNumber,
				lastLine: lineNumber,
				message: `${text} (${rule})`,
			});
		}

		return lintResult;
    }
}

module.exports = Flake8;

