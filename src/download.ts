#!/usr/bin/env node

// Javascript layer for using the whisper.cpp built-in model downloader scripts
// npx @pr0gramm/fluester download

import { createInterface } from "node:readline/promises";

import shell from "shelljs";

import { runCommand } from "./child.js";
import {
	ModelName,
	defaultModel,
	modelList,
	modelStats,
	nodeModulesModelPath,
} from "./model.js";

async function askModel() {
	const envModel = process.env.WHISPER_MODEL;
	if (!!envModel && modelList.includes(envModel as ModelName)) {
		return envModel;
	}

	const rl = createInterface({ input: process.stdin, output: process.stdout });

	console.table(modelStats);

	const answer = await rl.question(
		`\nEnter model name (e.g. 'base.en') or "cancel" to exit\n(default: "${defaultModel}"): `,
	);
	const answerNormalized = answer.trim().toLowerCase();

	if (answerNormalized === "") {
		return defaultModel;
	}
	if (answerNormalized === "cancel") {
		process.exit(-1);
	}

	if (modelList.includes(answer as ModelName)) {
		return answer;
	}

	console.error(`Invalid model name: ${answer}`);
	console.log(`Valid model names are: ${modelList.join(", ")}`);
	process.exit(-1);
}

export default async function downloadModel() {
	try {
		// shell.exec("echo $PWD");
		process.chdir(nodeModulesModelPath);

		// ensure running in correct path
		if (!shell.which("./download-ggml-model.sh")) {
			throw new Error(
				"Downloader is not being run from the correct path! cd to project root and run again.",
			);
		}

		const modelName = await askModel();

		const scriptPath =
			process.platform === "win32"
				? "download-ggml-model.cmd"
				: "./download-ggml-model.sh";

		shell.exec(`${scriptPath} ${modelName}`);

		console.log("Attempting to compile model...");

		// move up directory, run make in whisper.cpp
		process.chdir("../");

		// this has to run in whichever directory the model is located in??
		await runCommand("make");

		process.exit(0);
	} catch (error) {
		console.log("Error while downloading model:");
		console.log(error);
		throw error;
	}
}

// runs after being called in package.json
downloadModel();
