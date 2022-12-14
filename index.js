const {Linter, Flake8, Black} = require('./linter');
const core = require('@actions/core')
const { createCheck } = require("./check-run");
const failure = false;

/**
 * Executes action w/ specfic linter
 *  @param {Linter} linter
 */
async function executeAction(linter) {
    const linter_name = linter.linterName()
    if(core.getBooleanInput(linter_name)  == false)
        return;
    
    core.info(`Linting with ${linter_name }`);
    try
    {
        const lintOutput = linter.lint();
        const lintResult = linter.parseOutput(lintOutput);
        const summary = `${linter_name} found ${lintResult.error.length} error(s) and ${lintResult.warning.length} warning(s)`;
        core.info(`${summary} (${lintResult.isSuccess ? "success" : "failure"})`);
        createCheck(linter_name, lintResult, summary)
        if (lintResult.error.length > 0)
		    failure = true;
    }
    catch(error)
    {
        core.info(`Linting FAILED with ${linter_name}`);
        core.setFailed(error.message);
    }
}
async function start(){
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`)
    console.log(`The event payload: ${github.event_name}`)
    const flake = new Flake8();
    await executeAction(flake);
    const black = new Black()
    await executeAction(black);
    if (failure)
        core.setFailed("Linting failures detected. See check runs with annotations for details.");
}
start()
