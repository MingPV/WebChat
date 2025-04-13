FROM node:18-alpine

WORKDIR /app

# Install dependencies using Yarn
COPY package.json yarn.lock ./
RUN yarn install

# Copy all files
COPY . .

# Copy env file
COPY .env.production .env

# Build the project
RUN yarn build

# Expose the port
EXPOSE 8080

# Set production environment
ENV NODE_ENV=production

# Run the app
CMD ["yarn", "start"]
