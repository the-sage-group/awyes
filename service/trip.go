package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/the-sage-group/awyes/proto"
	"google.golang.org/protobuf/types/known/structpb"
)

// ListTrips lists all trips
func (s *Service) ListTrips(ctx context.Context, req *proto.ListTripsRequest) (*proto.ListTripsResponse, error) {
	var trips []*proto.Trip
	if err := s.db.Model(&trips).Select(); err != nil {
		return nil, fmt.Errorf("failed to list trips: %v", err)
	}
	return &proto.ListTripsResponse{Trips: trips}, nil
}

// WatchTrip streams back node results
func (s *Service) WatchTrip(req *proto.WatchTripRequest, stream proto.Awyes_WatchTripServer) error {
	tripID := req.GetTripId()

	// First, check if the trip exists and get its current state
	trip := new(proto.Trip)
	if err := s.db.Model(trip).Where("id = ?", tripID).Select(); err != nil {
		fmt.Printf("failed to find trip: %v\n", err)
		return fmt.Errorf("failed to find trip: %v", err)
	}

	// Keep track of the last event timestamp we've seen
	var lastTimestamp int64 = 0

	for {
		// Get all events for this trip newer than our last seen timestamp
		var events []*proto.Event
		if err := s.db.Model(&events).
			Where("trip->>'id' = ? AND timestamp > ?", tripID, lastTimestamp).
			Order("timestamp ASC").
			Select(); err != nil {
			fmt.Printf("failed to get events: %v\n", err)
			return fmt.Errorf("failed to get events: %v", err)
		}
		fmt.Printf("got %d events\n", len(events))

		// Stream any new events
		for _, event := range events {
			if err := stream.Send(event); err != nil {
				return fmt.Errorf("failed to stream event: %v", err)
			}
			// Update our last seen timestamp
			if event.GetTimestamp() > lastTimestamp {
				lastTimestamp = event.GetTimestamp()
			}
		}

		// Check if the trip is complete by getting its latest state
		if err := s.db.Model(trip).Where("id = ?", tripID).Select(); err != nil {
			fmt.Printf("failed to get trip state: %v\n", err)
			return fmt.Errorf("failed to get trip state: %v", err)
		}
		// If we have a completion timestamp, and we've streamed all events, we're done
		if trip.GetCompletedAt() > 0 {
			return nil
		}
	}
}

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

	// Store initial trip in database
	if _, err := s.db.Model(trip).Insert(); err != nil {
		return nil, fmt.Errorf("failed to store initial trip in database: %v", err)
	}

	// Grab the starting position from the route
	inDegree := make(map[string]int)
	for _, position := range req.Route.GetPositions() {
		inDegree[position.GetName()] = 0
	}
	for _, transition := range req.Route.GetTransitions() {
		inDegree[transition.GetTo().GetName()]++
	}
	candidates := []*proto.Position{}
	for _, position := range req.Route.GetPositions() {
		if inDegree[position.GetName()] == 0 {
			candidates = append(candidates, position)
		}
	}
	if len(candidates) != 1 {
		fmt.Printf("multiple starting positions found: %v\n", candidates)
		return nil, fmt.Errorf("multiple starting positions found: %v", candidates)
	}

	// Start asynchronous execution of the trip
	go func() {
		// Create a trip channel
		tripChan := make(chan *proto.Event, 100)
		s.tripEvents.Store(tripID, tripChan)

		// And clean up on exit
		defer func() {
			fmt.Printf("closing trip channel for trip %s\n", tripID)
			close(tripChan)
			s.tripEvents.Delete(tripID)
		}()

		// Grab the starting handler, and put it in the queue
		queue := []*proto.Position{candidates[0]}

		// Process positions in order
		for len(queue) > 0 {
			position := queue[0]
			queue = queue[1:]

			fmt.Printf("executing position %v\n", position)
			handler := position.GetHandler()
			hID := fmt.Sprintf("%s.%s", handler.GetContext(), handler.GetName())

			// Find a node channel capable of executing this handler
			nodes, ok := s.nodes.Load(hID)
			if !ok {
				fmt.Printf("no nodes found for handler %s\n", hID)
				return
			}
			var nodeChannel chan *proto.Event
			for _, node := range nodes.([]string) {
				ch, ok := s.nodeEvents.Load(node)
				if !ok {
					continue
				}
				nodeChannel = ch.(chan *proto.Event)
				break
			}
			if nodeChannel == nil {
				fmt.Printf("no node channel found for handler %s\n", hID)
				return
			}

			// Push an event for this handler to the node channel
			ts := time.Now().UnixMilli()
			eventID := uuid.New().String()
			nodeChannel <- &proto.Event{
				Id:        &eventID,
				Status:    proto.Status_EXECUTING.Enum(),
				Entity:    req.Entity,
				Position:  position,
				Trip:      trip,
				Timestamp: &ts,
			}

			// Wait for the trip channel to be populated by the executing node
			tripEvents, ok := s.tripEvents.Load(tripID)
			if !ok {
				fmt.Printf("no trip channel found for trip %s\n", tripID)
				return
			}

			event := <-tripEvents.(chan *proto.Event)
			if event.Status.String() == proto.Status_ERROR.String() {
				fmt.Printf("trip %s failed: %s\n", tripID, *event.Message)
				return
			}

			// Store the event in the database
			if _, err := s.db.Model(event).Insert(); err != nil {
				fmt.Printf("failed to store event in database: %v\n", err)
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
			for _, transition := range req.Route.GetTransitions() {
				if transition.GetFrom().GetName() == position.GetName() && transition.GetLabel() == event.GetLabel() {
					queue = append(queue, transition.GetTo())
				}
			}
		}

		// Update the trip with a completion timestamp
		if _, err := s.db.Model(trip).Set("completed_at = ?", time.Now().UnixMilli()).Where("id = ?", tripID).Update(); err != nil {
			fmt.Printf("failed to update trip with completion timestamp: %v\n", err)
			return
		}
	}()

	// Send initial response with journey ID
	return &proto.StartTripResponse{Trip: trip}, nil
}
