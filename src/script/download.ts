#!/usr/bin/env node

// Javascript layer for using the whisper.cpp built-in model downloader scripts
// npx @pr0gramm/fluester download

import { createInterface } from "node:readline/promises";

import { canExecute, execute } from "../execute.js";
import { nodeModulesModelPath } from "../interop.js";
import { ModelName, defaultModel, modelList, modelStats } from "../model.js";

async function determineModel() {
	// ["/usr/bin/node", "../.bin/download", <model name>]
	const parameterModel = process.argv[2];
	if (parameterModel) {
		if (modelList.includes(parameterModel as ModelName)) {
			return parameterModel;
		}

		console.error(`Invalid model name: "${parameterModel}"`);
		console.log(`Valid model names are: ${modelList.join(", ")}`);
		process.exit(-1);
	}

	const envModel = process.env.WHISPER_MODEL;
	if (!!envModel && modelList.includes(envModel as ModelName)) {
		return envModel;
	}

	const rl = createInterface({ input: process.stdin, output: process.stdout });

	console.log("Which model should be downloaded?");
	console.log("You can skip this question by:");
	console.log("- passing the model as an env var: WHISPER_MODEL=tiny or");
	console.log("- as a parameter: `npx @pr0gramm/fluester download tiny`");
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

	console.error(`Invalid model name: "${answer}"`);
	console.log(`Valid model names are: ${modelList.join(", ")}`);
	process.exit(-1);
}

try {
	process.chdir(nodeModulesModelPath);

	// ensure running in correct path
	if (!(await canExecute("./download-ggml-model.sh"))) {
		throw new Error(
			"Cannot run downloader. Maybe the path is incorrect or the current working directory is not correct.",
		);
	}

	const modelName = await determineModel();

	const scriptPath =
		process.platform === "win32"
			? "download-ggml-model.cmd"
			: "./download-ggml-model.sh";

	await execute(scriptPath, [modelName], true);

	console.log(`Model "${modelName}" downloaded successfully.`);

	process.exit(0);
} catch (error) {
	console.log("Error while downloading model:");
	console.log(error);
	throw error;
}
