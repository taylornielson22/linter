const { execSync } = require("child_process");

const core = require("@actions/core");
/**
 * Lint result object.
 * @typedef OutputResult
 * @property {number} status 
 * @property {string} stdout
 * @property {string} stderr


/**
 * Executes the provided shell command
 * @param {string} cmd - Shell command to execute
 * @returns {OutputResult} - Output of the shell command
 */
function run(cmd) {
	core.info(cmd);
    
	try {
		const stdout = execSync(cmd, {
			encoding: "utf8",
			cwd: optionsWithDefaults.dir,
			maxBuffer: 20 * 1024 * 1024,
		}).trim();
        core.info(`Stdout: ${stdout}`);
        return {
            status: 0,
            stdout: stdout,
            stderr: "",
        };
	} catch (error) {
        return {
            status: error.status,
            stdout: error.stdout,
            stderr: error.stderr,
        };
	}
}

module.exports = {
	run,
};
