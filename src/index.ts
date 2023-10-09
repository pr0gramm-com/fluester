import * as fs from "node:fs/promises";
import * as path from "node:path";

import { execute } from "./execute.js";
import { defaultExecutablePath, nodeModulesModelPath } from "./interop.js";
import { ModelName, modelFileNames } from "./model.js";
import transcriptToArray, { TranscriptLine } from "./transcript.js";

export interface WhisperClientOptions {
	/** Path to the whisper executable */
	executablePath?: string;
}

export interface WhisperOptionsBase {
	whisperOptions?: FlagTypes;
	// TODO: AbortSignal support
}

export interface WhisperOptionsWithModelPath extends WhisperOptionsBase {
	modelPath: string;
}
export interface WhisperOptionsWithModelName extends WhisperOptionsBase {
	/**
	 * Name of model stored in `node_modules/@pr0gramm/fluester/lib/whisper.cpp/models`
	 *
	 * The name you entered when downloading the model.
	 */
	modelName: ModelName;
}

export type WhisperOptions =
	| WhisperOptionsWithModelPath
	| WhisperOptionsWithModelName;

export interface WhisperClient {
	/**
	 * @param filePath The audio file to translate.
	 * @param options
	 * @returns English translation of the audio file. If it's already english, it will be a transcription.
	 */
	translate: (
		filePath: string,
		options: WhisperOptions,
	) => Promise<TranscriptLine[]>;
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
		/**
		 * @param filePath The audio file to translate.
		 * @param options
		 * @returns English translation of the audio file. If it's already english, it will be a transcription.
		 */
		translate: async (filePath: string, options: WhisperOptions) => {
			try {
				const modelPath = getModelPath(options);
				if (!(await fs.stat(modelPath))) {
					throw new Error(`Model not found at "${modelPath}".`);
				}

				// 1. create command string for whisper.cpp
				const flags = options.whisperOptions
					? getFlags(options.whisperOptions)
					: [];

				const args = [...flags, "-m", modelPath, "-f", filePath];

				// 2. run command in whisper.cpp directory
				// TODO: add return for continually updated progress value
				const transcript = await execute(effectiveOptions.executablePath, args);

				// 3. parse whisper response string into array
				return transcriptToArray(transcript.stdout.toString());
			} catch (cause) {
				throw new Error("Error during whisper operation", { cause });
			}
		},
	};
}

function getModelPath(options: WhisperOptions) {
	return "modelPath" in options
		? options.modelPath
		: path.join(nodeModulesModelPath, modelFileNames[options.modelName]);
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
