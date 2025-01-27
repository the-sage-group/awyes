export type {
  Node,
  Flow,
  Edge,
  Event,
  RegisterNodeRequest,
  RegisterNodeResponse,
  ListNodesRequest,
  ListNodesResponse,
} from "./generated/proto/awyes";

export { AwyesClient, EventType, Label } from "./generated/proto/awyes";
export { credentials, Metadata } from "@grpc/grpc-js";

export {
  FieldDescriptorProto_Type,
  FieldDescriptorProto_Label,
} from "./generated/google/protobuf/descriptor";

export type { Value } from "./generated/google/protobuf/struct";
