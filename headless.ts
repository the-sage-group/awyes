import JSON5 from "json5";
import { Command } from "commander";
import { validate } from "@deepkit/type";
import { Flow } from "./types";

export function registerHeadless(program: Command) {
  return function (flow: Flow<any>) {
    program
      .command(flow.name)
      .description(`Run the ${flow.name} flow`)
      .argument(
        `[params]`,
        `JSON string of the parameters for the ${flow.name} flow`,
        "{}"
      )
      .action(async (params: string) => {
        params = JSON5.parse(params);
        const errors = validate<Parameters<typeof flow>[number]>(params);
        if (errors.length) {
          return console.error(errors);
        }
        await flow(params).execute((node, context) => {
          console.dir({ [node.name]: context }, { depth: null });
        });
      });
  };
}
