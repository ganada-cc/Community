FROM node:18.16.0-alpine
RUN mkdir –p /app
COPY package*.json /app/
COPY . /app/
WORKDIR /app
RUN npm install
CMD ["npm", "start"]