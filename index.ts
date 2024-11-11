import express from "express";
import { typeOf } from "@deepkit/type";

export class Node<K extends PropertyKey, T extends (...args: any[]) => any> {
  id: K;
  action: T;
  declare result: ReturnType<T>;

  constructor(id: K, action: T) {
    this.id = id;
    this.action = action;
  }
}

export class Flow<T extends object> {
  nodes: Node<any, any>[];
  declare context: T;

  constructor(nodes: Node<any, any>[] = []) {
    this.nodes = nodes;
  }

  add<K extends PropertyKey, V>(node: Node<K, (flow: Flow<T>) => V>) {
    return new Flow<{
      [P in K | keyof T]: P extends keyof T ? T[P] : V;
    }>([...this.nodes, node] as any);
  }
}

type Flows = (...args: any[]) => Flow<any>;

export function serve(...flows: Flows[]) {
  const app = express();
  const port = 3000;

  flows.forEach((flow) => {
    typeOf<string>();
    // app.get(`/${flow.name}`, (req, res) => {
    //   const instance = flow();
    //   res.send(instance);
    // });
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}
