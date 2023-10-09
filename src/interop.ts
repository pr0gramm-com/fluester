import path from "node:path";
import url from "node:url";

const dirName = url.fileURLToPath(new URL("..", import.meta.url));
export const nodeModulesWhisper = path.join(dirName, "lib/whisper.cpp");
export const nodeModulesModelPath = path.join(nodeModulesWhisper, "models");
export const defaultExecutablePath = path.join(nodeModulesWhisper, "main");
