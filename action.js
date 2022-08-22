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
    const output = {
        status: 0,
        stdout: "",
        stderr: "",
    };
	try {
		const stdout = execSync(cmd, {
			encoding: "utf8",
			cwd: optionsWithDefaults.dir,
			maxBuffer: 20 * 1024 * 1024,
		});
        core.debug(`Stdout: ${output.stdout}`);
        output.stdout = stdout.trim(); 
	} catch (error) {
            output.status = error.status;
            output.stderr = error.stderr;
            output.stdout = error.stdout;
			core.debug(`Exit code: ${error.status}`);
            core.debug(`Stdout: ${error.stdout}`);
			core.debug(`Stderr: ${error.stderr}`);
	}
    
    return output;
}

module.exports = {
	run,
};
