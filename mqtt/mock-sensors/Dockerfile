FROM alpine:3.21
RUN apk add --no-cache mosquitto-clients
COPY publish.sh /publish.sh
RUN chmod +x /publish.sh
CMD ["/publish.sh"]
