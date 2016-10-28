
BIN = ./node_modules/.bin
ESLINT = $(BIN)/eslint
BROWSERIFY = $(BIN)/browserify
MOCHA = $(BIN)/mocha
UGLIFY = $(BIN)/uglifyjs
BEAUTIFY = $(BIN)/js-beautify

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
	npm test

beautify: index.js ./src/*.js ./test/*.js
	$(BEAUTIFY) $^ --replace

server:
	python -m SimpleHTTPServer 8080

ghpages:
	git checkout gh-pages
	git checkout master demo/
	cp demo/src.js src.js
	cp demo/styles.css styles.css
	rm -rf demo/
	git add . --all
	git commit -m "update gh-pages"
	git push
	git checkout master

.PHONY: eslint test build beautify ghpages
