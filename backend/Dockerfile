FROM python:3.13-slim

WORKDIR /app/backend

RUN pip install uv
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev

COPY . ..

EXPOSE 8001

CMD [ "uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001" ]
