#!/usr/bin/env node

import path from "node:path";
import url from "node:url";

import { canExecute, execute } from "../execute.js";

const dirName = url.fileURLToPath(new URL(".", import.meta.url));

// Docs: https://github.com/ggerganov/whisper.cpp
const whisperCppPath = path.join(dirName, "..", "..", "lib/whisper.cpp");
const whisperCppMain = "./main";

try {
	process.chdir(whisperCppPath);

	if (!(await canExecute(whisperCppMain))) {
		console.log("whisper.cpp not initialized. Compiling whisper.cpp...");

		await execute("make");

		if (!(await canExecute(whisperCppMain))) {
			console.error(
				`"make" command failed. Please run "make" command in whisper directory. Current directory: ${dirName}`,
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
