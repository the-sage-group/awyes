class Node<K extends PropertyKey, F extends (...args: any[]) => any> {
  id: K;
  action: F;

  constructor(id: K, action: F) {
    this.id = id;
    this.action = action;
  }
}

export class Flow<T extends object> {
  nodes: Node<any, any>[];
  context: T;

  constructor(nodes: Node<any, any>[] = [], context = {} as T) {
    this.nodes = nodes;
    this.context = context;
  }

  add<K extends PropertyKey, V>(id: K, action: (context: T) => V) {
    return new Flow<{
      [P in K | keyof T]: P extends keyof T ? T[P] : V;
    }>(
      [...this.nodes, new Node(id, action)] as any,
      { ...this.context, [id]: null } as any
    );
  }

  async execute() {
    for (const node of this.nodes) {
      this.context[node.id] = await node.action(this.context);
    }
    return this;
  }
}

export type Workflow<T extends object> = (params: T) => Flow<any>[];
