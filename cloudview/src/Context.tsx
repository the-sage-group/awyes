import { createContext } from "react";
import { FlowNodeType, FlowEdgeType } from "./types";

type FlowContextType = {
  nodes: FlowNodeType[];
  edges: FlowEdgeType[];
  setNodes: React.Dispatch<React.SetStateAction<FlowNodeType[]>>;
  setEdges: React.Dispatch<React.SetStateAction<FlowEdgeType[]>>;
};

export const FlowContext = createContext<FlowContextType>({
  nodes: [],
  edges: [],
  setNodes: () => {},
  setEdges: () => {},
});
