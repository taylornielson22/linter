const {Linter, Flake8, Black} = require('./linter');
const core = require('@actions/core')
const { updateCheck, createInProgressCheck} = require("./check-run");


/**
 * Executes action w/ specfic action
 *  @param {Linter} linter
 */
async function executeAction(linter) {
    const checks = [];
    const linterName = linter.name()
    await createInProgressCheck(linterName);
    core.info(`Linting with ${linterName }`);
    try
    {
        const lintResult = linter.lint();
        const summary = `${linterName} found ${lintResult.error.length} error(s) and ${lintResult.warning.length} warning(s)`;
        core.info(`${summary} (${lintResult.isSuccess ? "success" : "failure"})`);
        checks.push({ linterName, lintResult, summary });
	    await Promise.all(
	        checks.map(({ linterName, lintResult, summary }) =>
			    updateCheck(linterName, lintResult, summary),
	    	),
	    );
    }
    catch(error)
    {
        core.info(`Linting FAILED with ${linterName}`);
        core.setFailed(error.message);
    }
    
}

if(core.getBooleanInput("flake8") == true)
{
    var linter = new Flake8();
    executeAction(linter);
}
if(core.getBooleanInput("black") == true)
{
    var linter = new Black();
    executeAction(linter);
}
