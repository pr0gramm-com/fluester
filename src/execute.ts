import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";

export interface ExecuteResult {
	exitCode: number | null;
	stdout: Buffer;
	stderr: Buffer;
}

export async function execute(
	command: string,
	args?: readonly string[],
	shell = false,
): Promise<ExecuteResult> {
	const child = spawn(command, args, {
		shell,
	});

	return new Promise((resolve, reject) => {
		const stdOutChunks: Buffer[] = [];
		const stdErrChunks: Buffer[] = [];
		child.stdout.on("data", stdOutChunks.push.bind(stdOutChunks));
		child.stderr.on("data", stdErrChunks.push.bind(stdErrChunks));
		child.once("error", reject);
		child.once("close", () => {
			resolve({
				exitCode: child.exitCode,
				stdout: Buffer.concat(stdOutChunks),
				stderr: Buffer.concat(stdErrChunks),
			});
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
