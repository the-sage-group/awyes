import { Command } from "commander";
import { asRPCs } from "./rpc";
import { asCommands } from "./cli";
import { Workflow } from "./types";

export * from "./types";

export function register(...workflows: Workflow<any>[]) {
  const program = new Command();

  program.name("awyes").description("CLI tool for running workflows");

  // No arguments means we're running as an RPC server
  if (process.argv.pop().endsWith("awyes.ts")) {
    asRPCs.call(program, workflows);
  } else {
    asCommands.call(program, workflows);
  }

  program.parse();
}
