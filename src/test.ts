import { whisper } from "./index.js";

(async function run() {
	try {
		const transcript = await whisper("/Users/Shared/twospeak_clip.wav", {
			// modelPath: "/Users/Shared/custom-models/ggml-base.en.bin",
			// modelName: "base.en",
			whisperOptions: { wordTimestamps: true },
		});

		console.log("transcript", transcript);
	} catch (error) {
		console.log("ERROR", error);
	}
})();
