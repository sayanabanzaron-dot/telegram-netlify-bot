# Размещение на сервере

Бот работает через long polling. Для него не нужен домен и webhook: достаточно сервера, где постоянно запущен Python-процесс.

## Переменные

Обязательная:

```bash
TELEGRAM_BOT_TOKEN=токен_от_BotFather
```

Необязательная, но полезная:

```bash
ADMIN_CHAT_ID=ваш_telegram_id
```

Если `ADMIN_CHAT_ID` задан, бот будет отправлять новые заявки администратору.

Узнать свой ID можно через Telegram-бота `@userinfobot` или временно посмотреть входящие обновления в логах.

## Быстрый вариант: VPS

1. Загрузите папку проекта на сервер.
2. Установите Python 3.11+.
3. Проверьте тесты:

```bash
python -m unittest discover -s tests -p "test_*.py"
```

4. Запустите:

```bash
TELEGRAM_BOT_TOKEN="ваш_токен" ADMIN_CHAT_ID="ваш_id" python telegram_bot.py
```

## Постоянный запуск через systemd

Создайте файл `/etc/systemd/system/telegram-bot.service`:

```ini
[Unit]
Description=Telegram bot
After=network.target

[Service]
WorkingDirectory=/opt/telegram-bot
Environment=TELEGRAM_BOT_TOKEN=ваш_токен
Environment=ADMIN_CHAT_ID=ваш_id
ExecStart=/usr/bin/python3 /opt/telegram-bot/telegram_bot.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Затем:

```bash
sudo systemctl daemon-reload
sudo systemctl enable telegram-bot
sudo systemctl start telegram-bot
sudo systemctl status telegram-bot
```

## Вариант с Docker

```bash
docker build -t telegram-bot .
docker run -d --name telegram-bot --restart always \
  -e TELEGRAM_BOT_TOKEN="ваш_токен" \
  -e ADMIN_CHAT_ID="ваш_id" \
  telegram-bot
```
