FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Use npm ci for reproducible builds (requires package-lock.json)
RUN npm ci --omit=dev
COPY . .
EXPOSE 3001
CMD ["node","server.js"]