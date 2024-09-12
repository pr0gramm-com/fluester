import * as a from "./dist/index.js";

const c = a.createWhisperClient({
    modelName: "base",
});

await a.convertFileToProcessableFile("/mnt/f/Downloads/prater.mp4", "prater.wav");

const x = await c.detectLanguage("prater.wav");
console.log(x);

const y = await c.transcribe("prater.wav", { sourceLanguage: x.language });
console.log(y);
