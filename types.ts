export type Node = {
  id: string;
  name: string;
  type: string;
  description: string;
  action: (...args: any[]) => any;
  parameters: { name: string; type: string; value: any }[];
  returns: { name: string; type: string; value: any }[];
};
export type Edge = {
  id: string;
  source: string;
  target: string;
  mappings: { sourceOutput: string; targetInput: string }[];
};
export type Graph = { nodes: Node[]; edges: Edge[] };
