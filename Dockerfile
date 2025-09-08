FROM node:18-slim

# Install `su-exec` dependency, which is a lightweight alternative to `sudo` or `gosu`.
# We also update the package list first and clean up the cache afterward.
RUN apk update && apk add --no-cache su-exec

WORKDIR /home/node/app

# Copy package files first for better layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application source
COPY . .

# Copy the entrypoint script and make it executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8282

ENTRYPOINT ["/home/node/app/entrypoint.sh"]
# This is the default command that will be passed to the entrypoint script
CMD [ "npm", "start" ]
