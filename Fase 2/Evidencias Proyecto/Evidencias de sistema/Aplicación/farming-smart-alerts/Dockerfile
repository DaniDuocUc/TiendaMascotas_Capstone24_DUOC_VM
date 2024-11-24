# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Install OpenSSH and create a group and user
RUN apk add --no-cache openssh && \
	addgroup -S appgroup && adduser -S appuser -G appgroup -s /bin/sh

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install --ignore-scripts

# Copy the rest of the application code to the container
COPY src/ ./src

# Copy the SSH configuration file
COPY sshd_config /etc/ssh/sshd_config

# Copy the entrypoint script
COPY run.sh /run.sh

# Make the entrypoint script executable and change ownership of the app files to the non-root user
RUN chmod +x /run.sh && chown -R appuser:appgroup /usr/src/app

# Expose the port your app runs on and the SSH port
EXPOSE 3000 2222

# Run the entrypoint script
ENTRYPOINT ["/run.sh"]
