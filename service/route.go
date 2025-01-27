package service

import (
	"context"
	"fmt"

	"github.com/the-sage-group/awyes/proto"
)

// ListRoutes lists all registered routes
func (s *Service) ListRoutes(ctx context.Context, req *proto.ListRoutesRequest) (*proto.ListRoutesResponse, error) {
	fmt.Printf("ListRoutes: %v\n", req)
	var routes []*proto.Route
	s.routes.Range(func(key, value interface{}) bool {
		if route, ok := value.(*proto.Route); ok {
			routes = append(routes, route)
		}
		return true
	})
	return &proto.ListRoutesResponse{
		Routes: routes,
	}, nil
}

// RegisterRoute registers a new route definition
func (s *Service) RegisterRoute(ctx context.Context, req *proto.RegisterRouteRequest) (*proto.RegisterRouteResponse, error) {
	fmt.Printf("RegisterRoute: %v\n", req)
	rID := fmt.Sprintf("%s.%s", req.Route.GetContext(), req.Route.GetName())
	s.routes.Store(rID, req.Route)
	return &proto.RegisterRouteResponse{
		Route: req.Route,
	}, nil
}
