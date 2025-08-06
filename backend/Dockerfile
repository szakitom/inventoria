FROM node:lts-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn run build

FROM node:lts-alpine

WORKDIR /app

RUN corepack enable
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["yarn", "start:prod"]
