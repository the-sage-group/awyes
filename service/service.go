package service

import (
	"sync"

	"github.com/the-sage-group/awyes/proto"
)

// Service implements the Awyes gRPC service
type Service struct {
	proto.UnimplementedAwyesServer
	routes     sync.Map // map[string]*pb.Route 	  // routeID -> route
	handlers   sync.Map // map[string]*pb.Handler 	  // handlerID -> handler
	nodes      sync.Map // map[string][]string 	  	  // handlerID -> []nodeID
	tripEvents sync.Map // map[string]chan *pb.Event  // tripID -> trip channel
	nodeEvents sync.Map // map[string]chan *pb.Event  // nodeID -> node channel
}

// New creates a new Awyes service
func New() *Service {
	return &Service{
		routes:     sync.Map{},
		handlers:   sync.Map{},
		nodes:      sync.Map{},
		tripEvents: sync.Map{},
		nodeEvents: sync.Map{},
	}
}
