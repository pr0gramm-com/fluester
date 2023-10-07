import { spawn } from "node:child_process";

export async function runCommand(
	command: string,
	args?: readonly string[],
): Promise<string> {
	const child = spawn(command, args);
	const chunks = await child.stdout.toArray();
	if (child.exitCode !== 0) {
		throw new Error(`Process returned with exit code ${child.exitCode}.`);
	}
	const result = Buffer.concat(chunks);
	return result.toString();
}
