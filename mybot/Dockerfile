FROM node:11.6.0-alpine

ARG CHANNEL_ACCESS_TOKEN
ARG CHANNEL_SECRET

WORKDIR /var/opt/mybot
ADD index.js .
ADD package-lock.json .
ADD package.json .
ADD static ./static
RUN npm install

ENV CHANNEL_ACCESS_TOKEN ${CHANNEL_ACCESS_TOKEN}
ENV CHANNEL_SECRET ${CHANNEL_SECRET}
EXPOSE 3000

CMD ["npm", "start"]