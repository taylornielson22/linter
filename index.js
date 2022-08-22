const core = require('@actions/core')
const github = require('@actions/github');
const Flake8 = require('./flake');
const { run } = require('./action');
const checks = [];
try{
    const black = core.getBooleanInput('black')
    const flake = core.getBooleanInput('flake8')
   // if(flake){
		core.info("Linting with Flake8");
        var linter = Flake8
        const lintResult = linter.lint(2);
        const numErrors = lintResult.error.length;
	    const numWarnings = lintResult.warning.length;
        const summary = `${numErrors} error${numErrors > 1 ? "s" : ""} and ${numWarnings} warning${ numWarnings> 1 ? "s" : ""}`;
        core.info(`Flake8 found ${summary}  (${lintResult.isSuccess ? "success" : "failure"})`);
        lintCheckName = 'Flake8'
        checks.push({ lintCheckName, lintResult, summary });
        const sha = run("git rev-parse HEAD").stdout;
		await Promise.all(
			checks.map(({ lintCheckName, lintResult, summary }) =>
				createCheck(lintCheckName, sha, lintResult, summary),
			),
		);
} catch(error) {
    core.setFailed(error.message);
}
