.PHONY: all proto build run clean setup

all: proto build

setup:
	go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
	go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

proto: setup
	protoc --go_out=. --go_opt=paths=source_relative \
		--go-grpc_out=. --go-grpc_opt=paths=source_relative \
		proto/awyes.proto

build:
	go build -o bin/server main.go

run: build
	./bin/server

clean:
	rm -rf bin/
	rm -f proto/*.pb.go 