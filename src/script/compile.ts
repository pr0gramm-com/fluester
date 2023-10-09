#!/usr/bin/env node

import { canExecute, execute } from "../execute.js";
import { nodeModulesWhisper } from "../interop.js";

// Docs: https://github.com/ggerganov/whisper.cpp
const whisperCppMain = "./main";

try {
	process.chdir(nodeModulesWhisper);

	if (!(await canExecute(whisperCppMain))) {
		console.log("whisper.cpp not initialized. Compiling whisper.cpp...");

		await execute("make");

		if (!(await canExecute(whisperCppMain))) {
			console.error(
				`"make" command failed. Please run "make" command in whisper directory. Current directory: ${nodeModulesWhisper}`,
			);
			process.exit(-1);
		}
	}

	const test = await execute(whisperCppMain, ["--help"]);
	if (test.exitCode === 0 && test.stderr.length > 0) {
		console.log("whisper.cpp initialized successfully");
	} else {
		console.error("Could not run whisper.cpp");
		process.exit(-1);
	}
} catch (error) {
	console.log("Error caught");
	throw error;
}
