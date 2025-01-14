package service

import (
	"context"
	"fmt"

	pb "github.com/the-sage-group/awyes/proto"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// RegisterNode registers a new node type
func (s *Service) RegisterNode(ctx context.Context, req *pb.RegisterNodeRequest) (*pb.RegisterNodeResponse, error) {
	if req.Node == nil {
		return nil, status.Error(codes.InvalidArgument, "node is required")
	}

	if req.Node.Name == "" {
		return nil, status.Error(codes.InvalidArgument, "node name is required")
	}

	// Check if node already exists
	if _, exists := s.nodes.Load(req.Node.Name); exists {
		return nil, status.Errorf(codes.AlreadyExists, "node %s already exists", req.Node.Name)
	}

	// Store the node
	s.nodes.Store(req.Node.Name, req.Node)
	fmt.Printf("Registered node: %s\n", req.Node.Name)

	return &pb.RegisterNodeResponse{
		Node: req.Node,
	}, nil
}

// ListNodes lists all registered nodes
func (s *Service) ListNodes(ctx context.Context, req *pb.ListNodesRequest) (*pb.ListNodesResponse, error) {
	var nodes []*pb.Node

	// Collect all nodes from the sync.Map
	s.nodes.Range(func(key, value interface{}) bool {
		if node, ok := value.(*pb.Node); ok {
			nodes = append(nodes, node)
		}
		return true
	})

	fmt.Printf("Listed %d nodes\n", len(nodes))
	return &pb.ListNodesResponse{
		Nodes: nodes,
	}, nil
}
