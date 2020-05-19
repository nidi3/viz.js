FROM trzeci/emscripten:sdk-tag-1.37.36-64bit

RUN apt -y update || true && apt -y install apt-transport-https
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt -y update || true && apt -y install file yarn libgd-dev libfontconfig1-dev
