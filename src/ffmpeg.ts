import type { Readable, Writable } from "node:stream";

import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// biome-ignore lint/suspicious/noEmptyInterface: Reserved
export interface ConvertOptions {
	// TODO: Not yet supported:
	// signal?: AbortSignal;
}

/**
 * Converts a file to a file that whisper.cpp can work with.
 *
 * @param inputFile Any input file that ffmpeg supports. That means almost any audio or video file.
 * @param outputFile
 */
export async function convertFileToProcessableFile(
	inputFile: string,
	outputFile: string,
	_options?: ConvertOptions,
): Promise<void> {
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

// TODO: Not yet supported:
/*
async function pipeStreamToProcessableStream(
	input: Readable,
	output: Writable,
	_options?: ConvertOptions,
): Promise<void> {
	// const signal = options?.signal;

	// Taken from the whisper.cpp docs:
	// ffmpeg -i input.mp3 -ar 16000 -ac 1 -c:a pcm_s16le output.wav
	const command = ffmpeg(input)
		.audioFrequency(16000)
		.audioChannels(1)
		.audioCodec("pcm_s16le");

	return new Promise((resolve, reject) => {
		command.once("end", resolve);
		command.once("error", reject);
		command.pipe(output, { end: true });
	});
}
*/
