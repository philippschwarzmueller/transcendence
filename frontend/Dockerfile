FROM node:lts-alpine
LABEL version="1.1"
LABEL description="This is the container for our frontend"

WORKDIR /code/frontend

COPY package.json /code/frontend/
COPY package-lock.json /code/frontend/
COPY setup.sh /code/frontend

EXPOSE 3000

CMD ["/code/frontend/setup.sh"]
