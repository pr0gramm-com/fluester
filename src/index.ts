import path from "node:path";

import type { ModelName } from "./model.js";
import shell, { IShellOptions } from "./shell.js";
import transcriptToArray, { ITranscriptLine } from "./tsToArray.js";
import { IFlagTypes, createCppCommand } from "./whisper.js";

interface IOptions {
	modelName?: string; // name of model stored in node_modules/whisper-node/lib/whisper.cpp/models
	modelPath?: string; // custom path for model
	whisperOptions?: IFlagTypes;
	shellOptions?: IShellOptions;
}

/**
 * @param filePath Path to audio file.
 * @param options Whisper options.
 * @throws Some error if execution failed.
 */
export async function whisper(
	filePath: string,
	options?: IOptions,
): Promise<ITranscriptLine[]> {
	console.log("Transcribing:", filePath, "\n");

	try {
		// todo: combine steps 1 & 2 into separate function called whisperCpp (createCppCommand + shell)

		// 1. create command string for whisper.cpp
		const command = createCppCommand({
			filePath: path.normalize(filePath),
			modelName: options?.modelName as ModelName,
			modelPath: options?.modelPath,
			options: options?.whisperOptions,
		});

		// 2. run command in whisper.cpp directory
		// todo: add return for continually updated progress value
		const transcript = await shell(command, options?.shellOptions);

		// 3. parse whisper response string into array
		return transcriptToArray(transcript);
	} catch (cause) {
		throw new Error("Error during whisper operation", { cause });
	}
}
