release:
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
