FROM node:22-alpine
WORKDIR /workspace
COPY workspace /workspace
COPY skills /skills
COPY config /config
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
