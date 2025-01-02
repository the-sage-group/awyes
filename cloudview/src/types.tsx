import { Edge, Node } from "@xyflow/react";
import { Node as AwYesNode, Edge as AwYesEdge } from "../../types";

export type FlowNodeType = Node<AwYesNode, "flowNode">;
export type FlowEdgeType = Edge<AwYesEdge, "flowEdge">;
export type FlowGraphType = {
  name: string;
  nodes: FlowNodeType[];
  edges: FlowEdgeType[];
};
