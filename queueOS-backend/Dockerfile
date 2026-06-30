# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Define the command to run your app
CMD ["node", "server.js"]
