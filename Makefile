WEBPACK=node_modules/.bin/webpack --config webpack.config.js
TARGET=api_js.js
SRC=lib/

build: $(TARGET)

release: build
	@echo Latest version: $(shell git tag | tail -n 1)
	@while [ -z "$$VERSION" ]; do \
    read -r -p "Version: " VERSION;\
  done && \
	while [ -z "$$MESSAGE" ]; do \
        read -r -p "Message: " MESSAGE; \
  done && \
	( node_modules/.bin/json -I -f package.json -e "this.version = '$$VERSION';"; \
		git add $(TARGET) package.json; \
		git commit -m "Compiled: $$MESSAGE"; \
		git tag -a $$VERSION -m "Release $$VERSION"; \
	)
	git push origin master --follow-tags

$(TARGET): $(SRC)/index.es6 $(shell find lib -name '*.es6' -or -name '*.js')
	$(WEBPACK) $< $@

watch:
	$(WEBPACK) --watch $(SRC)/index.es6 $(TARGET)
