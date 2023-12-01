export const defaultModel = "base.en";

// model list: https://github.com/ggerganov/whisper.cpp/#more-audio-samples
export const modelList = [
	"tiny.en",
	"tiny",
	"base.en",
	"base",
	"small.en",
	"small",
	"medium.en",
	"medium",
	"large-v1",
	"large-v2",
	"large-v3",
] as const;

export type ModelName = (typeof modelList)[number];

export const modelFileNames: Record<ModelName, string> = {
	tiny: "ggml-tiny.bin",
	"tiny.en": "ggml-tiny.en.bin",
	base: "ggml-base.bin",
	"base.en": "ggml-base.en.bin",
	small: "ggml-small.bin",
	"small.en": "ggml-small.en.bin",
	medium: "ggml-medium.bin",
	"medium.en": "ggml-medium.en.bin",
	"large-v1": "ggml-large-v1.bin",
	"large-v2": "ggml-large-v2.bin",
	"large-v3": "ggml-large-v3.bin",
};

/**
 * Ref: https://github.com/ggerganov/whisper.cpp/tree/master/models
 */
export const modelStats: Record<ModelName, { disk: string; ram: string }> = {
	"tiny.en": {
		disk: "75 MB",
		ram: "~390 MB",
	},
	tiny: {
		disk: "75 MB",
		ram: "~390 MB",
	},
	"base.en": {
		disk: "142 MB",
		ram: "~500 MB",
	},
	base: {
		disk: "142 MB",
		ram: "~500 MB",
	},
	"small.en": {
		disk: "466 MB",
		ram: "~1.0 GB",
	},
	small: {
		disk: "466 MB",
		ram: "~1.0 GB",
	},
	"medium.en": {
		disk: "1.5 GB",
		ram: "~2.6 GB",
	},
	medium: {
		disk: "1.5 GB",
		ram: "~2.6 GB",
	},
	"large-v1": {
		disk: "2.9 GB",
		ram: "~4.7 GB",
	},
	"large-v2": {
		disk: "2.9 GB", // TODO: Find correct size
		ram: "~4.7 GB", // TODO: Find correct size
	},
	"large-v3": {
		disk: "2.9 GB", // TODO: Find correct size
		ram: "~4.7 GB", // TODO: Find correct size
	},
};
