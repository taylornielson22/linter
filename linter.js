const { sep } = require("path");
const core = require("@actions/core");
const { run } = require("./action");
const { initLintResult } = require("./lint-result");

const GIT_DIFF = `git diff --name-only --diff-filter=ACMRTUX ${ core.getInput("base_sha") } | grep -E .pyi*$ | xargs --max-lines=50000 --no-run-if-empty`;


/** @typedef {import('./lint-result').LintResult} LintResult */

class Linter 
{
    constructor()
    {
        if(this.constructor == Linter){
            throw new Error("Object of Abstract Class cannot be created")
        }
        this.name = ""
    }
    
    /**
    * @returns {string} - linter name
    */
    linterName() 
    {
        return this.name
		//throw new Error("Abstract method has no implementation")
	}

    /**
    * @returns {string} - linting cmd
    */
    cmd() 
    {
        throw new Error("Abstract method has no implementation")
    }

    /**
	 * Runs the linting program and returns the command output
	 * @returns {{status: number, stdout: string, stderr: string}} - Parsed lint result
	 */
    lint()
    {
		const output = run(`${ GIT_DIFF } ${this.cmd()}`);
        core.info(`STATUS: ${ output.status } \nSTDOUT: ${ output.stdout } \nSTDERR: ${ output.stderr }`);
        return output;
    }

    /**
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {LintResult} - Parsed lint result
	 */
	parseOutput(output) { 
        throw new Error("Abstract method has no implementation")
    }
}
	
class Flake8 extends Linter
{
    constructor () {
        super()
        this.name = "flake8"
    } 

    // name() 
    // {
	// 	return "flake8"
	// }

    cmd() 
    {
		return "flake8"
	}

    /**
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {LintResult} - Parsed lint result
	 */
	parseOutput(output) {
        core.info("Parsing stdout")
        const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;
		const matches = output.stdout.matchAll(/^(.*):([0-9]+):[0-9]+: (\w*) (.*)$/gm);
        for (const match of matches) 
        {
			const [_, pathFull, line, rule, text] = match;
			let path = pathFull.startsWith(`.${sep}`) ? pathFull.substring(2) : pathFull // Remove ./ or .\ from path
            const lineNumber = parseInt(line, 10);
			lintResult.error.push({
				path,
				firstLine: lineNumber,
				lastLine: lineNumber,
				message: `${text} (${rule})`,
			});
        }
        return lintResult;
	}
}
class Black extends Linter
{
    constructor () {
        super()
        this.name = "black";
    } 

    // name() 
    // {
	// 	return "black"
	// }

    cmd() 
    {
		return "black --target-version py38 --check"
	}
   /**
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {LintResult} - Parsed lint result
	 */
	parseOutput(output) { 
        core.info("Parsing stderr")
        const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;
		const matches = output.stderr.matchAll(/^(.*) (.*\.py$)/gm);
        for (const match of matches) 
        {
			const [text, pathFull] = match;
			let path = pathFull.startsWith(`.${sep}`) ? pathFull.substring(2) : pathFull // Remove ./ or .\ from path
			lintResult.error.push({
				path,
				firstLine: 1,
				lastLine: 1,
				message: `${text}`,
			});
        }
        return lintResult;
	}
}   
    

module.exports = {
    Linter,
    Flake8,
    Black,
}

