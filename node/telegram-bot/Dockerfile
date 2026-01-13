FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Use npm install (package-lock.json may be out of sync)
RUN npm install --production --omit=dev
COPY . .
EXPOSE 3004
# TELEGRAM_BOT_TOKEN must be provided as environment variable
CMD ["node","server.js"]

