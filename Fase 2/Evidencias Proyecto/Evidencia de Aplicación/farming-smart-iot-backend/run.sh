#!/bin/sh
set -e

# Set root password to Docker!
echo "root:Docker!" | chpasswd

# Generate SSH host keys as root
ssh-keygen -A

# Start the SSH service as root
/usr/sbin/sshd

# Start the Node.js application as root
exec node src/app.js
