export type Node = {
  id: string;
  name: string;
  description: string;
  action: (...args: any[]) => any;
  parameters: { name: string; type: string }[];
  returnType: string;
};
export type Edge = { id: string; source: string; target: string };
export type Graph = { name: string; nodes: Node[]; edges: Edge[] };
