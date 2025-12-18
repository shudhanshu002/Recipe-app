# 1. Use an official Node runtime as a parent image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files first (for caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy the rest of the backend code
COPY . .

# 6. Expose the port the app runs on (usually 5000 or 8000)
EXPOSE 5000

# 7. Define the command to run the app
CMD ["node", "index.js"]