const core = require('@actions/core')
const github = require('@actions/github');
const Flake8 = require('./flake');
const { run } = require('./action');
const { createCheck } = require("./check-run");
const checks = [];

async function executeAction(lintCheckName) {
    core.info(`Linting with ${lintCheckName }`);
   // if(flake){
        var linter = Flake8
        const lintResult = linter.lint(2);
        const numErrors = lintResult.error.length;
	    const numWarnings = lintResult.warning.length;
        const summary = `${numErrors} error${numErrors > 1 ? "s" : ""} and ${numWarnings} warning${ numWarnings> 1 ? "s" : ""}`;
        core.info(`${lintCheckName }  found ${summary}  (${lintResult.isSuccess ? "success" : "failure"})`);
        checks.push({ lintCheckName, lintResult, summary });
        const sha = run("git rev-parse HEAD").stdout;
		await Promise.all(
			checks.map(({ lintCheckName, lintResult, summary }) =>
				createCheck(lintCheckName, sha, lintResult, summary),
			),
		);
}

executeAction('Flake8').catch((error) => {
	core.setFailed(error.message);
});