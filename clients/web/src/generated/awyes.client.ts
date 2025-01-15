// @generated by protobuf-ts 2.9.4 with parameter long_type_string
// @generated from protobuf file "awyes.proto" (package "awyes", syntax proto3)
// tslint:disable
import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import { Awyes } from "./awyes";
import type { Event } from "./awyes";
import type { DuplexStreamingCall } from "@protobuf-ts/runtime-rpc";
import type { RegisterNodeResponse } from "./awyes";
import type { RegisterNodeRequest } from "./awyes";
import type { ExecuteFlowResponse } from "./awyes";
import type { ExecuteFlowRequest } from "./awyes";
import type { ServerStreamingCall } from "@protobuf-ts/runtime-rpc";
import type { RegisterFlowResponse } from "./awyes";
import type { RegisterFlowRequest } from "./awyes";
import type { ListFlowsResponse } from "./awyes";
import type { ListFlowsRequest } from "./awyes";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
import type { ListNodesResponse } from "./awyes";
import type { ListNodesRequest } from "./awyes";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 * Awyes definition
 *
 * @generated from protobuf service awyes.Awyes
 */
export interface IAwyesClient {
    /**
     * @generated from protobuf rpc: ListNodes(awyes.ListNodesRequest) returns (awyes.ListNodesResponse);
     */
    listNodes(input: ListNodesRequest, options?: RpcOptions): UnaryCall<ListNodesRequest, ListNodesResponse>;
    /**
     * @generated from protobuf rpc: ListFlows(awyes.ListFlowsRequest) returns (awyes.ListFlowsResponse);
     */
    listFlows(input: ListFlowsRequest, options?: RpcOptions): UnaryCall<ListFlowsRequest, ListFlowsResponse>;
    /**
     * @generated from protobuf rpc: RegisterFlow(awyes.RegisterFlowRequest) returns (awyes.RegisterFlowResponse);
     */
    registerFlow(input: RegisterFlowRequest, options?: RpcOptions): UnaryCall<RegisterFlowRequest, RegisterFlowResponse>;
    /**
     * @generated from protobuf rpc: ExecuteFlow(awyes.ExecuteFlowRequest) returns (stream awyes.ExecuteFlowResponse);
     */
    executeFlow(input: ExecuteFlowRequest, options?: RpcOptions): ServerStreamingCall<ExecuteFlowRequest, ExecuteFlowResponse>;
    /**
     * @generated from protobuf rpc: RegisterNode(awyes.RegisterNodeRequest) returns (awyes.RegisterNodeResponse);
     */
    registerNode(input: RegisterNodeRequest, options?: RpcOptions): UnaryCall<RegisterNodeRequest, RegisterNodeResponse>;
    /**
     * @generated from protobuf rpc: RunAndWait(stream awyes.Event) returns (stream awyes.Event);
     */
    runAndWait(options?: RpcOptions): DuplexStreamingCall<Event, Event>;
}
/**
 * Awyes definition
 *
 * @generated from protobuf service awyes.Awyes
 */
export class AwyesClient implements IAwyesClient, ServiceInfo {
    typeName = Awyes.typeName;
    methods = Awyes.methods;
    options = Awyes.options;
    constructor(private readonly _transport: RpcTransport) {
    }
    /**
     * @generated from protobuf rpc: ListNodes(awyes.ListNodesRequest) returns (awyes.ListNodesResponse);
     */
    listNodes(input: ListNodesRequest, options?: RpcOptions): UnaryCall<ListNodesRequest, ListNodesResponse> {
        const method = this.methods[0], opt = this._transport.mergeOptions(options);
        return stackIntercept<ListNodesRequest, ListNodesResponse>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: ListFlows(awyes.ListFlowsRequest) returns (awyes.ListFlowsResponse);
     */
    listFlows(input: ListFlowsRequest, options?: RpcOptions): UnaryCall<ListFlowsRequest, ListFlowsResponse> {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept<ListFlowsRequest, ListFlowsResponse>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: RegisterFlow(awyes.RegisterFlowRequest) returns (awyes.RegisterFlowResponse);
     */
    registerFlow(input: RegisterFlowRequest, options?: RpcOptions): UnaryCall<RegisterFlowRequest, RegisterFlowResponse> {
        const method = this.methods[2], opt = this._transport.mergeOptions(options);
        return stackIntercept<RegisterFlowRequest, RegisterFlowResponse>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: ExecuteFlow(awyes.ExecuteFlowRequest) returns (stream awyes.ExecuteFlowResponse);
     */
    executeFlow(input: ExecuteFlowRequest, options?: RpcOptions): ServerStreamingCall<ExecuteFlowRequest, ExecuteFlowResponse> {
        const method = this.methods[3], opt = this._transport.mergeOptions(options);
        return stackIntercept<ExecuteFlowRequest, ExecuteFlowResponse>("serverStreaming", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: RegisterNode(awyes.RegisterNodeRequest) returns (awyes.RegisterNodeResponse);
     */
    registerNode(input: RegisterNodeRequest, options?: RpcOptions): UnaryCall<RegisterNodeRequest, RegisterNodeResponse> {
        const method = this.methods[4], opt = this._transport.mergeOptions(options);
        return stackIntercept<RegisterNodeRequest, RegisterNodeResponse>("unary", this._transport, method, opt, input);
    }
    /**
     * @generated from protobuf rpc: RunAndWait(stream awyes.Event) returns (stream awyes.Event);
     */
    runAndWait(options?: RpcOptions): DuplexStreamingCall<Event, Event> {
        const method = this.methods[5], opt = this._transport.mergeOptions(options);
        return stackIntercept<Event, Event>("duplex", this._transport, method, opt);
    }
}
