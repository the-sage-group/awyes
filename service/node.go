package service

import (
	"context"

	pb "github.com/the-sage-group/awyes/proto"
)

// RegisterNode registers a new node type
func (s *Service) RegisterNode(ctx context.Context, req *pb.RegisterNodeRequest) (*pb.RegisterNodeResponse, error) {
	// Stub: Just echo back the node
	return &pb.RegisterNodeResponse{
		Node: req.Node,
	}, nil
}
