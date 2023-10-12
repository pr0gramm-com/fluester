import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import {
	convertFileToProcessableFile,
	convertBufferToProcessableFile,
} from "./ffmpeg.js";

// Taken from the samples dir:
// https://github.com/ggerganov/whisper.cpp/tree/master/samples
const urls = {
	a: "https://upload.wikimedia.org/wikipedia/commons/2/22/George_W._Bush%27s_weekly_radio_address_%28November_1%2C_2008%29.oga",
};

describe("ffmpeg", () => {
	/*
	test("basic buffer conversion", async () => {
		const res = await fetch(urls.a).then((r) => r.arrayBuffer());
		const buffer = new Uint8Array(res);

		const result = await convertBufferToProcessableFile(buffer);

		assert.ok(result.length > 0);
	});
	*/

	test("basic file conversion", async () => {
		await using tempDir = await TempDir.create("temp-fluester-test-");

		const inputFile = tempDir.file("inputFileBuffer.oga");
		const inputFileBuffer = await fetch(urls.a)
			.then((r) => r.arrayBuffer())
			.then((ab) => new Uint8Array(ab));

		await fs.writeFile(inputFile, inputFileBuffer);

		const outFile = tempDir.file("out.wav");

		await convertFileToProcessableFile(inputFile, outFile);

		const actual = await fs.stat(outFile);
		assert.ok(actual.size > 0);
	});
});

class TempDir implements AsyncDisposable {
	private constructor(public readonly path: string) {}

	static async create(prefix: string): Promise<TempDir> {
		const tempDir = await fs.mkdtemp(prefix);
		return new TempDir(tempDir);
	}

	file(...pathSegments: string[]): string {
		return path.join(this.path, ...pathSegments);
	}

	async [Symbol.asyncDispose]() {
		return fs.rm(this.path, { recursive: true, force: true });
	}
}
