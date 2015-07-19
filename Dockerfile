FROM node:0.12.7
ADD . /csrest
WORKDIR /csrest
RUN npm install
CMD npm start
