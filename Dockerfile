# syntax=docker/dockerfile:1
# https://docs.docker.com/build/dockerfile/release-notes/

# https://github.com/searxng/searxng/blob/master/Dockerfile
# https://github.com/searxng/searxng-docker/blob/master/docker-compose.yaml

FROM --platform=linux/amd64 searxng/searxng:2025.5.3-8ef5fbca4@sha256:b049dbbc1c40a5391650874493a5096e9f3e09d620d4adfb073bb03eb197c7b1

RUN --mount=type=cache,target=/var/cache/apk apk update
RUN --mount=type=cache,target=/var/cache/apk apk upgrade
RUN --mount=type=cache,target=/var/cache/apk apk cache clean
RUN --mount=type=cache,target=/var/cache/apk apk del --purge

RUN --mount=type=cache,target=/root/.cache/pip pip cache purge

# Generate default configuration files
COPY --link searxng/settings.yml /etc/searxng/settings.yml
COPY --link searxng/uwsgi.ini /etc/searxng/uwsgi.ini

ENV SEARXNG_BASE_URL="https://search.demosjarco.dev"

# Replace the default secret_key with a securely generated one
RUN sed -i "s|secret_key: .*|secret_key: \"$(openssl rand -hex 32)\"|" /etc/searxng/settings.yml
RUN sed -i "s|cf_account_id: .*|cf_account_id: \"$CF_ACCOUNT_ID\"|" /etc/searxng/settings.yml
RUN sed -i "s|cf_ai_api: .*|cf_ai_api: \"$CF_API_TOKEN\"|" /etc/searxng/settings.yml