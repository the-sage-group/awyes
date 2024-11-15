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

  execute() {
    for (const node of this.nodes) {
      this.context[node.id] = node.action(this);
    }
  }
}

export type Workflow<T extends object> = (params: T) => Flow<any>;
