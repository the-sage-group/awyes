FROM golang:1.24-alpine

# Install build dependencies and air for hot reloading
RUN apk add --no-cache protoc protobuf-dev && \
    go install github.com/air-verse/air@latest

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

# Run with air in development mode
CMD ["air", "-c", ".air.toml"] 