# Размещение Telegram-бота на Netlify

Netlify не подходит для постоянного Python-процесса с long polling. Поэтому для Netlify в проект добавлена отдельная webhook-версия бота:

```text
netlify/functions/telegram.mjs
```

После публикации Telegram будет отправлять сообщения на адрес:

```text
https://ваш-сайт.netlify.app/telegram
```

## 1. Подготовьте проект

Файлы для Netlify уже добавлены:

- `netlify/functions/telegram.mjs` - код бота для Netlify.
- `netlify.toml` - настройки сборки.
- `public/index.html` - простая страница-заглушка.

## 2. Загрузите проект в GitHub

Создайте новый репозиторий на GitHub и загрузите туда эту папку проекта.

Если Git еще не настроен:

```bash
git init
git add .
git commit -m "Add Telegram bot for Netlify"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/ВАШ_РЕПОЗИТОРИЙ.git
git push -u origin main
```

## 3. Создайте сайт в Netlify

1. Откройте Netlify.
2. Нажмите **Add new project**.
3. Выберите **Import an existing project**.
4. Подключите GitHub.
5. Выберите репозиторий с ботом.
6. Netlify сам прочитает `netlify.toml`.
7. Нажмите **Deploy**.

## 4. Добавьте переменные окружения

В Netlify откройте:

```text
Site configuration -> Environment variables
```

Добавьте:

```text
TELEGRAM_BOT_TOKEN=токен_от_BotFather
ADMIN_CHAT_ID=ваш_telegram_id
```

`ADMIN_CHAT_ID` нужен, чтобы заявки приходили вам в Telegram. Если пока не знаете ID, можно добавить позже.

После добавления переменных сделайте новый deploy:

```text
Deploys -> Trigger deploy -> Deploy site
```

## 5. Проверьте адрес webhook

Откройте в браузере:

```text
https://ваш-сайт.netlify.app/telegram
```

Должен появиться текст:

```text
Telegram bot webhook is ready.
```

## 6. Подключите webhook в Telegram

Откройте в браузере ссылку, заменив токен и домен:

```text
https://api.telegram.org/botВАШ_ТОКЕН/setWebhook?url=https://ваш-сайт.netlify.app/telegram
```

Если все хорошо, Telegram вернет:

```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

## 7. Остановите локальный polling-бот

Если у вас еще запущен локальный `python telegram_bot.py`, остановите его. После подключения webhook бот должен работать через Netlify.

## 8. Проверьте в Telegram

Откройте своего бота и отправьте:

```text
/start
```

Потом проверьте:

```text
/services
/faq
/links
/test
/request Анна, @anna, нужен бот для записи клиентов
```

## Где менять тексты

Для Netlify-версии тексты меняются в файле:

```text
netlify/functions/telegram.mjs
```

В начале файла находятся:

- `BUSINESS_NAME`
- `SITE_URL`
- `PORTFOLIO_URL`
- `CONTACT_URL`
- `SERVICES`
- `FAQ`
- `QUIZ_QUESTIONS`
