FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Use npm ci if package-lock.json exists, otherwise use npm install
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --production; fi
COPY . .
EXPOSE 3003
CMD ["node","server.js"]