import types from "./types";
import * as path from "path";
import * as register from "./register";
import { Command } from "commander";

export async function main() {
  const functions = types(path.join(__dirname, "index.ts"));

  const program = new Command()
    .name("awyes")
    .description("CLI tool for running flows")
    .option("--headless", "Run the CLI in headless mode")
    .parse();

  if (program.opts().headless) {
    functions.forEach(register.headless(program));
    program.parse();
    return;
  }

  await register
    .server()
    .then((server) => {
      functions.forEach(register.receivers(server));
    })
    .catch(() => {}) // Ignore errors, this more than likely means the server is already running
    .finally(() => {
      // If we've made it here, it means the server is running, and we've received a call
      functions.forEach(register.callers(program));
    });
  program.parse();
}
