# Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY . .
RUN npm install && npx tsc

# Production stage
FROM node:20-alpine as prod
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/views ./views
COPY --from=build /app/db ./db
COPY --from=build /app/knexfile.js .
COPY --from=build /app/package.json .
RUN npm install --omit=dev

EXPOSE 3000
ENTRYPOINT [ "npm", "start" ]