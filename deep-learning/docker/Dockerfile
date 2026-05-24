FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from the build context (the deep-learning root)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8888 8000

CMD ["jupyter", "lab", "--ip=0.0.0.0", "--allow-root", "--no-browser"]