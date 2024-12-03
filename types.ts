class Node<F extends (...args: any[]) => any> {
  id: PropertyKey;
  action: F;

  constructor(id: PropertyKey, action: F) {
    this.id = id;
    this.action = action;
  }
}

export class Flow<T extends object> {
  id: PropertyKey;
  nodes: Node<any>[];
  context: T;

  constructor(id: PropertyKey, nodes: Node<any>[] = [], context = {} as T) {
    this.id = id;
    this.nodes = nodes;
    this.context = context;
  }

  add<K extends PropertyKey, V>(id: K, action: (context: T) => V) {
    return new Flow<{
      [P in K | keyof T]: P extends keyof T ? T[P] : V;
    }>(
      this.id,
      [...this.nodes, new Node(id, action)] as any,
      { ...this.context, [id]: null } as any
    );
  }

  async execute(cb: (node: Node<any>, context: T) => void = () => {}) {
    for (const node of this.nodes) {
      this.context[node.id] = await node.action(this.context);
      await cb(node, this.context[node.id]);
    }
    return this;
  }
}

export type Workflow<T extends object> = (params: T) => Flow<any>[];
