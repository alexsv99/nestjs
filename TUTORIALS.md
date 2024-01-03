# Nest JS and Vue JS app

We use such tutorials:  
 - [Building a Modern App using Nest.js, MongoDB and Vue.js (Morioh)](https://morioh.com/a/9a225d7524b5/building-a-modern-app-using-nestjs-mongodb-and-vuejs)
 - [Live Reload in Running Docker Containers](https://blog.yarsalabs.com/live-reload-in-running-docker-containers/)
 - [NestJS, Redis and Postgres local development with Docker Compose](https://www.tomray.dev/nestjs-docker-compose-postgres)

// Deleted form `package.json`  
//    "start:dev": "nest start --watch",
//    "start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch",

**Please note** - if your NestJS image already exists, you can run:  
```shell
docker-compose up -d --build
```
to rebuild the image.

You can stop and remove container by command:
```shell
docker-compose down
```