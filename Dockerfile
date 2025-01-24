FROM oven/bun:latest

WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN bun install
COPY . .

ENV NODE_ENV production

USER bun

EXPOSE 8080/tcp
CMD [ "bun", "run", "index.ts" ]