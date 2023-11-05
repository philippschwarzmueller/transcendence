#location of docker-compose
COMPOSE = docker-compose.yml

#build and run
all: run

#build and run
up:
	docker-compose -f $(COMPOSE) up  --build

#take down, build and run
re:
	-make down
	-make all

#run, dont build
run:
	docker-compose -f $(COMPOSE) up

#take down
down:
	docker-compose -f $(COMPOSE) down

#take down
clean:
	docker-compose -f $(COMPOSE) down

#take down, remove images
fclean: clean
	-docker rm -f $(shell docker ps -aq)
	-docker image rm $(shell docker image ls -q)
	-docker volume rm $(shell docker volume ls -q)

#kill running container
kill_all:
	docker kill $(shell docker ps -q)

.PHONY: docker redirect kill_all fclean clean dow run re up all
