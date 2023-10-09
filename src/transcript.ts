export interface TranscriptLine {
	start: string;
	end: string;
	speech: string;
}

export default function parseTranscript(vtt: string): TranscriptLine[] {
	// 1. separate lines at timestamp's open bracket
	const lines: string[] = vtt.split("[");

	// 2. remove the first line, which is empty
	lines.shift();

	// 3. convert each line into an object
	return lines.map((line) => {
		// 3a. split ts from speech
		const [timestamp, speech] = line.trim().split("]  ");

		// 3b. split timestamp into begin and end
		const [start, end] = timestamp.split(" --> ");

		// 3c. remove \n from speech with regex
		const normalizedSpeech = speech.replace(/\n/g, "").trim();

		return { start, end, speech: normalizedSpeech };
	});
}

export function parseDetectedLanguage(output: string): string | undefined {
	// whisper.cpp appears to use two-letter-country-code:
	// https://github.com/ggerganov/whisper.cpp/blob/940cdb13964a563d86c7dc6e160a43ec89b8bb2e/whisper.cpp#L195-L295

	// Example line:
	// whisper_full_with_state: auto-detected language: en (p = 0.958819)

	return (
		/auto-detected language: (\w\w)/.exec(output)?.[1]?.toLowerCase() ??
		undefined // coerce null to undefined
	);
}
