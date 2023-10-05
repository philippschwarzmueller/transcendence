FROM node:lts-alpine
LABEL version="1.1"
LABEL description="This is the container for our backend"

WORKDIR /code/backend

COPY package.json /code/backend/
COPY package-lock.json /code/backend/
COPY setup.sh /code/backend

EXPOSE 4000

CMD ["/code/backend/setup.sh"]
