import assert from "node:assert";
import type { TranscriptLine } from "./transcript.js";

export function createWebVttString(transcript: TranscriptLine[]): string {
	const builder = ["WEBVTT", ""];

	for (const { start, end, speech } of transcript) {
		assert(start <= end, "start <= end");
		assert(
			"00:00:00.000".length === start.length,
			"00:00:00.000.length == start.length",
		);
		assert(
			"00:00:00.000".length === end.length,
			"00:00:00.000.length == end.length",
		);

		builder.push(`${start} --> ${end}`);
		for (const split of speech.split("\n")) {
			builder.push(`${split}`);
			builder.push("");
		}
	}

	return builder.join("\n").trim();
}
