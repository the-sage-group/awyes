package service

import (
	pb "github.com/the-sage-group/awyes/proto"
)

type Service struct {
	pb.UnimplementedAwyesServiceServer
}

func New() *Service {
	return &Service{}
}
