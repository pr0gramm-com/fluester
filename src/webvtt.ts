import type { TranscriptLine } from "./transcript.js";

/**
 * Creates a WebVTT string from a transcript which can be used for <track> elements of a <video> or <audio> tag.
 *
 * References:
 * - https://en.wikipedia.org/wiki/WebVTT
 * - https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
 *
 * @throws If a timestamp has an invalid length
 * @throws If start > end
 */
export function createWebVttString(transcript: TranscriptLine[]): string {
	const builder = ["WEBVTT", ""];

	for (const { start, end, speech } of transcript) {
		if (start > end) {
			throw new Error("start > end");
		}

		if ("00:00:00.000".length !== start.length) {
			throw new Error("00:00:00.000.length !== start.length");
		}

		if ("00:00:00.000".length !== end.length) {
			throw new Error("00:00:00.000.length !== end.length");
		}

		builder.push(`${start} --> ${end}`);
		for (const split of speech.split("\n")) {
			builder.push(`${split}`);
			builder.push("");
		}
	}

	return builder.join("\n").trim();
}
