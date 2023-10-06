# fluester
Node.js bindings for OpenAI's Whisper. Hard-fork of [whisper-node](https://github.com/ariym/whisper-node).

## Features
- Output transcripts to **JSON** (also .txt .srt .vtt)
- **Optimized for CPU** (Including Apple Silicon ARM)
- Timestamp precision to single word

## Installation
1. Add dependency to project
```sh
npm install @pr0gramm/fluester
```

2. Download whisper model of choice
```sh
npx @pr0gramm/fluester download
```

## Usage
```js
import whisper from "@pr0gramm/fluester";

const transcript = await whisper("example/sample.wav");

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
    gen_file_txt: false, // outputs .txt file
    gen_file_subtitle: false, // outputs .srt file
    gen_file_vtt: false, // outputs .vtt file
    timestamp_size: 10, // amount of dialogue per timestamp pair
    word_timestamps: true // timestamp for every word
  }
}

const transcript = await whisper(filePath, options);
```

## Made with
- A lot of love by @ariym at [whisper-node](https://github.com/ariym/whisper-node)
- [Whisper OpenAI (using C++ port by: ggerganov)](https://github.com/ggerganov/whisper.cpp)
- [ShellJS](https://www.npmjs.com/package/shelljs)

## Roadmap
None ¯\_(ツ)_/¯
