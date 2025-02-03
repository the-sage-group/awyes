package service

import (
	"context"
	"fmt"

	"github.com/go-pg/pg/v10"
	"github.com/the-sage-group/awyes/proto"
)

// ListEvents returns all events in the system
func (s *Service) ListEvents(ctx context.Context, req *proto.ListEventsRequest) (*proto.ListEventsResponse, error) {
	fmt.Printf("ListEvents: %v\n", req)

	var events []*proto.Event
	err := s.db.Model(&events).
		Order("timestamp DESC").
		Select()
	if err != nil && err != pg.ErrNoRows {
		return nil, fmt.Errorf("failed to query events: %v", err)
	}

	return &proto.ListEventsResponse{
		Events: events,
	}, nil
}
