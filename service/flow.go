package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/the-sage-group/awyes/proto"
	"google.golang.org/protobuf/types/known/structpb"
)

// ListFlows lists all registered flows
func (s *Service) ListFlows(ctx context.Context, req *proto.ListFlowsRequest) (*proto.ListFlowsResponse, error) {
	var flows []*proto.Flow

	// Collect all flows from the sync.Map
	s.flows.Range(func(key, value interface{}) bool {
		if flow, ok := value.(*proto.Flow); ok {
			flows = append(flows, flow)
		}
		return true
	})

	fmt.Printf("Listed %d flows\n", len(flows))
	return &proto.ListFlowsResponse{
		Flows: flows,
	}, nil
}

// RegisterFlow registers a new flow definition
func (s *Service) RegisterFlow(ctx context.Context, req *proto.RegisterFlowRequest) (*proto.RegisterFlowResponse, error) {
	// Stub: Just echo back the flow
	return &proto.RegisterFlowResponse{
		Flow: req.Flow,
	}, nil
}

// ExecuteFlow executes a flow and streams back node results
func (s *Service) ExecuteFlow(ctx context.Context, req *proto.ExecuteFlowRequest) (*proto.ExecuteFlowResponse, error) {
	// Generate a unique ID for this execution
	tripID := uuid.New().String()

	// Create initial journey state
	trip := &proto.Trip{
		Id:    tripID,
		Flow:  req.Flow,
		State: make(map[string]*structpb.Value),
	}

	// Create response channel for this flow
	responseChan := make(chan *proto.Event, 100)
	s.responses.Store(tripID, responseChan)
	defer s.responses.Delete(tripID)

	// Start asynchronous execution
	go func() {
		defer close(responseChan)

		// Create a map of nodes by ID for quick lookup
		nodeMap := make(map[string]*proto.Node)
		for _, node := range req.Flow.Nodes {
			nodeMap[node.Name] = node
		}

		// Create a map of outgoing edges for each node
		outgoing := make(map[string][]*proto.Edge)
		for _, edge := range req.Flow.Edges {
			outgoing[edge.Source] = append(outgoing[edge.Source], edge)
		}

		// Find root nodes (nodes with no incoming edges)
		incomingCount := make(map[string]int)
		for _, edge := range req.Flow.Edges {
			incomingCount[edge.Target]++
		}

		// Start with root nodes
		var queue []*proto.Node
		for _, node := range req.Flow.Nodes {
			if incomingCount[node.Name] == 0 {
				queue = append(queue, node)
			}
		}

		// Process nodes in order
		for len(queue) > 0 {
			node := queue[0]
			queue = queue[1:]

			fmt.Printf("executing node %s\n", node.Name)

			// Push node to event channel with flow ID
			s.events <- &proto.Event{
				Type:      proto.EventType_EXECUTING,
				Node:      node,
				Trip:      trip,
				Timestamp: time.Now().UnixMilli(),
			}

			// Wait for completion or failure
			select {
			case <-ctx.Done():
				return
			case event := <-responseChan:
				if event.Type == proto.EventType_FAILED {
					fmt.Printf("flow %s failed: %s\n", tripID, *event.Error)
					return // Stop processing on failure
				}
				// Update state with response
				if trip.State == nil {
					trip.State = event.Trip.State
				}
				for k, v := range event.Trip.State {
					trip.State[k] = v
				}
				// Add successor nodes to queue
				for _, edge := range outgoing[node.Name] {
					if nextNode, ok := nodeMap[edge.Target]; ok {
						queue = append(queue, nextNode)
					}
				}
			}

			fmt.Printf("completed node %s\n", node.Name)
		}
	}()

	// Send initial response with journey ID
	return &proto.ExecuteFlowResponse{Trip: trip}, nil
}
