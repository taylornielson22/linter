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
		const output = {
			status: 0,
			stdout: stdout.trim(),
			stderr: "",
		};
		core.debug(`Stdout: ${output.stdout}`);
		return output;
	} catch (err) {
		if (optionsWithDefaults.ignoreErrors) {
			const output = {
				status: err.status,
				stdout: err.stdout.trim(),
				stderr: err.stderr.trim(),
			};

			core.debug(`Exit code: ${output.status}`);
			core.debug(`Stdout: ${output.stdout}`);
			core.debug(`Stderr: ${output.stderr}`);

			return output;
		}
		throw err;
	}
}

module.exports = {
	run,
};
