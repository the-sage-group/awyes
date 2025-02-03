package service

import (
	"context"
	"fmt"

	"github.com/go-pg/pg/v10"
	"github.com/the-sage-group/awyes/proto"
)

// ListPositions returns all registered positions
func (s *Service) ListPositions(ctx context.Context, req *proto.ListPositionsRequest) (*proto.ListPositionsResponse, error) {
	fmt.Printf("ListPositions: %v\n", req)

	var positions []*proto.Position
	err := s.db.Model(&positions).Select()
	if err != nil && err != pg.ErrNoRows {
		return nil, fmt.Errorf("failed to query positions: %v", err)
	}

	return &proto.ListPositionsResponse{
		Positions: positions,
	}, nil
}

// RegisterPosition registers a new position definition
func (s *Service) RegisterPosition(ctx context.Context, req *proto.RegisterPositionRequest) (*proto.RegisterPositionResponse, error) {
	fmt.Printf("RegisterPosition: %v\n", req)

	// Start a transaction to ensure position and handler references are stored atomically
	tx, err := s.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback() // Rollback if not committed

	// Insert or update the position
	_, err = tx.Model(req.Position).
		OnConflict("(name) DO UPDATE").
		Insert()
	if err != nil {
		return nil, fmt.Errorf("failed to persist position: %v", err)
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %v", err)
	}

	return &proto.RegisterPositionResponse{
		Position: req.Position,
	}, nil
}
