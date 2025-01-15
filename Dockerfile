FROM golang:1.21-alpine

# Install build dependencies
RUN apk add --no-cache protoc protobuf-dev

# Install protoc plugins
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Expose gRPC port
EXPOSE 50051

# Run the server
CMD ["go", "run", "main.go"] 