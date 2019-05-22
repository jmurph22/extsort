install:
	install -m 755 extsort.js /usr/bin
	npm install -g fs-extra
uninstall:
	rm /usr/bin/extsort.js
