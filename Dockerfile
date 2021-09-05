FROM node:14

WORKDIR /app

COPY /Server ./Server

RUN cd ./Server && npm i

COPY /Client ./Client

RUN cd ./Client && npm i --loglevel verbose
RUN cd Client && npm run build

CMD cd ./Server && npm start

EXPOSE 5050