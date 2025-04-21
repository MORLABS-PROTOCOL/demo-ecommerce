# Use the official Node.js image as the base image
FROM node:18.20.4-slim


# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install the dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .
RUN npm run build
WORKDIR /app


# Expose the port the app runs on
EXPOSE 4173

# Command to run the app
CMD node ./build
