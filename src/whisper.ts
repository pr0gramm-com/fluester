import { existsSync } from "node:fs";

import { defaultExecutablePath } from "./interop.js";
import { ModelName, modelFileNames } from "./model.js";

export interface WhisperClientOptions {
	/** Path to the whisper executable */
	executablePath?: string;
	/** Path to the whisper models */
	// modelsPath: string;
}

export interface WhisperClient {
	run: () => Promise<void>;
}

export function createWhisperClient(
	options: WhisperClientOptions,
): WhisperClient {
	const effectiveOptions = {
		executablePath: defaultExecutablePath,
		...options,
	};

	return {
		// TODO
		run: async () => {},
	};
}

export type AppCommand = [command: string, args: readonly string[]];

export function buildExecCommand({
	filePath,
	modelName = undefined,
	modelPath = undefined,
	options = { wordTimestamps: true },
}: CppCommandTypes): AppCommand {
	const model = modelPathOrName(modelName, modelPath);
	return ["./main", [...getFlags(options), "-m", model, "-f", filePath]];
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
function getFlags(flags: FlagTypes): string[] {
	const s = [];

	// output files
	if (flags.generateTxt) {
		s.push("-otxt");
	}
	if (flags.generateSubtitles) {
		s.push("-osrt");
	}
	if (flags.generateVtt) {
		s.push("-ovtt");
	}

	// timestamps
	if (flags.timestampSize) {
		s.push(`-ml ${flags.timestampSize}`);
	}
	if (flags.wordTimestamps) {
		s.push("-ml 1");
	}

	return s;
}

export interface CppCommandTypes {
	filePath: string;
	modelName?: ModelName;
	modelPath?: string;
	options?: FlagTypes;
}

export interface FlagTypes {
	/** Build TXT? */
	generateTxt?: boolean;
	/** Build SRT? */
	generateSubtitles?: boolean;
	/** Build VTT? */
	generateVtt?: boolean;
	timestampSize?: number;
	wordTimestamps?: boolean;
}
