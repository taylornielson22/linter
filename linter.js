const { sep } = require("path");
const core = require("@actions/core");
const { run } = require("./action");
const { initLintResult } = require("./lint-result");
const parseDiff = require("parse-diff");

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
        throw new Error("Abstract method has no implementation")
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
    
    parseLint(lintOutput) 
    {
        const lintResult = initLintResult();
        lintResult.isSuccess = lintOutput.status === 0;
        const files = parseDiff(lintOutput.stdout);
        for (const file of files) {
            const { chunks, to: path } = file;
            for (const chunk of chunks) {
                const { oldStart, oldLines, changes } = chunk;
                const chunkDiff = changes.map((change) => change.content).join("\n");
                lintResult.error.push({
                    path,
                    firstLine: oldStart,
                    lastLine: oldStart + oldLines,
                    message: chunkDiff,
                });
            }
        }
        return lintResult ;
    }
}   
    

module.exports = {
    Linter,
    Flake8,
    Black,
}

