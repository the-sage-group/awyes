package service

import (
	"sync"

	"github.com/go-pg/pg/v10"
	"github.com/the-sage-group/awyes/proto"
)

// Service implements the Awyes gRPC service
type Service struct {
	proto.UnimplementedAwyesServer
	db         *pg.DB
	nodes      sync.Map // map[string][]string 	  	  // handlerID -> []nodeID
	tripEvents sync.Map // map[string]chan *pb.Event  // tripID -> trip channel
	nodeEvents sync.Map // map[string]chan *pb.Event  // nodeID -> node channel
}

// New creates a new Awyes service
func New(db *pg.DB) *Service {
	return &Service{
		db:         db,
		nodes:      sync.Map{},
		tripEvents: sync.Map{},
		nodeEvents: sync.Map{},
	}
}
