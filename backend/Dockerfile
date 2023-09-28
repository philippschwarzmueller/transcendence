FROM node:lts-alpine

WORKDIR /code
COPY package.json /code/package.json
COPY package-lock.json /code/package-lock.json
RUN npm install -g @nestjs/cli
RUN npm ci
COPY . .
EXPOSE 4000

CMD ["npm", "run", "start:dev"]
