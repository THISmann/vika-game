FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Use npm install for production dependencies (more flexible than npm ci)
RUN npm install --production --omit=dev
COPY . .
EXPOSE 3001
CMD ["node","server.js"]