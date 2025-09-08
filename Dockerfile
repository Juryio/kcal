FROM node:18-slim

WORKDIR /home/node/app

# Copy package files and install dependencies
# This is done as root, which is fine.
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Copy entrypoint and make it executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8282

ENTRYPOINT ["/home/node/app/entrypoint.sh"]
# The CMD will be passed to the entrypoint, which will then execute it as the 'node' user.
CMD [ "npm", "start" ]
