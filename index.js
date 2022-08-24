const {Linter, Flake8, Black, getLinter} = require('./linter');
const core = require('@actions/core')
const { createCheck } = require("./check-run");
const linters = ["flake8", "black"];

/**
 * Executes action w/ specfic linter
 *  @param {Linter} linter
 */
async function executeAction(linter) {
    const checks = [];
    const linterName = linter.name()
    core.info(`Linting with ${linterName }`);
    try
    {
        const lintResult = linter.lint();
        const summary = `${linterName} found ${lintResult.error.length} error(s) and ${lintResult.warning.length} warning(s)`;
        core.info(`${summary} (${lintResult.isSuccess ? "success" : "failure"})`);
        checks.push({ linterName, lintResult, summary });
	    await Promise.all(
	        checks.map(({ linterName, lintResult, summary }) =>
			    createCheck(linterName, lintResult, summary),
	    	),
	    );
    }
    catch(error)
    {
        core.info(`Linting FAILED with ${linterName}`);
        core.setFailed(error.message);
    }
    
}


async function execute_async(linter_name)
{
    var linter = getLinter(linter_name);
    await executeAction(linter).then(() =>{
        core.info(`Linting complete with ${linter.name()}`);
    });
}

linters.forEach(linter_name => {
    if(core.getBooleanInput(linter_name) == true){
        execute_async(linter_name);
    }
});