export type {
  Node,
  Flow,
  Edge,
  Event,
  EventType,
  RegisterNodeRequest,
  RegisterNodeResponse,
  ListNodesRequest,
  ListNodesResponse,
} from "./generated/proto/awyes";

export { AwyesClient } from "./generated/proto/awyes";
export { credentials } from "@grpc/grpc-js";

export {
  FieldDescriptorProto_Type,
  FieldDescriptorProto_Label,
} from "./generated/google/protobuf/descriptor";

export type { Value } from "./generated/google/protobuf/struct";
