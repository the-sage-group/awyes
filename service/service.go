package service

import (
	"context"
	"time"

	pb "github.com/the-sage-group/awyes/proto"
)

type Service struct {
	pb.UnimplementedAwyesServiceServer
}

func New() *Service {
	return &Service{}
}

func (s *Service) RegisterNode(ctx context.Context, req *pb.RegisterNodeRequest) (*pb.RegisterNodeResponse, error) {
	// Stub: Just echo back the node
	return &pb.RegisterNodeResponse{
		Node: req.Node,
	}, nil
}

func (s *Service) RegisterFlow(ctx context.Context, req *pb.RegisterFlowRequest) (*pb.RegisterFlowResponse, error) {
	// Stub: Just echo back the flow
	return &pb.RegisterFlowResponse{
		Flow: req.Flow,
	}, nil
}

func (s *Service) ExecuteFlow(req *pb.ExecuteFlowRequest, stream pb.AwyesService_ExecuteFlowServer) error {
	// Stub: Stream back each node in the flow
	for _, node := range req.Flow.Nodes {
		if err := stream.Send(&pb.ExecuteFlowResponse{
			Node: node,
		}); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) RunAndWait(stream pb.AwyesService_RunAndWaitServer) error {
	// Stub: Echo back events with updated timestamp
	for {
		event, err := stream.Recv()
		if err != nil {
			return err
		}

		// Echo back with current timestamp
		event.Timestamp = time.Now().UnixNano()
		if err := stream.Send(event); err != nil {
			return err
		}
	}
}
