FROM node:lts-alpine

RUN npm i -g ezmockserver

WORKDIR /ezmockserver

EXPOSE 3000 3050

CMD ["ezmockserver"]