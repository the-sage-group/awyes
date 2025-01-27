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
				fmt.Printf("RunAndWait: context done\n")
				return
			case event := <-nodeCh:
				if event.Status != proto.Status_EXECUTING.Enum() {
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
		if respChan, ok := s.tripEvents.Load(event.Trip.Id); ok {
			if tripCh, ok := respChan.(chan *proto.Event); ok {
				tripCh <- event
			}
		}
	}
}
