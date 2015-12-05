WEBPACK=node_modules/.bin/webpack --config webpack.config.js
TARGET=api_js.js
SRC=lib/


$(TARGET): $(SRC)/index.es6 $(shell find lib -name '*.es6' -or -name '*.js')
	$(WEBPACK) $< $@

watch:
	$(WEBPACK) --watch $(SRC)/index.es6 $(TARGET)
