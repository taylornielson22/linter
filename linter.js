const { sep } = require("path");
const core = require("@actions/core");
const { run } = require("./action");
const { initLintResult } = require("./lint-result");

const GIT_DIFF = `git diff --name-only --diff-filter=ACMRTUX ${ core.getInput("base_sha") } | grep -E .pyi*$ | xargs --max-lines=50000 --no-run-if-empty`;


/** @typedef {import('./lint-result').LintResult} LintResult */

/**
    * Returns correct Linter
    * @param {string} name
    * @returns {Linter} 
    */
function getLinter(name){
    if(name == "flake8"){
        return new Flake8();
    }
    if(name == "black"){
        return new Black();
    }
    throw new Error("Invalid Linter name");
}

class Linter 
{
    constructor()
    {
        if(this.constructor == Linter){
            throw new Error("Object of Abstract Class cannot be created")
        }
    }
    
    /**
    * @returns {string} - linter name
    */
    name() 
    {
		return this.name;
	}

    /**
    * @returns {string} - linting cmd
    */
    cmd() 
    {
        return this.cmd;
    }

    /**
	 * Runs the linting program and returns the command output
	 * @returns {LintResult} - Parsed lint result
	 */
    lint()
    {
		const output = run(`${ GIT_DIFF } ${this.cmd()}`);
        core.info(`STATUS: ${ output.status } \nSTDOUT: ${ output.stdout } \nSTDERR: ${ output.stderr }`);
        const lintResult = initLintResult();
		lintResult.isSuccess = lintOutput.status === 0;
        lintResult.errors = this.parseLint(output);
        return this.parseLint(output);
    }

    /**
    * Parses linting errors 
    * @param {string} lintOutput
    * @returns {{path: string, firstLine: number, lastLine: number, message: string}[]} 
    */
     parseLint(lintOutput)
     {
        throw new Error("Abstract method has no implementation")
     }
}
	
class Flake8 extends Linter
{
    constructor () {
        this.name = "flake8"
        this.cmd = "flake8"
    } 

    parseLint(lintOutput)
    {
        const errors = [];
		const matches = lintOutput.matchAll(/^(.*):([0-9]+):[0-9]+: (\w*) (.*)$/gm);
        for (const match of matches) {
			const [_, pathFull, line, rule, text] = match;
			let path = pathFull.startsWith(`.${sep}`) ? pathFull.substring(2) : pathFull // Remove ./ or .\ from path
			const lineNumber = parseInt(line, 10);
			errors.push({
				path,
				firstLine: lineNumber,
				lastLine: lineNumber,
				message: `${text} (${rule})`,
			});
        }
        return errors;
    }
}
class Black extends Linter
{
    constructor () {
        this.name = "black"
        this.cmd = "black --target-version py38 --check"
    } 

    parseLint(lintOutput)
    {
        const errors = [];
		const matches = lintOutput.matchAll(/^(.*) (.*\.py$)/gm);
        for (const match of matches) 
        {
			const [text, pathFull] = match;
			let path = pathFull.startsWith(`.${sep}`) ? pathFull.substring(2) : pathFull // Remove ./ or .\ from path
			errors.push({
				path,
				firstLine: 1,
				lastLine: 1,
				message: `${text}`,
			});
        }
        return errors;
    }
}   
    

module.exports = {
    Linter,
    Flake8,
    Black,
    getLinter
}

