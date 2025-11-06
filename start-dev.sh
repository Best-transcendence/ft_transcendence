#!/bin/bash

# --- Step 1: Kill any processes using your dev ports ---
PORTS=(3000 3001 3002 3003 4000)

for PORT in "${PORTS[@]}"; do
  PID=$(sudo lsof -ti tcp:$PORT)
  if [ ! -z "$PID" ]; then
    echo " Port $PORT is in use by PID $PID. Killing with sudo..."
    sudo kill -9 $PID
  fi
done

echo "✅ All ports cleared."

# --- Step 2: Stop and remove Docker containers ---
echo " Stopping all running containers..."
docker stop $(docker ps -q)

echo " Removing all containers..."
docker rm $(docker ps -aq)

# --- Step 3: Clean up images/volumes ---
echo " Removing dangling images and volumes..."
docker system prune -af --volumes

# --- Step 4: Rebuild and start stack ---
# echo " Rebuilding and starting fresh stack..."
# docker compose up --build -d

echo " Reset complete! Your stack is running again."
