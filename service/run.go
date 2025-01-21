package service

import (
	"fmt"

	pb "github.com/the-sage-group/awyes/proto"
)

// RunAndWait handles bidirectional event streaming
func (s *Service) RunAndWait(stream pb.Awyes_RunAndWaitServer) error {
	// Listen for events from both the stream and the events channel
	go func() {
		for {
			select {
			case <-stream.Context().Done():
				return
			case event := <-s.events:
				if event.Type != pb.EventType_EXECUTING {
					continue
				}

				// Find the registered node handler
				_, exists := s.nodes.Load(event.Node.Name)
				if !exists {
					fmt.Printf("node %s not found", event.Node.Name)
					continue
				}

				// Send executing event
				if err := stream.Send(event); err != nil {
					fmt.Printf("failed to send executing event: %v\n", err)
					continue
				}
			}
		}
	}()

	// Handle incoming events from the stream
	for {
		event, err := stream.Recv()
		if err != nil {
			return err
		}
		if respChan, ok := s.responses.Load(event.Trip.Id); ok {
			if ch, ok := respChan.(chan *pb.Event); ok {
				ch <- event
			}
		}
	}
}
