FROM node:lts-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn run build:prod

FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx-dev.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /tmp/nginx.conf
ARG ENVIRONMENT=development
RUN [ "$ENVIRONMENT" = "production" ] && cp /tmp/nginx.conf /etc/nginx/conf.d/default.conf || true

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
