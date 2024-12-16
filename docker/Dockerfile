# Base image
FROM node:20-alpine

# Install necessary packages
RUN apk add --no-cache bash git

# Set working directory
WORKDIR /app

# Copy the rest of the application files
COPY . .

# Install dependencies
RUN npm install

#RUN npm run build

# Expose the default Next.js development port
EXPOSE 3000

# Set environment variable
ENV HOST=0.0.0.0

# Run the development server
#CMD ["npm", "run", "start"]