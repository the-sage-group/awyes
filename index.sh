#!/usr/bin/env sh

(ts-node -P ./node_modules/@the-sage-group/awyes/tsconfig.json ./awyes.ts "$@") &
SERVER_PID=$!

wait $SERVER_PID

trap "kill $SERVER_PID" SIGINT SIGTERM


# if [ "$#" -eq 0 ]; then
#     # Start the server
#     (ts-node -P ./node_modules/@the-sage-group/awyes/tsconfig.json ./awyes.ts "$@") &
#     SERVER_PID=$!

#     # Start the UI
#     npm install --prefix ./node_modules/@the-sage-group/awyes/cloudview
#     (npm run dev --prefix ./node_modules/@the-sage-group/awyes/cloudview) &
#     UI_PID=$!

#     # Wait for both to finish, then kill them
#     trap "kill $UI_PID $SERVER_PID" SIGINT SIGTERM
#     wait $UI_PID
#     wait $SERVER_PID
# else
#     ts-node -P ./node_modules/@the-sage-group/awyes/tsconfig.json ./awyes.ts "$@"
# fi




