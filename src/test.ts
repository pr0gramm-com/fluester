import { createWhisperClient } from "./index.js";

(async function run() {
	const client = createWhisperClient({
		modelName: "base.en",
	});

	try {
		const transcript = await client.translate(
			"/Users/Shared/twospeak_clip.wav",
			{
				// modelPath: "/Users/Shared/custom-models/ggml-base.en.bin",
				whisperOptions: { wordTimestamps: true },
			},
		);

		console.log("transcript", transcript);
	} catch (error) {
		console.log("ERROR", error);
	}
})();
