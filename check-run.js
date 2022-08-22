
const core = require("@actions/core");
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
async function createCheck(linterName, sha, lintResult, summary) {
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


	let conclusion = lintResult.isSuccess ? "success" : "failure";
	const body = {
		name: linterName,
		head_sha: sha,
		conclusion,
		output: {
			title: summary,
			summary: `${linterName} found ${summary}`,
			annotations,
		},
	};
	try {
		const repo = core.getInput("repo_name");
		await http_request(`${process.env.GITHUB_API_URL}/repos/${repo}/check-runs`, body);
		core.info(`${linterName} check created successfully`);
	} catch (err) {
		throw new Error(`Error trying to create GitHub check run: ${errorMessage}`);
    }
}


function http_request(url, body){
	const token = core.getInput("token");
	return new Promise((resolve) => {
		const req = https
			.request(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/vnd.github.antiope-preview+json",
					Authorization: `Bearer ${token}`,
					"User-Agent": actionName,
				},
				body,
			}, (res) => {
				let data = "";
				res.on("data", (chunk) => {
					data += chunk;
				});
				res.on("end", () => {
					if (res.statusCode >= 400) 
						core.info(`Error trying to create GitHub check run ${res.statusCode}`);
					else 
						resolve({ res, data: JSON.parse(data) });
				});
			})
		if (body) {
			req.end(JSON.stringify(body));
		} else {
			req.end();
		}
	});
}
module.exports = { createCheck };