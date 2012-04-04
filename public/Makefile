BOOTSTRAP = ./docs/assets/css/bootstrap.css
BOOTSTRAP_LESS = ./less/bootstrap.less
BOOTSTRAP_RESPONSIVE = ./docs/assets/css/bootstrap-responsive.css
BOOTSTRAP_RESPONSIVE_LESS = ./less/responsive.less
LESS_COMPRESSOR ?= `which lessc`
WATCHR ?= `which watchr`


#
# BUILD SIMPLE BOOTSTRAP DIRECTORY
# lessc & uglifyjs are required
#

bootstrap:
	mkdir -p bootstrap/img
	mkdir -p bootstrap/css
	mkdir -p bootstrap/js
	cp img/* bootstrap/img/
	lessc ${BOOTSTRAP_LESS} > bootstrap/css/bootstrap.css
	lessc --compress ${BOOTSTRAP_LESS} > bootstrap/css/bootstrap.min.css
	lessc ${BOOTSTRAP_RESPONSIVE_LESS} > bootstrap/css/bootstrap-responsive.css
	lessc --compress ${BOOTSTRAP_RESPONSIVE_LESS} > bootstrap/css/bootstrap-responsive.min.css
	cat js/libs/bootstrap-transition.js js/libs/bootstrap-alert.js js/libs/bootstrap-button.js js/libs/bootstrap-carousel.js js/libs/bootstrap-collapse.js js/libs/bootstrap-dropdown.js js/libs/bootstrap-modal.js js/libs/bootstrap-tooltip.js js/libs/bootstrap-popover.js js/libs/bootstrap-scrollspy.js js/libs/bootstrap-tab.js js/libs/bootstrap-typeahead.js > bootstrap/js/libs/bootstrap.js
	uglifyjs -nc bootstrap/js/libs/bootstrap.js > bootstrap/js/libs/bootstrap.min.tmp.js
	echo "/**\n* Bootstrap.js by @fat & @mdo\n* Copyright 2012 Twitter, Inc.\n* http://www.apache.org/licenses/LICENSE-2.0.txt\n*/" > bootstrap/js/copyright.js
	cat bootstrap/js/copyright.js bootstrap/js/libs/bootstrap.min.tmp.js > bootstrap/js/libs/bootstrap.min.js
	rm bootstrap/js/copyright.js bootstrap/js/libs/bootstrap.min.tmp.js

#
# MAKE FOR GH-PAGES 4 FAT & MDO ONLY (O_O  )
#

gh-pages: docs
	rm -f ../bootstrap-gh-pages/assets/bootstrap.zip
	node docs/build production
	cp -r docs/* ../bootstrap-gh-pages

#
# WATCH LESS FILES
#

watch:
	echo "Watching less files..."; \
	watchr -e "watch('less/.*\.less') { system 'make' }"


.PHONY: docs watch gh-pages
