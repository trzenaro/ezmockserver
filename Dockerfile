FROM node:lts-alpine

COPY . /app

RUN \
  cd /app && \
  npm install --production

WORKDIR /app/mockserver

EXPOSE 3000 3050

CMD ["npm", "run" ,"--prefix", "..", "start"]