#location of docker-compose
COMPOSE = docker-compose.yml

#build and run
all: up docker

#build and run
up: $(REDIRECT) docker
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
	-docker image rm $(shell docker image ls -q)
	-docker volume rm $(shell docker volume ls -q)

#kill running container
kill_all:
	docker kill $(shell docker ps -q)

#location to save container
REDIRECT = $(HOME)/goinfre/docker

#script to redirect container
$(REDIRECT):
	@if test -d ~/goinfre; then bash ./docker/redirect.sh; else echo "not on a school machine, so no redirection"; fi

#forefully redirects docker location
redirect:
	bash ./docker/redirect.sh

#rule to start docker
docker:
	@if ! pgrep Docker > /dev/null; \
	then \
		echo "Starting Docker"; \
		open -a Docker > /dev/null; \
		sleep 20; \
	fi

.PHONY: docker redirect kill_all fclean clean dow run re up all
