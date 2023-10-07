// todo: remove all imports from file
import { existsSync } from "node:fs";

import { ModelName, modelFileNames } from "./model.js";

// return as syntax for whisper.cpp command
export function createCppCommand({
	filePath,
	modelName = undefined,
	modelPath = undefined,
	options = { word_timestamps: true },
}: CppCommandTypes) {
	const model = modelPathOrName(modelName, modelPath);
	return `./main ${getFlags(options)} -m ${model} -f ${filePath}`;
}

function modelPathOrName(
	modelName: ModelName | undefined,
	modelPath: string | undefined,
) {
	if (modelName && modelPath) {
		throw new Error("Submit a modelName OR a modelPath. NOT BOTH!");
	}
	if (!modelName && !modelPath) {
		throw new Error("No 'modelName' or 'modelPath' provided");
	}

	if (modelPath) {
		return modelPath;
	}

	if (!modelName || !(modelName in modelFileNames)) {
		throw new Error(`Invalid model name: "${modelName}"`);
	}

	const correspondingPath = `./models/${modelFileNames[modelName]}`;
	if (!existsSync(correspondingPath)) {
		throw new Error(
			`"${modelName}" not found. Run "npx @pr0gramm/fluester download"`,
		);
	}
	return correspondingPath;
}

// option flags list: https://github.com/ggerganov/whisper.cpp/blob/master/README.md?plain=1#L91
function getFlags(flags: IFlagTypes): string {
	const s = [];

	// output files
	if (flags.gen_file_txt) {
		s.push("-otxt");
	}
	if (flags.gen_file_subtitle) {
		s.push("-osrt");
	}
	if (flags.gen_file_vtt) {
		s.push("-ovtt");
	}

	// timestamps
	if (flags.timestamp_size) {
		s.push(`-ml ${flags.timestamp_size}`);
	}
	if (flags.word_timestamps) {
		s.push("-ml 1");
	}

	return s.join(" ");
}

export interface CppCommandTypes {
	filePath: string;
	modelName?: ModelName;
	modelPath?: string;
	options?: IFlagTypes;
}

export interface IFlagTypes {
	gen_file_txt?: boolean;
	gen_file_subtitle?: boolean;
	gen_file_vtt?: boolean;
	timestamp_size?: number;
	word_timestamps?: boolean;
}
