FROM --platform=linux/amd64/v8 timmson/mbt-platform-v2:node
LABEL maintaner="Krotov Artem <timmson666@mail.ru>"

ARG username

RUN useradd ${username} -s /bin/bash -G sudo -md /home/${username} && \
    sed -i.bkp -e 's/%sudo\s\+ALL=(ALL\(:ALL\)\?)\s\+ALL/%sudo ALL=NOPASSWD:ALL/g' /etc/sudoers && \
    mkdir /app

WORKDIR /app

COPY dist/ .
COPY node_modules/ ./node_modules

RUN chown -R ${username}:${username} .

USER ${username}

CMD ["node", "app"]