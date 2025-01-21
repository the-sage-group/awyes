.PHONY: proto build run clean setup dev prod down



setup:
	go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
	go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

proto: setup
	# Generate Go files
	protoc --go_out=. --go_opt=paths=source_relative \
		--go-grpc_out=. --go-grpc_opt=paths=source_relative \
		proto/awyes.proto
	
	# Generate TypeScript files
	cd clients/node && npm run build:proto
	cd clients/web && npm run build:proto

build:
	go build -o bin/server main.go

run: build 
	./bin/server

clean:
	rm -rf bin/
	rm -f proto/*.pb.go
	rm -rf clients/node/src/generated
	rm -rf clients/web/src/generated
	docker compose down -v

# Docker commands
up: proto
	docker compose up --build
down:
	docker compose down
