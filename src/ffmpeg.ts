import * as path from "node:path";
import * as fs from "node:fs/promises";

import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface ConvertOptions {
	// TODO: Not yet supported:
	// signal?: AbortSignal;
}

export async function convertFileToProcessableFile(
	inputFile: string,
	outputFile: string,
	_options?: ConvertOptions,
) {
	// const signal = options?.signal;

	// Taken from the whisper.cpp docs:
	// ffmpeg -i input.mp3 -ar 16000 -ac 1 -c:a pcm_s16le output.wav
	const command = ffmpeg(inputFile)
		.audioFrequency(16000)
		.audioChannels(1)
		.audioCodec("pcm_s16le")
		.output(outputFile);

	return new Promise((resolve, reject) => {
		command.once("end", resolve);
		command.once("error", reject);
		command.run();
	});
}
