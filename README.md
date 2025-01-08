# AWyes gRPC Service

A gRPC service definition and utility library for AWS infrastructure automation.

## Overview

AWyes provides two complementary gRPC services for infrastructure automation:

1. **AWyes Service** (`awyes.proto`): The main service for managing and orchestrating infrastructure flows
2. **AWyes Client Service** (`awyes_client.proto`): A service for executing individual infrastructure nodes

### AWyes Service
The main service handles flow management:
- Create, read, update, and delete flows
- Execute flows by orchestrating node executions
- Manage flow parameters and node connections
- Track flow execution status

### AWyes Client Service
The client service focuses on node execution:
- Execute individual infrastructure nodes
- Report supported node types
- Handle streaming execution requests
- Return execution results

## Service Definitions

### AWyes Service (`proto/awyes.proto`)
The main service includes:
- `CreateFlow`: Create a new flow
- `GetFlow`: Retrieve a specific flow
- `ListFlows`: List all flows
- `DeleteFlow`: Delete a flow
- `ExecuteFlow`: Execute a flow by orchestrating node executions

### AWyes Client Service (`proto/awyes_client.proto`)
The client service includes:
- `GetSupportedNodes`: List supported node types
- `ExecuteNode`: Execute a single node
- `HandleNodeExecutions`: Stream for handling node execution requests

## Installation

```bash
npm install awyes
```

## Usage

### Main Service Implementation

```typescript
import { AwyesService } from 'awyes';

class MyAwyesService implements AwyesService {
  async createFlow(request: CreateFlowRequest): Promise<CreateFlowResponse> {
    // Implement flow creation
  }

  async executeFlow(request: ExecuteFlowRequest): Promise<ExecuteFlowResponse> {
    // Orchestrate flow execution by calling client services
  }

  // ... other flow management methods
}
```

### Client Service Implementation

```typescript
import { AwyesClientService } from 'awyes/client';

class MyAwyesClientService implements AwyesClientService {
  async getSupportedNodes(): Promise<GetSupportedNodesResponse> {
    // Return list of supported node types
    return {
      nodes: [
        {
          type: 'cookbook/aws/infra/getInfra',
          description: 'Retrieves infrastructure details',
          parameters: [],
          returns: [
            { name: 'vpcs', type: 'Vpc[]' },
            { name: 'subnets', type: 'Subnet[]' }
          ]
        }
      ]
    };
  }

  async executeNode(request: ExecuteNodeRequest): Promise<ExecuteNodeResponse> {
    // Execute the requested node type
    const { type, parameters } = request;
    // ... implement node execution
    return {
      results: { /* execution results */ }
    };
  }

  async *handleNodeExecutions(requests: AsyncIterable<ExecuteNodeRequest>): AsyncIterable<ExecuteNodeResponse> {
    // Handle streaming execution requests
    for await (const request of requests) {
      yield await this.executeNode(request);
    }
  }
}
```

### Client Usage

```typescript
import { AwyesClient } from 'awyes';
import { AwyesClientClient } from 'awyes/client';

// Connect to services
const awyesClient = new AwyesClient('localhost:50051');
const nodeClient = new AwyesClientClient('localhost:50052');

// Get supported nodes
const { nodes } = await nodeClient.getSupportedNodes({});

// Create a flow using supported node types
const flow = await awyesClient.createFlow({
  flow: {
    name: 'my-flow',
    nodes: [
      {
        id: '1',
        type: nodes[0].type,
        parameters: []
      }
    ],
    edges: []
  }
});

// Execute the flow
const result = await awyesClient.executeFlow({
  id: flow.id,
  parameters: {}
});
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Generate TypeScript definitions from proto:
```bash
npm run build:proto
```

3. Build the project:
```bash
npm run build
```

## License

ISC 