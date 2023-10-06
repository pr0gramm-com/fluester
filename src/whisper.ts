// todo: remove all imports from file
import { existsSync } from "node:fs";

import { DEFAULT_MODEL } from "./constants.js";
import { modelList, ModelName } from "./model.js";

// return as syntax for whisper.cpp command
export const createCppCommand = ({
	filePath,
	modelName = null,
	modelPath = null,
	options = { word_timestamps: true },
}: CppCommandTypes) =>
	`./main ${getFlags(options)} -m ${modelPathOrName(
		modelName,
		modelPath,
	)} -f ${filePath}`;

const modelPathOrName = (mn: string, mp: string) => {
	if (mn && mp) throw "Submit a modelName OR a modelPath. NOT BOTH!";
	else if (!mn && !mp) {
		console.log(
			"No 'modelName' or 'modelPath' provided. Trying default model:",
			DEFAULT_MODEL,
			"\n",
		);

		// second modelname check to verify is installed in directory
		const modelPath = `./models/${modelList[DEFAULT_MODEL]}`;

		if (!existsSync(modelPath)) {
			// throw `'${mn}' not downloaded! Run 'npx whisper-node download'`;
			throw `'${DEFAULT_MODEL}' not downloaded! Run 'npx whisper-node download'\n`;
		}

		return modelPath;
	}
	// modelpath
	else if (mp) return mp;
	// modelname
	else if (modelList[mn]) {
		// second modelname check to verify is installed in directory
		const modelPath = `./models/${modelList[mn]}`;

		if (!existsSync(modelPath)) {
			throw `'${mn}' not found! Run 'npx whisper-node download'`;
		}

		return modelPath;
	} else if (mn)
		throw `modelName "${mn}" not found in list of models. Check your spelling OR use a custom modelPath.`;
	else
		throw `modelName OR modelPath required! You submitted modelName: '${mn}', modelPath: '${mp}'`;
};

// option flags list: https://github.com/ggerganov/whisper.cpp/blob/master/README.md?plain=1#L91
const getFlags = (flags: IFlagTypes): string => {
	let s = "";

	// output files
	if (flags["gen_file_txt"]) s += " -otxt";
	if (flags["gen_file_subtitle"]) s += " -osrt";
	if (flags["gen_file_vtt"]) s += " -ovtt";
	// timestamps
	if (flags["timestamp_size"]) s += " -ml " + flags["timestamp-size"];
	if (flags["word_timestamps"]) s += " -ml 1";

	return s;
};

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
