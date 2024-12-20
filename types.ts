export type Catalog = { [id: string]: Node };
export type Node = {
  id: string;
  action: (...args: any[]) => any;
  parameters: { name: string; type: string }[];
  returnType: string;
  deps: string[];
};
export type Edge = { source: string; target: string };
export type Graph = { nodes: Node[]; edges: Edge[] };
