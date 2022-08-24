const {Linter, Flake8, Black, getLinter} = require('./linter');
const core = require('@actions/core')
const { createCheck } = require("./check-run");


/**
 * Executes action w/ specfic linter
 *  @param {Linter} linter
 */
async function executeAction(linter) {
    const linterName = linter.name()
    if(core.getBooleanInput(linterName == false))
        return;
    
    core.info(`Linting with ${linterName }`);
    try
    {
        const lintOutput = await Promise(linter.lint());
        const lintResult = linter.parseOutput(lintOutput);
        const summary = `${linterName} found ${lintResult.error.length} error(s) and ${lintResult.warning.length} warning(s)`;
        core.info(`${summary} (${lintResult.isSuccess ? "success" : "failure"})`);
        createCheck(linterName, lintResult, summary)
    }
    catch(error)
    {
        core.info(`Linting FAILED with ${linterName}`);
        core.setFailed(error.message);
    }
}
async function start(){
    const flake = new Flake8();
    await executeAction(flake);
    const black = new Black()
    await executeAction(black);
}
start()