FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install for development, generates lock file)
RUN npm install

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]