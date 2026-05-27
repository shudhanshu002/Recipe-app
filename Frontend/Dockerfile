# Stage 1: Build
FROM node:18-alpine as build
WORKDIR /app
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# CRITICAL: Delete the default config
RUN rm /etc/nginx/conf.d/default.conf

# CRITICAL: Copy OUR custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
