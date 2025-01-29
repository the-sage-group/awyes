package service

import (
	"context"
	"fmt"

	"github.com/go-pg/pg/v10"
	"github.com/the-sage-group/awyes/proto"
)

// ListRoutes lists all registered routes
func (s *Service) ListRoutes(ctx context.Context, req *proto.ListRoutesRequest) (*proto.ListRoutesResponse, error) {
	fmt.Printf("ListRoutes: %v\n", req)

	var routes []*proto.Route
	err := s.db.Model(&routes).Select()
	if err != nil && err != pg.ErrNoRows {
		return nil, fmt.Errorf("failed to query routes: %v", err)
	}

	return &proto.ListRoutesResponse{
		Routes: routes,
	}, nil
}

// RegisterRoute registers a new route definition
func (s *Service) RegisterRoute(ctx context.Context, req *proto.RegisterRouteRequest) (*proto.RegisterRouteResponse, error) {
	fmt.Printf("RegisterRoute: %v\n", req)

	_, err := s.db.Model(req.Route).
		OnConflict("(context, name) DO UPDATE").
		Insert()
	if err != nil {
		return nil, fmt.Errorf("failed to persist route: %v", err)
	}

	return &proto.RegisterRouteResponse{
		Route: req.Route,
	}, nil
}
