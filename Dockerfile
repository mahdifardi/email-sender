# Stage 1: Build the TypeScript application
FROM node:20-slim AS build

# Set the working directory
WORKDIR /src/app

# Copy package.json and yarn.lock to install dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install 

# Copy the source code
COPY . .

# Build the TypeScript application
RUN yarn build

# Stage 2: Create a lightweight production image
FROM node:20-slim

# Set the working directory
WORKDIR /src/app

# Copy the built application from the previous stage
COPY --from=build /src/app/package.json ./
COPY --from=build /src/app/dist ./dist
COPY --from=build /src/app/node_modules ./node_modules



# Start the application
CMD ["node", "./dist/main.js"]