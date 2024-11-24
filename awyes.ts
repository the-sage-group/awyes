import JSON5 from "json5";
import { Command } from "commander";
import { validate } from "@deepkit/type";
import { Flow, Workflow } from "./types";

export * from "./types";

export async function register(...workflows: Workflow<any>[]) {
  const program = new Command();
  program.name("awyes").description("CLI tool for running workflows");

  workflows.forEach((workflow) => {
    program
      .command(workflow.name)
      .description("Run the " + workflow.name + " workflow")
      .argument(
        `[params]`,
        `JSON string of the parameters for the ${workflow.name} workflow`,
        "{}"
      )
      .action(async (params: string) => {
        params = JSON5.parse(params);
        const errors = validate<Parameters<typeof workflow>[number]>(params);
        if (errors.length) {
          return console.error(errors);
        }
        const result = await workflow(params).execute();
        console.dir(result.context, { depth: null });
      });
  });

  program.parse();
}
