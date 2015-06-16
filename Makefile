
BIN = ./node_modules/.bin
ESLINT = $(BIN)/eslint
MOCHA = $(BIN)/mocha

eslint: src/*.js
	$(ESLINT) $^

test:
	$(MOCHA) --compilers js:babel/register

.PHONY: eslint test
