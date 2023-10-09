import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";

export async function execute(
	command: string,
	args?: readonly string[],
	shell = false,
): Promise<Buffer> {
	const child = spawn(command, args, {
		shell,
	});

	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		child.stdout.on("data", (d) => chunks.push(d));
		child.stdout.once("error", reject);
		child.stdout.once("end", () => {
			if (child.exitCode !== 0) {
				return reject(
					new Error(`Process returned with exit code ${child.exitCode}.`),
				);
			}
			resolve(Buffer.concat(chunks));
		});
	});
}

export async function canExecute(file: string) {
	try {
		await fs.access(file, fs.constants.X_OK);
		return true;
	} catch {
		return false;
	}
}
