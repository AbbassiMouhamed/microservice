FROM node:24-alpine AS build
WORKDIR /app

COPY frontend/smartlingua-ui/package*.json ./
RUN npm ci

COPY frontend/smartlingua-ui/ ./
RUN npm run build


FROM nginx:1.27-alpine

COPY frontend/smartlingua-ui/nginx.conf /etc/nginx/conf.d/default.conf
# Angular 21 outputs files under dist/<project>/browser
COPY --from=build /app/dist/smartlingua-ui/browser /usr/share/nginx/html

EXPOSE 80
