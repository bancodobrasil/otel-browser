FROM golang:1.18-alpine AS BUILD

WORKDIR /app

COPY go.* /app/
COPY vendor vendor
#RUN go mod download -x

COPY server.go .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -v -ldflags="-w -s" -o example

EXPOSE 7000

CMD [ "/app/example" ]