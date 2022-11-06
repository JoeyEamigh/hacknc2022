FROM debian:bookworm-slim

RUN apt update && apt install libssl-dev -y
RUN mkdir /app
WORKDIR /app
COPY lookup /app
RUN chmod +x /app/lookup

ENTRYPOINT ["/app/lookup"]
