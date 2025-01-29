package main

import (
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	"github.com/the-sage-group/awyes/db"
	"github.com/the-sage-group/awyes/proto"
	"github.com/the-sage-group/awyes/service"
)

func main() {
	// Connect to database
	pgdb := db.Connect()
	defer pgdb.Close()

	port := 50051
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	proto.RegisterAwyesServer(s, service.New(pgdb))
	reflection.Register(s)

	log.Printf("server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
