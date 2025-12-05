FROM node:20-alpine AS build
WORKDIR /app
COPY front/package*.json ./
# Use npm install (needs dev dependencies for build)
RUN npm install
COPY front/ .
# Les variables VITE_* doivent être passées au moment du build
# Elles seront remplacées par Vite dans le code compilé
ARG VITE_AUTH_SERVICE_URL=http://localhost:3000/auth
ARG VITE_QUIZ_SERVICE_URL=http://localhost:3000/quiz
ARG VITE_GAME_SERVICE_URL=http://localhost:3000/game
ENV VITE_AUTH_SERVICE_URL=$VITE_AUTH_SERVICE_URL
ENV VITE_QUIZ_SERVICE_URL=$VITE_QUIZ_SERVICE_URL
ENV VITE_GAME_SERVICE_URL=$VITE_GAME_SERVICE_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["serve","-s","dist","-l","5173"]