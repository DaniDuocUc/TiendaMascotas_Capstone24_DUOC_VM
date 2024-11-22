# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Create a group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install --ignore-scripts

# Copy the rest of the application code to the container
COPY src/ ./src

# Change ownership of the app files to the non-root user
RUN chown -R appuser:appgroup /usr/src/app

# Switch to the non-root user
USER appuser

# Expose the port your app runs on
EXPOSE 3000

# Run the application
CMD ["node", "src/app.js"]
