import JSON5 from "json5";
import { Command } from "commander";
import { validate } from "@deepkit/type";
import { Workflow } from "./types";

export function registerHeadless(program: Command) {
  return function (workflow: Workflow<any>) {
    program
      .command(workflow.name)
      .description(`Run the ${workflow.name} workflow`)
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
        workflow(params).forEach(
          async (flow) =>
            await flow.execute((node, context) => {
              console.dir({ [node.id]: context }, { depth: null });
            })
        );
      });
  };
}
