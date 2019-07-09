FROM node:8
WORKDIR /app
COPY . /app
RUN npm i
CMD node cluster
EXPOSE 8001
