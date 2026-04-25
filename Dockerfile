FROM alpine:3.19

ARG PB_VERSION=0.25.9

RUN apk add --no-cache \
    unzip \
    curl \
    ca-certificates \
 && curl -L https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip -o /tmp/pb.zip \
 && unzip /tmp/pb.zip -d /pocketbase \
 && rm /tmp/pb.zip \
 && apk del unzip

EXPOSE 8090

VOLUME /pb_data

CMD ["/pocketbase/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data"]