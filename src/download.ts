#! /usr/bin/env node

// Javascript layer for using the whisper.cpp built-in model downloader scripts
//
// npx whisper-node download

import shell from "shelljs";

import { createInterface } from "node:readline/promises";

import { DEFAULT_MODEL, NODE_MODULES_MODELS_PATH } from "./constants";

const MODELS_LIST = [
	"tiny",
	"tiny.en",
	"base",
	"base.en",
	"small",
	"small.en",
	"medium",
	"medium.en",
	"large-v1",
	"large",
];

const askModel = async () => {
	const rl = createInterface({ input: process.stdin, output: process.stdout });

	const answer = await rl.question(
		`\nEnter model name (e.g. 'base.en') or 'cancel' to exit\n(ENTER for base.en): `,
	);

	if (answer === "cancel") {
		console.log(
			"Exiting model downloader. Run again with: 'npx whisper-node download'",
		);
		process.exit(0);
	}
	// user presses enter
	else if (answer === "") {
		console.log("Going with", DEFAULT_MODEL);
		return DEFAULT_MODEL;
	} else if (!MODELS_LIST.includes(answer)) {
		console.log(
			"\nFAIL: Name not found. Check your spelling OR quit wizard and use custom model.",
		);

		// re-ask question
		return await askModel();
	}

	return answer;
};

export default async function downloadModel() {
	try {
		// shell.exec("echo $PWD");
		shell.cd(NODE_MODULES_MODELS_PATH);

		const models = {
			tiny: {
				disk: "75 MB",
				ram: "~390 MB",
			},
			"tiny.en": {
				disk: "75 MB",
				ram: "~390 MB",
			},
			base: {
				disk: "142 MB",
				ram: "~500 MB",
			},
			"base.en": {
				disk: "142 MB",
				ram: "~500 MB",
			},
			small: {
				disk: "466 MB",
				ram: "~1.0 GB",
			},
			"small.en": {
				disk: "466 MB",
				ram: "~1.0 GB",
			},
			medium: {
				disk: "1.5 GB",
				ram: "~2.6 GB",
			},
			"medium.en": {
				disk: "1.5 GB",
				ram: "~2.6 GB",
			},
			"large-v1": {
				disk: "2.9 GB",
				ram: "~4.7 GB",
			},
			large: {
				disk: "2.9 GB",
				ram: "~4.7 GB",
			},
		};

		console.table(models);

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

		console.log("[whisper-node] Attempting to compile model...");

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
