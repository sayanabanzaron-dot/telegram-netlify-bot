# Telegram Bot

Рабочий Telegram-бот. Для Netlify используется webhook-функция `netlify/functions/telegram.js`; локальная Python-версия оставлена как дополнительный вариант.

## Что умеет

- `/start` - главное меню.
- `/help` - помощь.
- `/services` - список услуг.
- `/faq` - частые вопросы.
- `/links` - полезные ссылки кнопками.
- `/request` - принять заявку от пользователя.
- `/test` - встроенный тест прямо в Telegram.
- `/cancel` - отменить текущее действие.

## Запуск

1. Откройте Telegram и напишите [@BotFather](https://t.me/BotFather).
2. Создайте бота командой `/newbot`.
3. Скопируйте токен.
4. Запустите:

```bash
TELEGRAM_BOT_TOKEN=ваш_токен ADMIN_CHAT_ID=ваш_telegram_id python telegram_bot.py
```

Бот начнет получать сообщения через long polling. Остановить можно через `Ctrl+C`.

`ADMIN_CHAT_ID` можно не указывать. Если он задан, новые заявки будут приходить вам отдельным сообщением.

## Тесты

```bash
python -m unittest discover -s tests -p "test_*.py"
```

Тесты проверяют меню, ссылки, услуги, старт встроенного теста, подсчет результата, заявки и эхо-сообщения.

## Настройка ссылок

Основные тексты, услуги, FAQ и ссылки находятся в начале файла `telegram_bot.py`:

```python
BUSINESS_NAME = "Рабочий бот"
SITE_URL = "https://example.com/"
PORTFOLIO_URL = "https://github.com/"
CONTACT_URL = "https://t.me/"
```

Замените их на ссылки вашей компании, сайта, поддержки или документации.

## Размещение

Инструкция для Netlify лежит в `NETLIFY.md`. Для webhook используйте:

```text
https://ваш-сайт.netlify.app/.netlify/functions/telegram
```

Для безопасности задайте переменную:

```text
TELEGRAM_WEBHOOK_SECRET=длинная_случайная_строка
```

Серверная инструкция для VPS лежит в `DEPLOY.md`. В проект добавлены:

- `Dockerfile` - запуск через Docker.
- `Procfile` - запуск на платформах, которые поддерживают worker-процессы.
- `requirements.txt` - файл зависимостей, внешних библиотек нет.
