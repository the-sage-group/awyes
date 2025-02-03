package service

import (
	"fmt"

	"github.com/the-sage-group/awyes/proto"
	"google.golang.org/grpc/peer"
)

// RunNodeAndWait handles bidirectional event streaming for a node
func (s *Service) RunNodeAndWait(stream proto.Awyes_RunNodeAndWaitServer) error {
	p, ok := peer.FromContext(stream.Context())
	if !ok {
		return fmt.Errorf("no peer info")
	}
	fmt.Printf("RunNodeAndWait: %v\n", p)

	// Create the channel for the node
	if _, ok := s.nodeEvents.Load(p.Addr.String()); ok {
		return fmt.Errorf("there is already a channel for this node")
	}
	nodeCh := make(chan *proto.Event)
	s.nodeEvents.Store(p.Addr.String(), nodeCh)

	// Listen for events from both the stream and the node events channel
	go func() {
		for {
			select {
			case <-stream.Context().Done():
				// The stream has been closed, so we need to stop the node
				nodeCh, ok := s.nodeEvents.Load(p.Addr.String())
				if !ok {
					fmt.Printf("RunAndWait: no node channel found\n")
					return
				}
				close(nodeCh.(chan *proto.Event))
				s.nodeEvents.Delete(p.Addr.String())
				fmt.Printf("RunAndWait: context done and node channel closed\n")
				return
			case event := <-nodeCh:
				if event.Status.String() != proto.Status_EXECUTING.String() {
					fmt.Printf("RunAndWait: event not executing: %v\n", event)
					continue
				}
				if err := stream.Send(event); err != nil {
					fmt.Printf("failed to send executing event: %v\n", err)
					continue
				}
			}
		}
	}()

	// Handle incoming events from the stream, send them back to the trip
	for {
		event, err := stream.Recv()
		if err != nil {
			return fmt.Errorf("error receiving event: %v", err)
		}

		respChan, ok := s.tripEvents.Load(event.Trip.GetId())
		if !ok {
			fmt.Printf("RunNodeAndWait: no trip channel found for trip %s\n", event.Trip.GetId())
			continue
		}
		tripCh, ok := respChan.(chan *proto.Event)
		if !ok {
			fmt.Printf("RunNodeAndWait: trip channel is not a channel for trip %s\n", event.Trip.GetId())
			continue
		}
		tripCh <- event
	}
}
