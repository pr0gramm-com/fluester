import * as assert from "node:assert/strict";
import { describe, test } from "node:test";

describe("arithmetic", () => {
	test("2 + 2", (t) => {
		assert.strictEqual(2 + 2, 4);
	});

	test("2 * 2", (t) => {
		assert.strictEqual(2 * 2, 4);
	});
});
