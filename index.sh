#!/usr/bin/env sh

if [ "$#" -eq 0 ]; then
    echo "Starting the CloudView UI"
    npm install --prefix ./node_modules/@the-sage-group/awyes/cloudview
    (npm run dev --prefix ./node_modules/@the-sage-group/awyes/cloudview) &
    UI_PID=$!
fi

(ts-node -P ./node_modules/@the-sage-group/awyes/tsconfig.json ./awyes.ts "$@") &
SERVER_PID=$!

trap "kill $UI_PID $SERVER_PID" SIGINT SIGTERM

wait $SERVER_PID
wait $UI_PID
