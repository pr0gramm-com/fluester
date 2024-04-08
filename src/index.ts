import * as fs from "node:fs/promises";
import * as path from "node:path";

import { execute } from "./execute.js";
import { defaultExecutablePath, nodeModulesModelPath } from "./interop.js";
import { type ModelName, modelFileNames } from "./model.js";
import transcriptToArray, {
	type LanguageDetectionResult,
	type TranscriptLine,
	parseDetectedLanguage,
} from "./transcript.js";

export { createWebVttString } from "./webvtt.js";
export { convertFileToProcessableFile } from "./ffmpeg.js";

export interface WhisperClientOptionsBase {
	/** Path to the whisper executable */
	executablePath?: string;
}

export interface WhisperClientOptionsWithModelName
	extends WhisperClientOptionsBase {
	/**
	 * Name of model stored in `node_modules/@pr0gramm/fluester/lib/whisper.cpp/models`
	 *
	 * The name you entered when downloading the model.
	 */
	modelName: ModelName;
}
export interface WhisperClientOptionsWithModelPath
	extends WhisperClientOptionsBase {
	modelPath: string;
}

export type WhisperClientOptions =
	| WhisperClientOptionsWithModelName
	| WhisperClientOptionsWithModelPath;

export interface WhisperOptions {
	whisperOptions?: FlagTypes;
	sourceLanguage?: string;
	signal?: AbortSignal;
}

export interface WhisperClient {
	/**
	 * @param filePath The audio file to translate. **Audio file must be in a processable format.**
	 * @param options
	 * @returns English translation of the audio file. If it's already english, it will be a transcription.
	 * @throws If the model provided at {@link createWhisperClient} is not found.
	 */
	translate: (
		filePath: string,
		options: WhisperOptions,
	) => Promise<TranscriptLine[]>;

	/**
	 * @param filePath The audio file to transcribe. **Audio file must be in a processable format.**
	 * @param options
	 * @returns Transcription of the audio file.
	 * @throws If the model provided at {@link createWhisperClient} is not found.
	 */
	transcribe: (
		filePath: string,
		options: WhisperOptions,
	) => Promise<TranscriptLine[]>;

	/**
	 * Detects the language of the audio file
	 * @param filePath The audio file to detect the language of.
	 * @returns `undefined` if there was an error or the language could not be detected.
	 * @remarks Audio file must be in a processable format just like when using {@link translate}.
	 * @throws If the model provided at {@link createWhisperClient} is not found.
	 */
	detectLanguage: (
		filePath: string,
	) => Promise<LanguageDetectionResult | undefined>;
}

export function createWhisperClient(
	options: WhisperClientOptions,
): WhisperClient {
	const effectiveOptions = {
		executablePath: defaultExecutablePath,
		...options,
		modelPath: getModelPath(options),
	};

	async function ensureModel() {
		if (!(await fs.stat(effectiveOptions.modelPath))) {
			throw new Error(`Model not found at "${effectiveOptions.modelPath}".`);
		}
	}

	return {
		translate: async (filePath: string, options: WhisperOptions) => {
			await ensureModel();

			try {
				const flags = options.whisperOptions
					? getFlags(options.whisperOptions)
					: [];

				const args = [
					...flags,
					"-tr",
					"-m",
					effectiveOptions.modelPath,
					"-f",
					filePath,
				];

				// TODO: add return for continually updated progress value
				const translation = await execute(
					effectiveOptions.executablePath,
					args,
					false,
					options.signal,
				);

				if (options.signal?.aborted) {
					throw new Error("Operation aborted");
				}

				return transcriptToArray(translation.stdout.toString());
			} catch (cause) {
				throw new Error("Error during whisper operation", { cause });
			}
		},

		transcribe: async (filePath: string, options: WhisperOptions) => {
			await ensureModel();

			try {
				const flags = options.whisperOptions
					? getFlags(options.whisperOptions)
					: [];

				const args = [
					...flags,
					"-m",
					effectiveOptions.modelPath,
					"-f",
					filePath,
				];

				// TODO: add return for continually updated progress value
				const transcription = await execute(
					effectiveOptions.executablePath,
					args,
					false,
					options.signal,
				);

				if (options.signal?.aborted) {
					throw new Error("Operation aborted");
				}

				return transcriptToArray(transcription.stdout.toString());
			} catch (cause) {
				throw new Error("Error during whisper operation", { cause });
			}
		},

		detectLanguage: async (filePath: string) => {
			await ensureModel();

			const result = await execute(
				effectiveOptions.executablePath,
				["--detect-language", "-m", effectiveOptions.modelPath, filePath],
				true,
			);

			// TODO: Check for probability threshold
			return parseDetectedLanguage(result.stderr.toString());
		},
	};
}

function getModelPath(options: WhisperClientOptions) {
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
