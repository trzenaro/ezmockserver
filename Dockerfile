FROM node:lts-alpine

COPY . /app

RUN \
  cd /app && \
  npm install --production

WORKDIR /app

EXPOSE 3000 3050

CMD ["node","src/index.js"]