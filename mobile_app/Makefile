.PHONY: dev build codegen https preview preview-http export-ca reset-https-certs sync android ios typecheck

PORT ?= 4173

dev:
	npm run dev -- --host 0.0.0.0 --port 5174

build:
	npm run build

codegen:
	npm run api:generate

https:
	PORT=$(PORT) npm run preview:https

preview:
	PORT=$(PORT) npm run preview:https

preview-http:
	npm run preview -- --host 0.0.0.0 --port $(PORT)

export-ca:
	cp /tmp/city-grind-pwa-https/ca.pem ./city-grind-local-ca.pem
	cp /tmp/city-grind-pwa-https/ca.pem ./city-grind-local-ca.crt
	@echo "CA exported to ./city-grind-local-ca.pem"
	@echo "Also exported to ./city-grind-local-ca.crt for Android import dialogs that prefer .crt"
	@echo "Transfer that file to your Android phone and install it as a CA certificate."

reset-https-certs:
	rm -f /tmp/city-grind-pwa-https/ca.key /tmp/city-grind-pwa-https/ca.pem /tmp/city-grind-pwa-https/ca.srl /tmp/city-grind-pwa-https/server.key /tmp/city-grind-pwa-https/server.csr /tmp/city-grind-pwa-https/server.crt /tmp/city-grind-pwa-https/server.cnf
	@echo "Removed cached local HTTPS certificates from /tmp/city-grind-pwa-https"

sync:
	npm run cap:sync

android:
	npm run android

ios:
	npm run ios

typecheck:
	npm run typecheck
