# fluester – [ˈflʏstɐ] [![CI](https://github.com/pr0gramm-com/fluester/actions/workflows/CI.yml/badge.svg)](https://github.com/pr0gramm-com/fluester/actions/workflows/CI.yml) [![CD](https://github.com/pr0gramm-com/fluester/actions/workflows/CD.yml/badge.svg)](https://github.com/pr0gramm-com/fluester/actions/workflows/CD.yml) ![version](https://img.shields.io/npm/v/%40pr0gramm/fluester) ![downloads](https://img.shields.io/npm/dm/%40pr0gramm/fluester) ![License](https://img.shields.io/npm/l/%40pr0gramm%2Ffluester)

Node.js bindings for OpenAI's Whisper. Hard-fork of [whisper-node](https://github.com/ariym/whisper-node).

## Features
- Output transcripts to **JSON** (also .txt .srt .vtt)
- **Optimized for CPU** (Including Apple Silicon ARM)
- Timestamp precision to single word

## Installation
### Requirements
- `make` and everything else listed as required to compile [whisper.cpp](https://github.com/ggerganov/whisper.cpp)
- Node.js >= 20

1. Add dependency to project
```sh
npm install @pr0gramm/fluester
```

2. Download whisper model of choice
```sh
npx --package @pr0gramm/fluester download-model
```

3. Compile whisper.cpp if you don't want to provide you own version:
```sh
npx --package @pr0gramm/fluester compile-whisper
```

## Usage
*Important*: The API only supports WAV files (just like the original whisper.cpp). You need to convert any files to a supported format before.
You can do this using ffmpeg (example [taken from the whisper project](https://github.com/ggerganov/whisper.cpp)):
```sh
ffmpeg -i input.mp3 -ar 16000 -ac 1 -c:a pcm_s16le output.wav
```

### Translation
```js
import { createWhisperClient } from "@pr0gramm/fluester";

const client = createWhisperClient({
  modelName: "base",
});

const transcript = await client.translate("example/sample.wav");

console.log(transcript); // output: [ {start,end,speech} ]
```

#### Output (JSON)
```js
[
  {
    "start": "00:00:14.310", // timestamp start
    "end": "00:00:16.480", // timestamp end
    "speech": "howdy" // transcription
  }
]
```

### Language Detection
```js
import { createWhisperClient } from "@pr0gramm/fluester";

const client = createWhisperClient({
  modelName: "base",
});

const result = await client.detectLanguage("example/sample.wav");
if(!result) {
  console.log(`Detected: ${result.language} with probability ${result.probability}`);
} else {
  console.log("Did not detect anything :(");
}
```


## Tricks
This library is designed to work well in dockerized environments.

We took time and made some steps independent from each other, so they can be used in a multi-stage docker build.
```Dockerfile
FROM node:latest as dependencies
    WORKDIR /app
    COPY package.json package-lock.json ./
    RUN npm ci

    RUN npx --package @pr0gramm/fluester compile-whisper
    RUN npx --package @pr0gramm/fluester download-model tiny

FROM node:latest
    WORKDIR /app
    COPY --from=dependencies /app/node_modules /app/node_modules
    COPY ./ ./
```
This includes the model in the image. If you want to keep your image small, you can also download the model in your entrypoint using the commands above.

## Made with
- A lot of love by @ariym at [whisper-node](https://github.com/ariym/whisper-node)
- [Whisper OpenAI (using C++ port by: ggerganov)](https://github.com/ggerganov/whisper.cpp)

## Roadmap
- Nothing ¯\\\_(ツ)_/¯
