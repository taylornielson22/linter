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
			maxBuffer: 20 * 1024 * 1024,
		});
        core.info(`Stdout: ${stdout}`);
        return {
            status: 0,
            stdout: stdout.trim(),
            stderr: "",
        };
	} catch (error) {
        core.info(error);
        return {
            status: error.status,
            stdout: `Stdout: ${error.stdout}`.trim(),
            stderr: `Stderr ${error.stderr}`.trim(),
        };
	}
}

module.exports = {
	run,
};
