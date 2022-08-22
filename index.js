const core = require('@actions/core')
const github = require('@actions/github');
const Flake8 = require('./flake');
const { getLintSummary } = require("./lint-result");
const { run } = require("./action");
const { getContext } = require(".context");
const PARSE_REGEX = /^(.*):([0-9]+):[0-9]+: (\w*) (.*)$/gm;
const checks = [];
try{
    const black = core.getBooleanInput('black')
    const flake = core.getBooleanInput('flake8')
   // if(flake){
		core.info("Linting with Flake8");
        var linter = Flake8
        const lintResult = linter.lint(2);
        const summary = getLintSummary(lintResult);
        core.info(`Flake8 found ${summary} (${lintResult.isSuccess ? "success" : "failure"})`,
        );
        if (!lintResult.isSuccess) {
            hasFailures = true;
        }
 //   }
 lintCheckName = 'Flake8'
 checks.push({ lintCheckName, lintResult, summary });
 const sha = run("git rev-parse HEAD").stdout;
    contect = getContext();
    lintCheckName = 'Flake8'
		await Promise.all(
			checks.map(({ lintCheckName, lintResult, summary }) =>
				createCheck(lintCheckName, headSha, context, lintResult, summary),
			),
		);
} catch(error) {
    core.setFailed(error.message);
}
