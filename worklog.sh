#!/bin/bash

# worklog.sh: Start the work hour logging web application.

# Usage: ./worklog.sh [log_directory]

LOG_DIR=${1:-"./worklog"}

# Expand ~ to home directory
LOG_DIR=$(eval echo $LOG_DIR)

# Create the log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Start the Node.js application in the background
node $(dirname $0)/worklog.js "$LOG_DIR" &
APP_PID=$!

sleep 1 # wait for startup

# Open the default browser to the application (assume port 3000)

case "$(uname)" in
  Darwin*)
    open http://localhost:3000
    ;;
  Linux*)
    xdg-open http://localhost:3000
    ;;
  CYGWIN*|MINGW*)
    start http://localhost:3000
    ;;
  *)
    echo "Please open http://localhost:3000 in your browser."
    ;;
esac

# Wait for 20 minutes (1200 seconds) for inactivity
# If the application is still running after 10 minutes, kill it.

TIMEOUT=1200

(sleep $TIMEOUT && kill $APP_PID 2>/dev/null && echo "Application terminated due to inactivity.") &

# Wait for the node process to exit
wait $APP_PID

exit 0
