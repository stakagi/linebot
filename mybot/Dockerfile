FROM node:11.6.0-alpine

ARG CHANNEL_ACCESS_TOKEN
ARG CHANNEL_SECRET

#RUN apk --update add imagemagick

WORKDIR /var/opt/mybot
ADD mybot/index.js .
ADD mybot/logic.js .
ADD mybot/package-lock.json .
ADD mybot/package.json .
ADD mybot/static ./static
RUN npm install

ENV CHANNEL_ACCESS_TOKEN ${CHANNEL_ACCESS_TOKEN}
ENV CHANNEL_SECRET ${CHANNEL_SECRET}
EXPOSE 3000

CMD ["npm", "start"]