package service

import (
	"sync"

	pb "github.com/the-sage-group/awyes/proto"
)

// Service implements the Awyes gRPC service
type Service struct {
	pb.UnimplementedAwyesServer
	nodes sync.Map // map[string]*pb.Node
}

// New creates a new Awyes service
func New() *Service {
	return &Service{}
}
