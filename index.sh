#!/usr/bin/env sh

# Constants
PID_DIR="./.awyes"
UI_PORT=5173
UI_PID_FILE="$PID_DIR/upid"
SERVER_PORT=3000
SERVER_PID_FILE="$PID_DIR/spid"

# Helper function to check if a process is running
check_process() {
    [ -f "$1" ] && kill -0 "$(cat "$1")" 2>/dev/null
}

# Helper function to wait for a service to start
wait_for_port_then_succeed_or_die() {
    local pid=$1
    local port=$2
    
    while true; do
        if ! ps -p $pid > /dev/null; then
            exit 1
        fi
        if nc -z localhost $port > /dev/null 2>&1; then
            break
        fi
        sleep 1
    done
}

# Clean start if no processes are running
if ! check_process $SERVER_PID_FILE || ! check_process $UI_PID_FILE; then
    # Cleanup any stale pid directory, kill assumed ports
    rm -rf "$PID_DIR" 2>/dev/null
    mkdir -p "$PID_DIR"
    lsof -ti:$UI_PORT,$SERVER_PORT | xargs kill -9
    sleep 1
    
    # Start server
    (ts-node -P ./node_modules/@the-sage-group/awyes/tsconfig.json ./awyes.ts "$@") &
    SERVER_PID=$!
    wait_for_port_then_succeed_or_die $SERVER_PID $SERVER_PORT
    echo $SERVER_PID > $SERVER_PID_FILE
    
    # Start the UI
    npm install --prefix ./node_modules/@the-sage-group/awyes/cloudview > /dev/null 2>&1
    (npm run dev --prefix ./node_modules/@the-sage-group/awyes/cloudview > /dev/null 2>&1) &
    NPX_PID=$!; sleep 2; UI_PID=$(pgrep -P $NPX_PID)
    wait_for_port_then_succeed_or_die $UI_PID $UI_PORT
    echo $UI_PID > $UI_PID_FILE
else
    ts-node -P ./node_modules/@the-sage-group/awyes/tsconfig.json ./awyes.ts "$@"
fi
