FROM node:18-alpine as build
WORKDIR /app
COPY front/package*.json ./
# Use npm install (needs dev dependencies for build)
RUN npm install
COPY front/ .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["serve","-s","dist","-l","5173"]