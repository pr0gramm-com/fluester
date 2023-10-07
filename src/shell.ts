import path from "node:path";
import url from "node:url";

import shell from "shelljs";

import { runCommand } from "./child.js";

const dirName = url.fileURLToPath(new URL(".", import.meta.url));

// Docs: https://github.com/ggerganov/whisper.cpp
const whisperCppPath = path.join(dirName, "..", "lib/whisper.cpp");
const whisperCppMain = "./main";

try {
	// process.chdir(dirName + WHISPER_CPP_PATH);
	process.chdir(whisperCppPath);

	// ensure command exists in local path
	if (!shell.which(whisperCppMain)) {
		console.error(`whisper.cpp not initialized. Current directory: ${dirName}`);
		console.error(`attempting to run "make" command in /whisper directory...`);

		// TODO: move this?
		await runCommand("make");

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
