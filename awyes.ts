import compile from "./catalog";
import * as registry from "./registry";
import { Command } from "commander";

export async function chef(...recipes: object[]) {
  const catalog = compile("./awyes.ts", recipes);
  console.dir(catalog, { depth: null });

  // const program = new Command()
  //   .name("awyes")
  //   .description("CLI tool for running flows")
  //   .option("--headless", "Run the CLI in headless mode")
  //   .parse();
  // if (program.opts().headless) {
  //   functions.forEach(registry.headless(program));
  //   program.parse();
  //   return;
  // }
  // await registry
  //   .server()
  //   .then((server) => {
  //     functions.forEach(registry.receivers(server));
  //   })
  //   .catch(() => {}) // Ignore errors, this more than likely means the server is already running
  //   .finally(() => {
  //     // If we've made it here, it means the server is running, and we've received a call
  //     functions.forEach(registry.callers(program));
  //   });
  // program.parse();
}
