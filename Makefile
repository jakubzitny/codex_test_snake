.PHONY: install dev build build-pages lint format format-check test test-unit test-e2e check

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

build-pages:
	pnpm build:pages

lint:
	pnpm lint

format:
	pnpm format

format-check:
	pnpm format:check

test:
	pnpm test

test-unit:
	pnpm test:unit

test-e2e:
	pnpm test:e2e

check:
	pnpm check
