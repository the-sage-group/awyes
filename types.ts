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

  constructor(context: T, nodes: Node<any, any>[] = []) {
    this.context = context;
    this.nodes = nodes;
  }

  add<K extends PropertyKey, V>(id: K, action: (context: T) => V) {
    return new Flow<{
      [P in K | keyof T]: P extends keyof T ? T[P] : V;
    }>([...this.nodes, new Node(id, action)] as any);
  }

  execute() {
    for (const node of this.nodes) {
      this.context[node.id] = node.action(this.context);
    }
  }
}

export type Workflow<T extends object> = (params: T) => Flow<any>;
