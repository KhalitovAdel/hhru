FROM node:slim as install_dev_deps

WORKDIR /development
COPY package* ./
RUN npm ci

FROM install_dev_deps as build_src

RUN pwd
COPY src/ ./src
COPY package.json ./package.json
COPY tsconfig* ./
RUN npm run build

FROM node:slim

WORKDIR /app
COPY --from=build_src /development/dist ./dist
COPY package* ./
RUN npm ci --only=prod

VOLUME logs

ENTRYPOINT npm run start:prod
