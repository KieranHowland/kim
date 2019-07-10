FROM node:8
WORKDIR /app
COPY . /app
RUN npm i
RUN node views/compress
CMD node cluster
EXPOSE 8001
