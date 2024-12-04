import { Command } from "commander";
import { Workflow } from "./types";
import { registerHeadless } from "./headless";
import { createServer, registerCallers, registerReceivers } from "./remote";

export * from "./types";

export async function register(workflows: Workflow<any>[]) {
  const program = new Command();
  program
    .name("awyes")
    .description("CLI tool for running workflows")
    .option("--headless", "Run the CLI in headless mode")
    .parse();

  if (program.opts().headless) {
    workflows.forEach(registerHeadless(program));
  } else {
    await createServer()
      .then((server) => {
        workflows.forEach(registerReceivers(server));
      })
      .catch(() => {}) // Ignore errors, this more than likely means the server is already running
      .finally(() => {
        workflows.forEach(registerCallers(program));
      });
  }

  program.parse();
}
