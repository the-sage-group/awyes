import Catalog from "./catalog";
import * as registry from "./server";
import { Command } from "commander";

export async function chef(cookbook: object) {
  const catalog = new Catalog("./awyes.ts", cookbook);
  catalog.scan(catalog.sourceFile);
  // const program = new Command()
  //   .name("awyes")
  //   .description("CLI tool for running flows")
  //   .option("--headless", "Run the CLI in headless mode")
  //   .parse();

  // if (program.opts().headless) {
  //   Object.values(catalog).forEach(registry.headless(program, catalog));
  //   program.parse();
  //   return;
  // }

  // await registry
  //   .server()
  //   .then((server) => {
  //     // This means the server is running, and we need to register the receivers
  //     Object.values(catalog).forEach(registry.receivers(server, catalog));
  //   })
  //   .catch(() => {
  //     // Ignore errors, this more than likely means the server is already running
  //   })
  //   .finally(() => {
  //     // If we've made it here, it means the server is running, and we've received a call
  //     Object.values(catalog.entries).forEach(
  //       registry.callers(program, catalog)
  //     );
  //   });
  // program.parse();
}
