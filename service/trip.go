package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/the-sage-group/awyes/proto"
	"google.golang.org/protobuf/types/known/structpb"
)

// StartTrip executes a route and streams back node results
func (s *Service) StartTrip(ctx context.Context, req *proto.StartTripRequest) (*proto.StartTripResponse, error) {
	// Generate a unique ID for this execution
	tripID := uuid.New().String()

	// Create initial journey state
	trip := &proto.Trip{
		Id:    &tripID,
		Route: req.Route,
		State: make(map[string]*structpb.Value),
	}

	// Start asynchronous execution of the trip
	go func() {
		// Create a trip channel
		tripChan := make(chan *proto.Event, 100)
		s.tripEvents.Store(tripID, tripChan)
		defer close(tripChan)
		defer s.tripEvents.Delete(tripID)

		// Grab the starting handler, and put it in the queue
		queue := []*proto.Position{req.Start}

		// Process positions in order
		for len(queue) > 0 {
			position := queue[0]
			queue = queue[1:]

			fmt.Printf("executing position %s\n", position.GetName())
			handler := position.GetHandler()
			hID := fmt.Sprintf("%s.%s", handler.GetContext(), handler.GetName())

			// Find a node channel capable of executing this handler
			nodes, ok := s.nodes.Load(hID)
			if !ok {
				fmt.Printf("no nodes found for handler %s\n", hID)
				return
			}
			for _, node := range nodes.([]string) {
				ts := time.Now().UnixMilli()
				nodeCh, ok := s.nodeEvents.Load(node)
				if !ok {
					fmt.Printf("no node channel found for node %s\n", node)
					return
				}

				// Push an event for this handler to the node channel
				nodeCh.(chan *proto.Event) <- &proto.Event{
					Status:    proto.Status_EXECUTING.Enum(),
					Entity:    req.Entity,
					Handler:   handler,
					Trip:      trip,
					Timestamp: &ts,
				}

				// Wait for the trip channel to be populated by the executing node
				tripEvents, ok := s.tripEvents.Load(tripID)
				if !ok {
					fmt.Printf("no trip channel found for trip %s\n", tripID)
					return
				}

				select {
				case <-ctx.Done():
					return
				case event := <-tripEvents.(chan *proto.Event):
					if event.Status == proto.Status_ERROR.Enum() {
						fmt.Printf("trip %s failed: %s\n", tripID, *event.Message)
						return
					}
					// Update state with response
					if trip.State == nil {
						trip.State = event.State
					}
					for k, v := range event.State {
						trip.State[k] = v
					}
					// Really inefficently find the next position
					for _, edge := range req.Route.GetEdges() {
						if edge.GetFrom().GetName() == position.GetName() && edge.GetLabel() == event.GetLabel() {
							queue = append(queue, edge.GetTo())
						}
					}
				}
			}
		}
	}()

	// Send initial response with journey ID
	return &proto.StartTripResponse{Trip: trip}, nil
}
