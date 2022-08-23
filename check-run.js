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
async function updateCheck(linterName, lintResult, summary) {
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
	const check_run_id = await getJobId(linterName)
	const body = {
		owner: owner_input,
		repo: repo_input,
		name: linterName,
		check_run_id: `${check_run_id}`,
		conclusion: lintResult.isSuccess ? "success" : "failure",
		output: {
		  title: `${linterName} Completed Linting`,
		  summary: `${summary}`,
		  annotations,
		}
	};
	
	await request(body).catch((error) => {
        cosnsole.log(`Error trying to check run for ${linterName} linting results`);
		cosnsole.log(error);
	});
}

async function createInProgressCheck(linterName,) {
	const body = {
		owner: owner_input,
		repo: repo_input,
		name: linterName,
		head_sha: sha,
		status: 'in_progress',
		output: {
		  	title: `${linterName} linting In Progress`,
		  	summary: '',
    		text: '',
		}
	};
	await request(body).catch((error) => {
        cosnsole.log(`Error trying to "In Progress" check run for ${linterName}`);
		cosnsole.log(error);
	});
}

async function getJobId(linterName) {
	const octokit = github.getOctokit(core.getInput("github_token"));
	const { data } = await octokit.rest.actions.listJobsForWorkflowRun({
	  ...github.context.repo,
	  run_id: github.context.runId,
	});
	return data.jobs.find(({ name }) => name === linterName)?.id ?? undefined;
}

async function request(body){
	try{
		const octokit = new Octokit({
			auth: core.getInput("github_token")
		})
		await octokit.request(`POST /repos/${owner_input}/${repo_input}/check-runs`, body);
		core.info(`${linterName} check created successfully`);
	} catch (error) {
		throw new Error(`Error trying to create GitHub check run: ${error}`);
    }
}
module.exports = { updateCheck, createInProgressCheck};