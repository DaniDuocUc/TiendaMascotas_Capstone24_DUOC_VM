### STAGE 1: Build ###
# We label our stage as ‘node’
FROM node:16.14.0-alpine AS node
ARG build_env
COPY package.json package-lock.json ./

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm i && mkdir /app && mv ./node_modules ./app

WORKDIR /app

COPY . .

## Build the angular app in production mode and store the artifacts in dist folder
RUN if [ "$build_env" = "prod" ]; \
    then npm run-script build-prod; \
    else npm run-script build-dev; \
    fi

# Borrar el caché de Angular
RUN rm -rf /app/.angular/cache


### STAGE 2: Setup ###
FROM nginx:1.25.3-alpine

## Copy our default nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From ‘node’ stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=node /app/dist/fuse /usr/share/nginx/html
