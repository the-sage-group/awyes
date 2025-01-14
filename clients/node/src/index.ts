import { credentials } from "@grpc/grpc-js";

import {
  Node,
  Flow,
  Edge,
  Event,
  EventType,
  RegisterNodeRequest,
  RegisterNodeResponse,
  ListNodesRequest,
  ListNodesResponse,
  AwyesClient,
} from "./generated/proto/awyes";

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
};

export { AwyesClient, credentials };
