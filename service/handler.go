package service

import (
	"context"
	"fmt"

	"github.com/go-pg/pg/v10"
	"github.com/the-sage-group/awyes/proto"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/peer"
	"google.golang.org/grpc/status"
)

// RegisterHandler registers a new handler
func (s *Service) RegisterHandler(ctx context.Context, req *proto.RegisterHandlerRequest) (*proto.RegisterHandlerResponse, error) {
	fmt.Printf("RegisterHandler: %v\n", req)

	// Get peer info for node tracking
	p, ok := peer.FromContext(ctx)
	if !ok {
		return nil, status.Error(codes.Internal, "no peer info")
	}

	// Validate handler
	if req.Handler.GetName() == "" || req.Handler.GetContext() == "" {
		return nil, status.Error(codes.InvalidArgument, "handler name and context are required")
	}

	// Track the node that provides this handler
	hID := fmt.Sprintf("%s.%s", req.Handler.GetContext(), req.Handler.GetName())
	if nodes, nodeExists := s.nodes.Load(hID); !nodeExists {
		s.nodes.Store(hID, []string{p.Addr.String()})
	} else {
		nodes, _ := nodes.([]string)
		nodes = append(nodes, p.Addr.String())
		s.nodes.Store(hID, nodes)
	}

	// Persist handler to database
	_, err := s.db.Model(req.Handler).
		OnConflict("(context, name) DO UPDATE").
		Insert()
	if err != nil {
		return nil, fmt.Errorf("failed to persist handler: %v", err)
	}

	return &proto.RegisterHandlerResponse{
		Handler: req.Handler,
	}, nil
}

// ListHandlers lists all registered handlers
func (s *Service) ListHandlers(ctx context.Context, req *proto.ListHandlersRequest) (*proto.ListHandlersResponse, error) {
	fmt.Printf("ListHandlers: %v\n", req)

	var handlers []*proto.Handler
	err := s.db.Model(&handlers).Select()
	if err != nil && err != pg.ErrNoRows {
		return nil, fmt.Errorf("failed to query handlers: %v", err)
	}

	return &proto.ListHandlersResponse{
		Handlers: handlers,
	}, nil
}
