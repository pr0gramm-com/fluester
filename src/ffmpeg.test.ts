import { Readable } from "node:stream";
import { createWriteStream } from "node:fs";
import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import {
	convertFileToProcessableFile,
	pipeStreamToProcessableStream,
} from "./ffmpeg.js";

// Taken from the samples dir:
// https://github.com/ggerganov/whisper.cpp/tree/master/samples
const urls = {
	a: "https://upload.wikimedia.org/wikipedia/commons/2/22/George_W._Bush%27s_weekly_radio_address_%28November_1%2C_2008%29.oga",
};

function fetchFile(url: string) {
	return fetch(url)
		.then((r) => r.arrayBuffer())
		.then((ab) => new Uint8Array(ab));
}

describe("ffmpeg", () => {
	test("basic file conversion", async () => {
		await using tempDir = await TempDir.create("temp-fluester-test-");

		const inputFileBuffer = await fetchFile(urls.a);
		const input = Readable.from(inputFileBuffer);

		const outFile = tempDir.file("out.wav");
		const output = createWriteStream(outFile);

		await pipeStreamToProcessableStream(input, output);

		const actual = await fs.stat(outFile);
		assert.ok(actual.size > 0);
	});

	test("basic file conversion", async () => {
		await using tempDir = await TempDir.create("temp-fluester-test-");

		const inputFile = tempDir.file("inputFileBuffer.oga");
		const inputFileBuffer = await fetchFile(urls.a);

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

	[Symbol.asyncDispose]() {
		return fs.rm(this.path, { recursive: true, force: true });
	}
}
