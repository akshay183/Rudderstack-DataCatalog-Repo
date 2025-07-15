# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of the application's code to the working directory
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define the command to run the application
CMD [ "node", "dist/index.js" ]
