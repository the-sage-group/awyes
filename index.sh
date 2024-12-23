#!/usr/bin/env sh

# Start server
(ts-node -P ./node_modules/@the-sage-group/awyes/tsconfig.json ./awyes.ts "$@") &
SERVER_PID=$!

# Start the UI
npm install --prefix ./node_modules/@the-sage-group/awyes/cloudview
(npm run dev --prefix ./node_modules/@the-sage-group/awyes/cloudview) &
NPX_PID=$!; sleep 2; UI_PID=$(pgrep -P $NPX_PID)

# Wait for the server and UI to finish
trap "kill $SERVER_PID $UI_PID" SIGINT SIGTERM

# Wait for the server and UI to finish
wait $SERVER_PID $UI_PID

