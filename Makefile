.PHONY: run
run:
	docker run \
		-p 8000:8000 \
		-v $$(pwd):/dummy \
		-ti python:slim-buster \
		python -m http.server --directory /dummy
