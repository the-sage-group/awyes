import { credentials } from "@grpc/grpc-js";

import {
  Node,
  Flow,
  Edge,
  Event,
  EventType,
  RegisterNodeRequest,
  RegisterNodeResponse,
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
};

export { AwyesClient, credentials };
