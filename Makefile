.DEFAULT_GOAL := help

.PHONY: help install dev start build build-pages test lint check

help:
	@echo "International Sacred Calendar"
	@echo ""
	@echo "  make install      Install dependencies from package-lock.json"
	@echo "  make dev          Start the local development server"
	@echo "  make start        Start the built production server"
	@echo "  make build        Create the production build"
	@echo "  make build-pages  Create the GitHub Pages static build"
	@echo "  make test         Build and run the full test suite"
	@echo "  make lint         Run the linter"
	@echo "  make check        Run lint and tests"

install:
	npm ci

dev:
	npm run dev

start:
	npm run start

build:
	npm run build

build-pages:
	npm run build:pages

test:
	npm test

lint:
	npm run lint

check: lint test
