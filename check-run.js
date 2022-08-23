const github = require('@actions/github');
const core = require("@actions/core");
const { Octokit } = require("@octokit/core");
const owner_input = core.getInput("owner");
const repo_input = core.getInput("repo_name");
const sha = core.getInput("head_sha");

/** @typedef {import('./lint-result').LintResult} LintResult */

/**
 * Creates a new check on run 
 * @param {string} linterName - linter ran
 * @param {LintResult} lintResult - Parsed lint result
 * @param {string} summary - GitHub check summary
 */
async function createCheck(linterName, lintResult, summary) {
	core.info(`Creating check run w/ annotations from ${linterName} linter`);
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
	const body = {
		owner: owner_input,
		repo: repo_input,
		name: linterName,
		head_sha: sha,
		conclusion: lintResult.isSuccess ? "success" : "failure",
		output: {
		  title: `${linterName} Completed Linting`,
		  summary: `${summary}`,
		  annotations,
		}
	};
	
	await request(body).catch((error) => {
		core.info(`Error trying to check run for ${linterName} linting results`);
		core.info(error);
	});
}

async function request(body){
	try{
		const octokit = new Octokit({
			auth: core.getInput("github_token")
		})
		await octokit.request(`POST /repos/${owner_input}/${repo_input}/check-runs`, body);
		core.info(`Check run created successfully`);
	} catch (error) {
		throw new Error(`Error trying to create GitHub check run: ${error}`);
    }
}
module.exports = { createCheck};