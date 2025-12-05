FROM node:20-alpine

WORKDIR /app

# Installer curl pour le healthcheck (optionnel, on utilise Node.js)
# RUN apk add --no-cache curl

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm install --production --omit=dev

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Commande de démarrage
CMD ["node", "server.js"]

