package service

import (
	"sync"

	pb "github.com/the-sage-group/awyes/proto"
)

// Service implements the Awyes gRPC service
type Service struct {
	pb.UnimplementedAwyesServer
	nodes     sync.Map // map[string]*pb.Node
	flows     sync.Map // map[string]*pb.Flow
	events    chan *pb.Event
	responses sync.Map // map[string]chan *pb.Event  // flowID -> response channel
}

// New creates a new Awyes service
func New() *Service {
	return &Service{
		events: make(chan *pb.Event),
	}
}
