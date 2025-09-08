#!/bin/sh

# This script is run as the root user when the container starts.

# The /home/node/app/data directory is a mount point for a Docker volume.
# Docker creates this mount point with root ownership.
# The application itself runs as the non-root 'node' user for security.
# This command changes the ownership of the data directory to the 'node' user,
# so that the application has permission to write the events.json file into it.
chown -R node:node /home/node/app/data

# Drop privileges and execute the main command (e.g., "npm start") as the 'node' user.
# "$@" passes all arguments from the Docker CMD to this script.
exec su-exec node "$@"
