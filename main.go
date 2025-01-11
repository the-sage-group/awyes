package main

import (
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc"

	"github.com/the-sage-group/awyes/proto"
	"github.com/the-sage-group/awyes/service"
)

func main() {
	port := 50051
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	proto.RegisterAwyesServiceServer(s, service.New())

	log.Printf("server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
