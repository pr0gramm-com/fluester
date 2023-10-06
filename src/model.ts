// model list: https://github.com/ggerganov/whisper.cpp/#more-audio-samples
export const modelList = Object.freeze({
	tiny: "ggml-tiny.bin",
	"tiny.en": "ggml-tiny.en.bin",
	base: "ggml-base.bin",
	"base.en": "ggml-base.en.bin",
	small: "ggml-small.bin",
	"small.en": "ggml-small.en.bin",
	medium: "ggml-medium.bin",
	"medium.en": "ggml-medium.en.bin",
	"large-v1": "ggml-large-v1.bin",
	large: "ggml-large.bin",
});

export type ModelName = keyof typeof modelList;

export const modelStats = Object.freeze({
	tiny: {
		disk: "75 MB",
		ram: "~390 MB",
	},
	"tiny.en": {
		disk: "75 MB",
		ram: "~390 MB",
	},
	base: {
		disk: "142 MB",
		ram: "~500 MB",
	},
	"base.en": {
		disk: "142 MB",
		ram: "~500 MB",
	},
	small: {
		disk: "466 MB",
		ram: "~1.0 GB",
	},
	"small.en": {
		disk: "466 MB",
		ram: "~1.0 GB",
	},
	medium: {
		disk: "1.5 GB",
		ram: "~2.6 GB",
	},
	"medium.en": {
		disk: "1.5 GB",
		ram: "~2.6 GB",
	},
	"large-v1": {
		disk: "2.9 GB",
		ram: "~4.7 GB",
	},
	large: {
		disk: "2.9 GB",
		ram: "~4.7 GB",
	},
});
