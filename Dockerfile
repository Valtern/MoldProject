FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies first, then copy source.
# Using package-lock.json ensures deterministic installs.
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci

COPY . ./
RUN npm run build

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
