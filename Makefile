
BIN = ./node_modules/.bin
ESLINT = $(BIN)/eslint
BROWSERIFY = $(BIN)/browserify
MOCHA = $(BIN)/mocha
UGLIFY = $(BIN)/uglifyjs

build:
	$(BROWSERIFY) ./index.js \
	--standalone Fili \
	-t [babelify --stage 0] \
	-t [envify --NODE_ENV production] \
	-p [bannerify --file ./dist/banner.txt] \
	-o ./dist/fili.js
	$(UGLIFY) ./dist/fili.js --compress --mangle --comments -o ./dist/fili.min.js

eslint: src/*.js
	$(ESLINT) $^

test:
	$(MOCHA) --compilers js:babel/register

.PHONY: eslint test build
