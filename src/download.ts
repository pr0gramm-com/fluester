#! /usr/bin/env node

// Javascript layer for using the whisper.cpp built-in model downloader scripts
// npx @pr0gramm/fluester download

import { createInterface } from "node:readline/promises";

import shell from "shelljs";

import {
	ModelName,
	modelList,
	modelStats,
	defaultModel,
	nodeModulesModelPath,
} from "./model.js";

const askModel = async () => {
	const envModel = process.env.WHISPER_MODEL;
	if (!!envModel && modelList.includes(envModel as ModelName)) {
		return envModel;
	}

	const rl = createInterface({ input: process.stdin, output: process.stdout });

	const answer = await rl.question(
		`\nEnter model name (e.g. 'base.en') or 'cancel' to exit\n(ENTER for ${defaultModel}): `,
	);

	switch (answer) {
		case "":
			// User just pressed enter
			console.log("Going with ", defaultModel);
			return defaultModel;
		case "cancel":
			console.log(
				"Exiting model downloader. Run again with: 'npx whisper-node download'",
			);
			process.exit(0);
		default:
			if (!modelList.includes(answer as ModelName)) {
				console.log();
				console.log(
					"FAIL: Name not found. Check your spelling OR quit wizard and use custom model.",
				);
				return await askModel();
			}
			return answer;
	}
};

export default async function downloadModel() {
	try {
		// shell.exec("echo $PWD");
		shell.cd(nodeModulesModelPath);

		console.table(modelStats);

		// ensure running in correct path
		if (!shell.which("./download-ggml-model.sh")) {
			throw "whisper-node downloader is not being run from the correct path! cd to project root and run again.";
		}

		const modelName = await askModel();

		// default is .sh
		let scriptPath = "./download-ggml-model.sh";
		// windows .cmd version
		if (process.platform === "win32") scriptPath = "download-ggml-model.cmd";

		// todo: check if windows or unix to run bat command or .sh command
		shell.exec(`${scriptPath} ${modelName}`);

		console.log("Attempting to compile model...");

		// move up directory, run make in whisper.cpp
		shell.cd("../");
		// this has to run in whichever directory the model is located in??
		shell.exec("make");

		process.exit(0);
	} catch (error) {
		console.log("ERROR Caught in downloadModel");
		console.log(error);
		return error;
	}
}

// runs after being called in package.json
downloadModel();
