# Use the official Node.js image
FROM node:18.20.4-slim

# Set the working directory
WORKDIR /app

# Copy the dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Expose the default port used by the Node adapter
EXPOSE 3000

# Run the built app
CMD ["node", "build"]
