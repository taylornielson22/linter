
const core = require("@actions/core");
const { Octokit } = require("@octokit/core");
const https = require("https");
const { name: actionName } = require("./package.json");

/** @typedef {import('./context').GithubContext} GithubContext */
/** @typedef {import('./lint-result').LintResult} LintResult */

/**
 * Creates a new check on run 
 * @param {string} linterName - linter ran
 * @param {string} sha - SHA of the commit which should be annotated
 * @param {LintResult} lintResult - Parsed lint result
 * @param {string} summary - GitHub check summary
 */
async function createCheck(linterName, lintResult, summary) {
	let annotations = [];
	for (const level of ["error", "warning"]) {
		annotations = [
			...annotations,
			...lintResult[level].map((result) => ({
				path: result.path,
				start_line: result.firstLine,
				end_line: result.lastLine,
				annotation_level: level === "warning" ? "warning" : "failure",
				message: result.message,
			})),
		];
	}
	const owner_input = core.getInput("owner");
	const repo_input = core.getInput("repo_name");
	const sha = core.getInput("head_sha");
	core.info(`POST /repos/${owner_input}/${repo_input}/check-runs`);
	core.info(`${annotations}`);
	try{
		const octokit = new Octokit({
			auth: core.getInput("github_token")
		})
		await octokit.request(`POST /repos/${owner_input}/${repo_input}/check-runs`, {
			owner: owner_input,
			repo: repo_input,
			name: linterName,
			head_sha: sha,
			conclusion: lintResult.isSuccess ? "success" : "failure",
			output: {
			  title: `${linterName} Completed Linting`,
			  summary: `${linterName} found ${summary}`,
			  annotations,
			}
		  });
		  core.info(`${linterName} check created successfully`);
	} catch (error) {
		throw new Error(`Error trying to create GitHub check run: ${error}`);
    }
}

module.exports = { createCheck };