import { TranscriptLine } from "./transcript";

export function createWebVttString(transcript: TranscriptLine[]): string {
  const builder = ["WEBVTT", "\n"];

  for(const {start, end, speech} of transcript) {
    builder.push(`${start} --> ${end}`);
    for(const split of speech.split("\n")) {
      builder.push(`${split}`);
    }
    builder.push("\n");
  }

  return builder.join("\n");
}

