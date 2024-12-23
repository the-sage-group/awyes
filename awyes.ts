import Server from "./server";
import Catalog from "./catalog";

export function start(cookbook: object) {
  const catalog = new Catalog("./awyes.ts", cookbook);
  const server = new Server(catalog);

  server.start();
}
