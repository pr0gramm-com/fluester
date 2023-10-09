import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";

export async function execute(
	command: string,
	args?: readonly string[],
	shell = false,
): Promise<string> {
	const child = spawn(command, args, {
		shell,
	});

	const chunks = await child.stdout.toArray();
	if (child.exitCode !== 0) {
		throw new Error(`Process returned with exit code ${child.exitCode}.`);
	}
	const result = Buffer.concat(chunks);
	return result.toString();
}

export async function canExecute(file: string) {
	try {
		await fs.access(file, fs.constants.X_OK);
		return true;
	} catch {
		return false;
	}
}
