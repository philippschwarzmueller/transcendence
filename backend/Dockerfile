FROM node:lts-alpine

WORKDIR /code
COPY package.json /code/package.json
COPY package-lock.json /code/package-lock.json
RUN npm ci
COPY . /code
EXPOSE 4000

CMD ["npm", "run", "start:dev"]
