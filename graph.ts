import { Edge, Node } from "./types";

export class Graph {
  nodes: Node[];
  edges: Edge[];
  private _inDegreeMap: Map<string, number> | null = null;

  get inDegree(): Map<string, number> {
    if (!this._inDegreeMap) {
      this._inDegreeMap = new Map<string, number>();
      this.nodes.forEach((node) => this._inDegreeMap!.set(node.id, 0));
      this.edges.forEach((edge) => {
        const current = this._inDegreeMap!.get(edge.target) || 0;
        this._inDegreeMap!.set(edge.target, current + 1);
      });
    }
    return this._inDegreeMap;
  }

  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  addNode(node: Node) {
    this.nodes.push(node);
    this._inDegreeMap = null; // Reset cached value
    return this;
  }

  addEdge(edge: Edge) {
    this.edges.push(edge);
    this._inDegreeMap = null; // Reset cached value
    return this;
  }

  execute() {
    const inDegree = this.inDegree;

    const queue = this.nodes.filter((node) => inDegree.get(node.id) === 0);
    const executed: Node[] = [];

    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      executed.push(currentNode);

      this.edges
        .filter((edge) => edge.source === currentNode.id)
        .forEach((edge) => {
          const newCount = inDegree.get(edge.target)! - 1;
          inDegree.set(edge.target, newCount);

          // If a node has no more dependencies, add it to the queue
          if (newCount === 0) {
            const nextNode = this.nodes.find((n) => n.id === edge.target);
            if (nextNode) queue.push(nextNode);
          }
        });
    }

    return executed;
  }
}
