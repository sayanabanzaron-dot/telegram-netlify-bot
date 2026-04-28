FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY . .

CMD ["python", "telegram_bot.py"]
