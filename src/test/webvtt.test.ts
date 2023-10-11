import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createWebVttString } from "../webvtt.js";

describe("webvtt", () => {
	const basic_ok = `WEBVTT

00:00:00.000 --> 00:00:01.000
Hello`;
	test("basic ok", () => {
		assert.deepStrictEqual(
			createWebVttString([
				{
					start: "00:00:00.000",
					end: "00:00:01.000",
					speech: "Hello",
				},
			]),
			basic_ok,
		);
	});

	const multiple_ok = `WEBVTT

00:00:00.000 --> 00:00:01.000
Hello

00:00:02.000 --> 00:00:03.000
World

00:00:04.000 --> 00:00:05.000
!`;

	test("multiple ok", () => {
		assert.deepStrictEqual(
			createWebVttString([
				{
					start: "00:00:00.000",
					end: "00:00:01.000",
					speech: "Hello",
				},
				{
					start: "00:00:02.000",
					end: "00:00:03.000",
					speech: "World",
				},
				{
					start: "00:00:04.000",
					end: "00:00:05.000",
					speech: "!",
				},
			]),
			multiple_ok,
		);
	});

	test("invalid timestamps", () => {
		assert.throws(() => {
			createWebVttString([
				{
					start: "aaaa",
					end: "bbbbb",
					speech: "fail",
				},
			]);
		}, "throws assertion error");
	});

	test("negative end-start", () => {
		assert.throws(() => {
			createWebVttString([
				{
					start: "00:01:00.000",
					end: "00:00:01.000",
					speech: "fail",
				},
			]);
		}, "throws assertion error");
	});
});
