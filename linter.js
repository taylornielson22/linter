const { sep } = require("path");
const core = require("@actions/core");
const { run } = require("./action");
const { initLintResult } = require("./lint-result");

const GIT_DIFF = `git diff --name-only --diff-filter=ACMRTUX ${ core.getInput("base_sha") } | grep -E .pyi*$ | xargs --max-lines=50000 --no-run-if-empty`;
const PARSE_REGEX = /^(.*):([0-9]+):[0-9]+: (\w*) (.*)$/gm;

/** @typedef {import('./lint-result').LintResult} LintResult */

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
		throw new Error("Abstract method has no implementation")
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
	 * @returns {LintResult} - Parsed lint result
	 */
    lint()
    {
        run(`pip install ${ this.name() }`)
		const output = run(`${ GIT_DIFF } ${this.cmd()}`);
        return this.parseLint(output);
    }

    /**
	 * Parse output from linting
     * @param {OutputResult} lintOutput
    * @returns {LintResult} - parsed output of linting result
    */
    parseLint(lintOutput)
    {
        const lintResult = initLintResult();
		lintResult.isSuccess = lintOutput.status === 0;
		const matches = lintOutput.stdout.matchAll(PARSE_REGEX);
        for (const match of matches) {
			const [_, pathFull, line, rule, text] = match;
			const leadingSep = `.${sep}`; // sep = ./ or .\
			let path = pathFull;
			if (path.startsWith(leadingSep)) {
				path = path.substring(2); // Remove ./ from path
			}
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
	
class Flake8 extends Linter
{
    constructor () {
        super();
     }

    name() 
    {
		return "flake8"
	}

    cmd() 
    {
        return "flake8"
    }
}
class Black extends Linter
{
    constructor () {
        super();
     } 

    name() 
    {
		return "black"
	}

    cmd() 
    {
        return "black --target-version py38 --check"
    }
}   
    

module.exports = {
    Linter,
    Flake8,
    Black,
}

