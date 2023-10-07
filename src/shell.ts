import path from "node:path";
import url from "node:url";

import shell from "shelljs";

const dirName = url.fileURLToPath(new URL(".", import.meta.url));

// Docs: https://github.com/ggerganov/whisper.cpp
const whisperCppPath = path.join(dirName, "..", "lib/whisper.cpp");
const whisperCppMain = "./main";

export interface IShellOptions {
	silent: boolean; // true: won't print to console
	async: boolean;
}

// default passed to shelljs exec
const defaultShellOptions = {
	silent: true, // true: won't print to console
	async: false,
};

export default async function whisperShell(
	command: string,
	options: IShellOptions = defaultShellOptions,
): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			// Docs: https://github.com/shelljs/shelljs#execcommand--options--callback
			shell.exec(command, options, (code, stdout, stderr) =>
				code === 0 ? resolve(stdout) : reject(stderr),
			);
		} catch (error) {
			reject(error);
		}
	});
}

try {
	// shell.cd(dirName + WHISPER_CPP_PATH);
	shell.cd(whisperCppPath);

	// ensure command exists in local path
	if (!shell.which(whisperCppMain)) {
		console.error(`whisper.cpp not initialized. Current directory: ${dirName}`);
		console.error(`attempting to run "make" command in /whisper directory...`);

		// TODO: move this?
		shell.exec("make", defaultShellOptions);

		if (!shell.which(whisperCppMain)) {
			console.error(
				`"make" command failed. Please run "make" command in /whisper directory. Current directory: ${dirName}`,
			);
			process.exit(-1);
		}

		console.log(`"make" command successful. Current directory: ${dirName}`);
	}
} catch (error) {
	console.log("error caught in try catch block");
	throw error;
}
