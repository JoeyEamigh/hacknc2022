FROM debian:bookworm-slim

RUN mkdir /app
WORKDIR /app
COPY rmp /app
COPY .env /app
COPY prof.graphql /app
RUN chmod +x /app/rmp

ENTRYPOINT ["/app/rmp"]
