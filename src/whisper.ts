// todo: remove all imports from file
import { existsSync } from "node:fs";

import { defaultModel, modelFileNames, ModelName } from "./model.js";

// return as syntax for whisper.cpp command
export function createCppCommand({
	filePath,
	modelName = null,
	modelPath = null,
	options = { word_timestamps: true },
}: CppCommandTypes) {
	const model = modelPathOrName(modelName, modelPath);
	return `./main ${getFlags(options)} -m ${model} -f ${filePath}`;
}

function modelPathOrName(mn: string, mp: string) {
	if (mn && mp) {
		throw new Error("Submit a modelName OR a modelPath. NOT BOTH!");
	}

	if (!mn && !mp) {
		console.log(
			"No 'modelName' or 'modelPath' provided. Trying default model:",
			defaultModel,
			"\n",
		);

		// second model name check to verify is installed in directory
		const modelPath = `./models/${modelFileNames[defaultModel]}`;

		if (!existsSync(modelPath)) {
			// throw `'${mn}' not downloaded! Run 'npx whisper-node download'`;
			throw `'${defaultModel}' not downloaded! Run 'npx whisper-node download'\n`;
		}

		return modelPath;
	}

	// model path
	if (mp) {
		return mp;
	}

	// model name
	if (modelFileNames[mn]) {
		// second modelname check to verify is installed in directory
		const modelPath = `./models/${modelFileNames[mn]}`;

		if (!existsSync(modelPath)) {
			throw `'${mn}' not found! Run 'npx whisper-node download'`;
		}

		return modelPath;
	}

	if (mn) {
		throw new Error(
			`modelName "${mn}" not found in list of models. Check your spelling OR use a custom modelPath.`,
		);
	}

	throw new Error(
		`modelName OR modelPath required! You submitted modelName: '${mn}', modelPath: '${mp}'`,
	);
}

// option flags list: https://github.com/ggerganov/whisper.cpp/blob/master/README.md?plain=1#L91
function getFlags(flags: IFlagTypes): string {
	const s = [];

	// output files
	if (flags["gen_file_txt"]) {
		s.push("-otxt");
	}
	if (flags["gen_file_subtitle"]) {
		s.push("-osrt");
	}
	if (flags["gen_file_vtt"]) {
		s.push("-ovtt");
	}

	// timestamps
	if (flags["timestamp_size"]) {
		s.push("-ml " + flags["timestamp_size"]);
	}
	if (flags["word_timestamps"]) {
		s.push("-ml 1");
	}

	return s.join(" ");
}

type CppCommandTypes = {
	filePath: string;
	modelName?: ModelName;
	modelPath?: string;
	options?: IFlagTypes;
};

export type IFlagTypes = {
	gen_file_txt?: boolean;
	gen_file_subtitle?: boolean;
	gen_file_vtt?: boolean;
	timestamp_size?: number;
	word_timestamps?: boolean;
};
