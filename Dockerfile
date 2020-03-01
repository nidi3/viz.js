FROM trzeci/emscripten:sdk-tag-1.37.36-64bit

RUN make deps
RUN make all
