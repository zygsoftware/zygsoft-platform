FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg62-turbo \
    libopenjp2-7 \
    zlib1g \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-railway.txt ./requirements-railway.txt
RUN pip install --no-cache-dir -r requirements-railway.txt

COPY api ./api
COPY main.py ./main.py
COPY paragraph_processor.py ./paragraph_processor.py
COPY table_processor.py ./table_processor.py
COPY utils.py ./utils.py
COPY blank_udf_template.xml ./blank_udf_template.xml

EXPOSE 8000

CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
