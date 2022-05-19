# syntax=docker/dockerfile:1

FROM --platform=linux/amd64 node:16-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./
COPY src ./src

RUN npm install --production

EXPOSE 3001
CMD ["npm", "start"]