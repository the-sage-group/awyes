package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/go-pg/pg/v10"
	"github.com/the-sage-group/awyes/proto"
	"google.golang.org/protobuf/encoding/prototext"
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

	// Parse the textproto string into a Route proto message
	route := &proto.Route{}
	if err := prototext.Unmarshal([]byte(req.GetRoute()), route); err != nil {
		return nil, fmt.Errorf("failed to parse route from textproto: %v", err)
	}

	_, err := s.db.Model(route).
		OnConflict("(context, name, version) DO UPDATE").
		Insert()
	if err != nil {
		return nil, fmt.Errorf("failed to persist route: %v", err)
	}

	return &proto.RegisterRouteResponse{}, nil
}

// GetRoute retrieves a specific route by name and version
func (s *Service) GetRoute(ctx context.Context, req *proto.GetRouteRequest) (*proto.GetRouteResponse, error) {
	fmt.Printf("GetRoute: %v\n", req)

	// Parse the route name which is in the format "context.name"
	routeName := req.GetRoute()
	parts := strings.Split(routeName, ".")

	if len(parts) < 2 {
		return nil, fmt.Errorf("invalid route format: %s, expected format is 'context.name'", routeName)
	}

	routeContext := parts[0]
	name := parts[1]

	route := &proto.Route{}
	err := s.db.Model(route).
		Where("context = ?", routeContext).
		Where("name = ?", name).
		Where("version = ?", req.GetVersion()).
		Select()
	if err != nil {
		if err == pg.ErrNoRows {
			return nil, fmt.Errorf("route not found: %s (version %d)", routeName, req.GetVersion())
		}
		return nil, fmt.Errorf("failed to query route: %v", err)
	}

	return &proto.GetRouteResponse{
		Route: route,
	}, nil
}
