package service

import (
	"context"
	"fmt"

	"github.com/the-sage-group/awyes/proto"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/peer"
	"google.golang.org/grpc/status"
)

// RegisterHandler registers a new handler
func (s *Service) RegisterHandler(ctx context.Context, req *proto.RegisterHandlerRequest) (*proto.RegisterHandlerResponse, error) {
	fmt.Printf("RegisterHandler: %v\n", req)
	p, ok := peer.FromContext(ctx)
	if !ok {
		return nil, status.Error(codes.Internal, "no peer info")
	}
	if req.Handler.GetName() == "" || req.Handler.GetContext() == "" {
		return nil, status.Error(codes.InvalidArgument, "handler name and context are required")
	}
	hID := fmt.Sprintf("%s.%s", req.Handler.GetContext(), req.Handler.GetName())
	if _, handlerExists := s.handlers.Load(hID); !handlerExists {
		s.handlers.Store(hID, req.Handler)
	}
	if nodes, nodeExists := s.nodes.Load(hID); !nodeExists {
		s.nodes.Store(hID, []string{p.Addr.String()})
	} else {
		nodes, _ := nodes.([]string)
		nodes = append(nodes, p.Addr.String())
		s.nodes.Store(hID, nodes)
	}
	return &proto.RegisterHandlerResponse{
		Handler: req.Handler,
	}, nil
}

// ListHandlers lists all registered handlers
func (s *Service) ListHandlers(ctx context.Context, req *proto.ListHandlersRequest) (*proto.ListHandlersResponse, error) {
	fmt.Printf("ListHandlers: %v\n", req)
	var handlers []*proto.Handler
	s.handlers.Range(func(key, value interface{}) bool {
		if handler, ok := value.(*proto.Handler); ok {
			handlers = append(handlers, handler)
		}
		return true
	})
	return &proto.ListHandlersResponse{
		Handlers: handlers,
	}, nil
}
