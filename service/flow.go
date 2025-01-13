package service

import (
	"context"

	pb "github.com/the-sage-group/awyes/proto"
)

// RegisterFlow registers a new flow definition
func (s *Service) RegisterFlow(ctx context.Context, req *pb.RegisterFlowRequest) (*pb.RegisterFlowResponse, error) {
	// Stub: Just echo back the flow
	return &pb.RegisterFlowResponse{
		Flow: req.Flow,
	}, nil
}

// ExecuteFlow executes a flow and streams back node results
func (s *Service) ExecuteFlow(req *pb.ExecuteFlowRequest, stream pb.Awyes_ExecuteFlowServer) error {
	// Stub: Stream back each node in the flow

	return nil
}
