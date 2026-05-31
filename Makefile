.PHONY: help up down stop build logs logs-backend logs-frontend logs-notebooks shell-backend shell-frontend shell-notebooks migrate

help:
	@echo "Makefile para o projeto CheckAI com Docker Compose"
	@echo ""
	@echo "Comandos disponíveis:"
	@echo "  up             -> Sobe todos os serviços em background (--build, -d)"
	@echo "  down           -> Para e remove os containers, redes e volumes"
	@echo "  stop           -> Para os serviços sem remover os containers"
	@echo "  build          -> Força a reconstrução das imagens dos serviços"
	@echo "  logs           -> Mostra os logs de todos os serviços"
	@echo "  logs-backend   -> Mostra os logs apenas do serviço 'backend'"
	@echo "  logs-frontend  -> Mostra os logs apenas do serviço 'frontend'"
	@echo "  logs-notebooks -> Mostra os logs apenas do serviço 'notebooks'"
	@echo "  shell-backend  -> Abre um shell interativo no container 'backend'"
	@echo "  shell-frontend -> Abre um shell interativo no container 'frontend'"
	@echo "  shell-notebooks-> Abre um shell interativo no container 'notebooks'"
	@echo "  migrate        -> Executa o script de criação de tabelas no banco de dados"

up:
	docker-compose up --build -d

down:
	docker-compose down

stop:
	docker-compose stop

build:
	docker-compose build

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-notebooks:
	docker-compose logs -f notebooks

shell-backend:
	docker-compose exec backend sh

shell-frontend:
	docker-compose exec frontend sh

shell-notebooks:
	docker-compose exec notebooks sh

migrate:
	docker-compose exec backend python criar_tabelas.py
