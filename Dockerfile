FROM python:3.9

RUN pip3 install awyes

ENTRYPOINT "awyes --path $1 --workflow $2"
