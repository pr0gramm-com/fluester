import path from "node:path";

import type { ModelName } from "./model.js";
import transcriptToArray, { TranscriptLine } from "./tsToArray.js";
import { FlagTypes, buildExecCommand } from "./whisper.js";
import { runCommand } from "./child.js";

export interface WhisperOptions {
	modelName?: string; // name of model stored in node_modules/whisper-node/lib/whisper.cpp/models
	modelPath?: string; // custom path for model
	whisperOptions?: FlagTypes;
}

/**
 * @param filePath Path to audio file.
 * @param options Whisper options.
 * @throws Some error if execution failed.
 */
export async function whisper(
	filePath: string,
	options?: WhisperOptions,
): Promise<TranscriptLine[]> {
	console.log("Transcribing:", filePath, "\n");

	try {
		// todo: combine steps 1 & 2 into separate function called whisperCpp (createCppCommand + shell)

		// 1. create command string for whisper.cpp
		const command = buildExecCommand({
			filePath: path.normalize(filePath),
			modelName: options?.modelName as ModelName,
			modelPath: options?.modelPath,
			options: options?.whisperOptions,
		});

		// 2. run command in whisper.cpp directory
		// todo: add return for continually updated progress value
		const transcript = await runCommand(...command);

		// 3. parse whisper response string into array
		return transcriptToArray(transcript);
	} catch (cause) {
		throw new Error("Error during whisper operation", { cause });
	}
}
