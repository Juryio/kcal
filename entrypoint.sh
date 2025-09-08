#!/bin/sh

# This script is run as the root user when the container starts.

# Take ownership of the app data directory.
# This is necessary because Docker mounts the named volume as root, but the
# application runs as the non-root 'node' user.
chown -R node:node /home/node/app/data

# Drop privileges and execute the main command (e.g., "npm start") as the 'node' user.
exec su-exec node "$@"
