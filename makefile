all:
	g++ examples.cpp -std=c++17 -Os -lioapp -o extsort
install:
	install -m 755 extsort /usr/bin

uninstall:
	rm /usr/bin/extsort

clean:
	rm *.o extsort
