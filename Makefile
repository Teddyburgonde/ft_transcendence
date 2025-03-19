make:
	docker-compose up --build -d

re:
	docker-compose down --rmi all
	docker-compose up --build -d

restart:
	docker-compose down
	docker-compose up -d

check:
	docker ps
	docker images
clean:
	docker-compose down --rmi all

fclean:
	docker system prune -a --volumes -f

stop:
	docker-compose down

.PHONY: make re check clean stop fclean restart
