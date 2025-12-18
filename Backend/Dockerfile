# 1. Use an official Node runtime
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy the rest of the code
COPY . .

# 6. Expose port
EXPOSE 5000

# 7. Start the app using npm start (Uses the fixed package.json script)
CMD ["npm", "start"]
