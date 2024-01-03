# Application Docker file Configuration
# Visit https://docs.docker.com/engine/reference/builder/
# Using multi stage build

# Prepare the image when build
# also use to minimize the docker image
FROM node:20-alpine as development

WORKDIR /app
COPY package*.json ./
RUN npm install --only=development
COPY . .
RUN npm run build


# Build the image as production
# So we can minimize the size
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

ENV PORT=3030
ENV NODE_ENV=production

RUN npm install --only=production
COPY . .

COPY --from=development /app/dist ./dist
EXPOSE ${PORT}

CMD ["npm", "run", "start"]