FROM node:16-buster-slim

RUN apt update && apt install openssl -y

RUN npm i -g sharp

RUN mkdir /app

COPY apps/web/.next /app/.next

ENV NODE_ENV production

CMD [ "node", "/app/.next/standalone/apps/web/server.js" ]