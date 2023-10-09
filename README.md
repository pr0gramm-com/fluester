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
```js
import { createWhisperClient } from "@pr0gramm/fluester";

const client = createWhisperClient();

const transcript = await client.translate("example/sample.wav");

console.log(transcript); // output: [ {start,end,speech} ]
```

### Output (JSON)
```js
[
  {
    "start": "00:00:14.310", // time stamp begin
    "end": "00:00:16.480", // time stamp end
    "speech": "howdy" // transcription
  }
]
```

### Usage with Additional Options
```js
import whisper from "@pr0gramm/fluester";

const filePath = "example/sample.wav", // required

const options = {
  modelName: "tiny.en", // default
  modelPath: "/custom/path/to/model.bin", // use model in a custom directory
  whisperOptions: {
    generateTxt: false, // outputs .txt file
    generateSubtitles: false, // outputs .srt file
    generateVtt: false, // outputs .vtt file
    timestampSize: 10, // amount of dialogue per timestamp pair
    wordTimestamps: true // timestamp for every word
  }
}

const transcript = await whisper(filePath, options);
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

This includes the model in the image. If you want to keep your image small, you can also download the model in your entrypoint using.

## Made with
- A lot of love by @ariym at [whisper-node](https://github.com/ariym/whisper-node)
- [Whisper OpenAI (using C++ port by: ggerganov)](https://github.com/ggerganov/whisper.cpp)

## Roadmap
- Nothing ¯\\\_(ツ)_/¯
