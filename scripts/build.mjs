import { spawn } from "node:child_process";
import path from "node:path";

const astroCli = path.resolve("node_modules", "astro", "astro.js");

function runAstro(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [astroCli, ...args], {
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`astro ${args.join(" ")} exited with code ${code ?? "unknown"}`));
    });
  });
}

async function main() {
  await runAstro(["check"]);
  await runAstro(["build"]);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
