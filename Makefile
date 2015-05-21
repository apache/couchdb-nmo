UNAME := $(shell uname)

man1files := $(shell find doc/cli -name '*.md' \
				| sed 's|.md|.1|g' \
				| sed 's|doc/cli|man/man1|g')

man3files := $(shell find doc/api -name '*.md' \
				| sed 's|.md|.3|g' \
				| sed 's|doc/api|man/man3|g')

man7files := $(shell find doc/misc -name '*.md' \
				| sed 's|.md|.7|g' \
				| sed 's|doc/misc|man/man7|g')

websitefiles := $(shell find doc -name '*.md' \
				| sed 's|.md|.html|g' \
				| sed 's|doc/|website/|g' \
				| sed 's|website/website/|website/|g')

websitestyles = website/assets/css/style.css

websitejs := $(shell find doc/website -name '*.js' \
				| sed 's|doc/||g' )

tocfiles := $(shell find doc -name '*.md' \
				| sed 's|.md|.html|g' \
				| sed 's|doc/||g' \
				| sed 's|website/||g')

all: docs website

docs: $(man1files) $(man3files) $(man7files)
website: $(websitefiles) $(websitestyles) $(websitejs) website/toc.html website/toc-index.html

marked = ./node_modules/marked-man/bin/marked-man
lessc = ./node_modules/less/bin/lessc

docgen = ./node_modules/node-doc-generator/generate.js
createdocs = $(docgen) --format=html --template=doc/website/doc-template.html

ifeq ($(UNAME), Darwin)
	replaceinfile = sed -i ''
else
	replaceinfile = sed -i
endif

website/cli/%.html:
	@[ -d $(@D) ] || mkdir -p $(@D)
	@$(createdocs) doc/cli/$*.md > $@
	@perl -p -i -e "s/$*\(.\) -- //g" $@
	@perl -p -i -e "s/SYNOPSIS/Synopsis/g" $@
	@perl -p -i -e "s/DESCRIPTION/Description/g" $@

website/api/%.html:
	@[ -d $(@D) ] || mkdir -p $(@D)
	$(createdocs) doc/api/$*.md > $@
	@perl -p -i -e "s/$*\(.\) -- //g" $@
	@perl -p -i -e "s/SYNOPSIS/Synopsis/g" $@
	@perl -p -i -e "s/DESCRIPTION/Description/g" $@

website/misc/%.html:
	@[ -d $(@D) ] || mkdir -p $(@D)
	@$(createdocs) doc/misc/$*.md > $@
	@perl -p -i -e "s/$*\(.\) -- //g" $@
	@perl -p -i -e "s/SYNOPSIS/Synopsis/g" $@
	@perl -p -i -e "s/DESCRIPTION/Description/g" $@

website/index.html: website/toc-index.html
	@[ -d $(@D) ] || mkdir -p $(@D)
	$(docgen) --format=html --template=doc/website/doc-template.html doc/website/index.md > $@
	$(replaceinfile) -e '/__CUSTOMTOC__/r website/toc-index.html' -e "//d" website/index.html; \
	$(replaceinfile) "s/__PATH__/./g" website/index.html; \

website/toc-index.html:
	touch website/toc-index.html
	for file in $(tocfiles) ; do \
		tmp=$${file##*/nmo-}; \
		title=`expr "$$tmp" : '\(.*\).html'`; \
		echo "<a href=\"./$$file\">$$title</a>" >> website/toc-index.html; \
	done

website/toc.html: $(websitefiles)
	touch website/toc.html
	for file in $(tocfiles) ; do \
		tmp=$${file##*/nmo-}; \
		title=`expr "$$tmp" : '\(.*\).html'`; \
		echo "<a href=\"../$$file\">$$title</a>" >> website/toc.html; \
	done
	for file in $(tocfiles) ; do \
		if [[ $$file =~ "/" ]] ; then \
			path='..'; \
		else \
			path='.'; \
		fi; \
		$(replaceinfile) -e '/__CUSTOMTOC__/r website/toc.html' -e "//d" website/$$file; \
		$(replaceinfile) "s/__PATH__/$${path}/g" website/$$file; \
	done



website/assets/css/style.css:
	@[ -d $(@D) ] || mkdir -p $(@D)
	@$(lessc) -x doc/website/assets/css/style.less > $@

website/assets/%.js:
	@[ -d $(@D) ] || mkdir -p $(@D)
	cp doc/website/assets/$*.js $@

man/man1/%.1:
	@[ -d $(@D) ] || mkdir -p $(@D)
	$(marked) doc/cli/$*.md > $@

man/man3/%.3:
	@[ -d $(@D) ] || mkdir -p $(@D)
	$(marked) doc/api/$*.md > $@

man/man7/%.7:
	@[ -d $(@D) ] || mkdir -p $(@D)
	$(marked) doc/misc/$*.md > $@

clean:
	rm -rf lib
	rm -rf man
	rm -rf website

testwebsite: clean website
	@open website/index.html


deploy: clean website
	@cd ./website && git init . && git add . && git commit -nm \"Deployment\" && \
	git push "git@github.com:robertkowalski/nmo.git" master:gh-pages --force && rm -rf .git
