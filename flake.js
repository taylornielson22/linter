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
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {LintResult} - Parsed lint result
	 */
	static lint(COMMIT_COUNT=1) {
		if (fix) {
			core.warning(`${this.name} does not support auto-fixing`);
		}
		const output = run("git diff --name-only --diff-filter=ACMRTUX HEAD~${COMMIT_COUNT} | grep -E .pyi*$ | xargs --max-lines=50000 --no-run-if-empty black --target-version py38 --check");
        return this.parseOutput(output);
    }

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {LintResult} - Parsed lint result
	 */
	static parseOutput(output) {
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

