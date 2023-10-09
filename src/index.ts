import { existsSync } from "node:fs";
import * as path from "node:path";

import { execute } from "./execute.js";
import { defaultExecutablePath } from "./interop.js";
import { ModelName, modelFileNames } from "./model.js";
import transcriptToArray, { TranscriptLine } from "./tsToArray.js";

export interface WhisperClientOptions {
	/** Path to the whisper executable */
	executablePath?: string;
	/** Path to the whisper models */
	// modelsPath: string;
}

export interface WhisperOptions {
	modelName?: string; // name of model stored in node_modules/@pr0gramm/fluester/lib/whisper.cpp/models
	modelPath?: string; // custom path for model
	whisperOptions?: FlagTypes;
	// TODO: AbortSignal support
}

export interface WhisperClient {
	translate: (filePath: string, options: WhisperOptions) => Promise<TranscriptLine[]>;
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
		translate: async (filePath: string, options?: WhisperOptions) => {
			try {
				// 1. create command string for whisper.cpp
				const args = buildCliArgs({
					filePath: path.normalize(filePath),
					modelName: options?.modelName as ModelName,
					modelPath: options?.modelPath,
					options: options?.whisperOptions,
				});

				// 2. run command in whisper.cpp directory
				// todo: add return for continually updated progress value
				const transcript = await execute(effectiveOptions.executablePath, args);

				// 3. parse whisper response string into array
				return transcriptToArray(transcript.toString());
			} catch (cause) {
				throw new Error("Error during whisper operation", { cause });
			}
		},
	};

	function buildCliArgs({
		filePath,
		modelName = undefined,
		modelPath = undefined,
		options = { wordTimestamps: true },
	}: CppCommandTypes) {
		const model = modelPathOrName(modelName, modelPath);
		return [...getFlags(options), "-m", model, "-f", filePath];
	}
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
		s.push("-ml");
		s.push(flags.timestampSize.toString());
	}
	if (flags.wordTimestamps) {
		s.push("-ml");
		s.push("1");
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
