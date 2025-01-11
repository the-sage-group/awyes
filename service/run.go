package service

import (
	"time"

	pb "github.com/the-sage-group/awyes/proto"
)

// RunAndWait handles bidirectional event streaming
func (s *Service) RunAndWait(stream pb.AwyesService_RunAndWaitServer) error {
	// Stub: Echo back events with updated timestamp
	for {
		event, err := stream.Recv()
		if err != nil {
			return err
		}

		// Echo back with current timestamp
		event.Timestamp = time.Now().UnixNano()
		if err := stream.Send(event); err != nil {
			return err
		}
	}
}
