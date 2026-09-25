FROM node:18-alpine as build

WORKDIR /app
COPY package*.json /app/

RUN npm ci
COPY . /app

RUN npm run build:prod

FROM nginx:alpine
COPY dynamic-env.json /usr/share/nginx/html
COPY nginx.conf  /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/TaskFlow /usr/share/nginx/html
