const { execSync } = require("child_process");

const core = require("@actions/core");

const RUN_OPTIONS_DEFAULTS = { dir: null, ignoreErrors: false, prefix: "" };


/**
 * Executes the provided shell command
 * @param {string} cmd - Shell command to execute
 * @returns {{status: number, stdout: string, stderr: string}} - Output of the shell command
 */
function run(cmd) {
	core.debug(cmd);
	try {
		const stdout = execSync(cmd, {
			encoding: "utf8",
			cwd: optionsWithDefaults.dir,
			maxBuffer: 20 * 1024 * 1024,
		});
		core.debug(`Stdout: ${stdout.trim()}`);
		return output;
	} catch (error) {
			core.debug(`Exit code: ${error.status}`);
			core.debug(`Stdout: ${errort.stdout}`);
			core.debug(`Stderr: ${error.stderr}`);
			return output;
	}
}

module.exports = {
	run,
};
