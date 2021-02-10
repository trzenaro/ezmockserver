FROM node:lts-alpine

COPY . /app

RUN \
  cd /app && \
  npm install --production

WORKDIR /app/src

EXPOSE 3000 3050

CMD ["node","index.js"]