FROM python:3.12-slim
RUN pip install --no-cache-dir pillow==11.0.0 pillow-heif==0.20.0
WORKDIR /app
COPY server.py .
ENV DATA_DIR=/data PORT=8090
VOLUME /data
EXPOSE 8090
CMD ["python", "-u", "server.py"]
