import cors from "cors";
import express from "express";
import Catalog from "./catalog";

export default class Server {
  catalog: Catalog;

  constructor(catalog: Catalog) {
    this.catalog = catalog;
  }

  start() {
    const rest = express();
    rest.use(cors());
    rest.use(express.json());
    rest.set("json replacer", (key, value) => {
      if (typeof value === "function") {
        return value.name;
      }
      return value;
    });
    rest.listen(3000, () => {});

    rest.get("/", (req, res) => {
      res.send(this.catalog.nodes);
    });

    this.catalog.nodes.forEach((node) => {
      rest.get(`/${node.id}`, (req, res) => {
        res.send(node);
      });

      rest.post(`/${node.id}`, (req, res) => {
        res.send(req.body);
      });
    });
  }
}
