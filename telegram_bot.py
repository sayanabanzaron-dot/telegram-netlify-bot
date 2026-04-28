#!/usr/bin/env python3
"""Telegram bot with menu, links, quiz, FAQ, and lead collection.

Run:
    TELEGRAM_BOT_TOKEN=123:abc ADMIN_CHAT_ID=123456 python telegram_bot.py
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from typing import Any, Callable


BUSINESS_NAME = "Рабочий бот"
SITE_URL = "https://example.com/"
PORTFOLIO_URL = "https://github.com/"
CONTACT_URL = "https://t.me/"
HELP_URL = "https://core.telegram.org/bots"

SERVICES = [
    {
        "title": "Консультация",
        "description": "Разберем задачу, подберем формат работы и следующий шаг.",
        "price": "от 0 ₽",
    },
    {
        "title": "Разработка Telegram-бота",
        "description": "Меню, заявки, тесты, ссылки, уведомления и запуск.",
        "price": "по задаче",
    },
    {
        "title": "Автоматизация",
        "description": "Свяжем Telegram с таблицами, CRM, формами или внутренними процессами.",
        "price": "по задаче",
    },
]

FAQ = [
    (
        "Как оставить заявку?",
        "Нажмите «Оставить заявку» и отправьте имя, контакт и короткое описание задачи.",
    ),
    (
        "Сколько занимает запуск?",
        "Простой бот можно запустить за один день. Сложные сценарии зависят от интеграций.",
    ),
    (
        "Можно ли поменять тексты?",
        "Да. Все тексты лежат в начале файла telegram_bot.py и легко редактируются.",
    ),
]

QUIZ_QUESTIONS = [
    {
        "question": "Что нужно боту для запуска?",
        "options": ["Токен", "Пароль от аккаунта", "Номер карты"],
        "answer": "Токен",
    },
    {
        "question": "Где создают Telegram-ботов?",
        "options": ["BotFather", "Settings", "Saved Messages"],
        "answer": "BotFather",
    },
    {
        "question": "Какая команда показывает полезные ссылки?",
        "options": ["/links", "/sleep", "/delete"],
        "answer": "/links",
    },
]


@dataclass
class UserState:
    quiz_index: int = 0
    score: int = 0
    in_quiz: bool = False
    awaiting_request: bool = False


@dataclass
class BotApp:
    token: str
    admin_chat_id: int | None = None
    request: Callable[[str, dict[str, Any]], dict[str, Any]] | None = None
    states: dict[int, UserState] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.api_url = f"https://api.telegram.org/bot{self.token}"
        if self.request is None:
            self.request = self._request

    def _request(self, method: str, payload: dict[str, Any]) -> dict[str, Any]:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            f"{self.api_url}/{method}",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=35) as response:
            return json.loads(response.read().decode("utf-8"))

    def send_message(
        self,
        chat_id: int,
        text: str,
        reply_markup: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {"chat_id": chat_id, "text": text}
        if reply_markup:
            payload["reply_markup"] = reply_markup
        return self.request("sendMessage", payload)  # type: ignore[misc]

    def answer_callback_query(self, callback_query_id: str, text: str = "") -> None:
        self.request(  # type: ignore[misc]
            "answerCallbackQuery",
            {"callback_query_id": callback_query_id, "text": text},
        )

    def get_updates(self, offset: int | None) -> list[dict[str, Any]]:
        payload: dict[str, Any] = {"timeout": 30, "allowed_updates": ["message", "callback_query"]}
        if offset is not None:
            payload["offset"] = offset
        response = self.request("getUpdates", payload)  # type: ignore[misc]
        return response.get("result", [])

    def handle_update(self, update: dict[str, Any]) -> None:
        if "message" in update:
            message = update["message"]
            chat_id = message["chat"]["id"]
            user_id = message.get("from", {}).get("id", chat_id)
            text = (message.get("text") or "").strip()
            username = message.get("from", {}).get("username", "")
            self.handle_message(chat_id, user_id, text, username=username)
            return

        if "callback_query" in update:
            callback = update["callback_query"]
            chat_id = callback["message"]["chat"]["id"]
            user_id = callback.get("from", {}).get("id", chat_id)
            data = callback.get("data", "")
            self.answer_callback_query(callback["id"])
            self.handle_callback(chat_id, user_id, data)

    def handle_message(self, chat_id: int, user_id: int, text: str, username: str = "") -> None:
        command = text.split()[0].lower() if text else ""

        if command == "/start":
            self.send_message(
                chat_id,
                f"Привет! Это {BUSINESS_NAME}.\n\n"
                "Здесь можно посмотреть услуги, пройти короткий тест, открыть полезные ссылки "
                "или оставить заявку.\n\n"
                "Выберите действие:",
                main_menu(),
            )
        elif command == "/cancel":
            self.states[user_id] = UserState()
            self.send_message(chat_id, "Действие отменено. Откройте меню:", main_menu())
        elif command == "/help":
            self.send_message(chat_id, help_text(), main_menu())
        elif command == "/links":
            self.send_message(chat_id, "Полезные ссылки:", links_keyboard())
        elif command == "/services":
            self.send_message(chat_id, services_text(), main_menu())
        elif command == "/faq":
            self.send_message(chat_id, faq_text(), main_menu())
        elif command == "/request":
            self.start_request(chat_id, user_id)
        elif command == "/test":
            self.start_quiz(chat_id, user_id)
        elif self.states.get(user_id, UserState()).awaiting_request:
            self.save_request(chat_id, user_id, text, username)
        elif text:
            self.send_message(
                chat_id,
                f"Вы написали: {text}\n\nКоманды: /start, /services, /faq, /links, /test, /request",
                main_menu(),
            )
        else:
            self.send_message(chat_id, "Отправьте текст или команду /start.", main_menu())

    def handle_callback(self, chat_id: int, user_id: int, data: str) -> None:
        if data == "help":
            self.send_message(chat_id, help_text(), main_menu())
        elif data == "links":
            self.send_message(chat_id, "Полезные ссылки:", links_keyboard())
        elif data == "services":
            self.send_message(chat_id, services_text(), main_menu())
        elif data == "faq":
            self.send_message(chat_id, faq_text(), main_menu())
        elif data == "request":
            self.start_request(chat_id, user_id)
        elif data == "quiz_start":
            self.start_quiz(chat_id, user_id)
        elif data.startswith("quiz_answer:"):
            self.check_quiz_answer(chat_id, user_id, data.removeprefix("quiz_answer:"))
        else:
            self.send_message(chat_id, "Неизвестное действие. Откройте меню:", main_menu())

    def start_request(self, chat_id: int, user_id: int) -> None:
        self.states[user_id] = UserState(awaiting_request=True)
        self.send_message(
            chat_id,
            "Напишите заявку одним сообщением:\n\n"
            "1. Имя\n"
            "2. Контакт для связи\n"
            "3. Что нужно сделать\n\n"
            "Например: Анна, @anna, нужен бот для записи клиентов.\n\n"
            "Чтобы отменить, отправьте /cancel.",
        )

    def save_request(self, chat_id: int, user_id: int, text: str, username: str = "") -> None:
        if not text:
            self.send_message(chat_id, "Пожалуйста, отправьте заявку текстом или нажмите /cancel.")
            return

        self.states[user_id] = UserState()
        username_line = f"@{username}" if username else "username не указан"
        admin_text = (
            "Новая заявка из Telegram-бота\n\n"
            f"User ID: {user_id}\n"
            f"Telegram: {username_line}\n"
            f"Сообщение: {text}"
        )

        if self.admin_chat_id:
            self.send_message(self.admin_chat_id, admin_text)

        self.send_message(
            chat_id,
            "Спасибо! Заявка принята. Мы свяжемся с вами в ближайшее время.",
            main_menu(),
        )

    def start_quiz(self, chat_id: int, user_id: int) -> None:
        self.states[user_id] = UserState(in_quiz=True)
        self.send_quiz_question(chat_id, user_id)

    def send_quiz_question(self, chat_id: int, user_id: int) -> None:
        state = self.states[user_id]
        question = QUIZ_QUESTIONS[state.quiz_index]
        self.send_message(
            chat_id,
            f"Вопрос {state.quiz_index + 1}/{len(QUIZ_QUESTIONS)}\n{question['question']}",
            quiz_keyboard(question["options"]),
        )

    def check_quiz_answer(self, chat_id: int, user_id: int, answer: str) -> None:
        state = self.states.get(user_id)
        if not state or not state.in_quiz:
            self.send_message(chat_id, "Тест еще не начат. Нажмите /test.", main_menu())
            return

        question = QUIZ_QUESTIONS[state.quiz_index]
        if answer == question["answer"]:
            state.score += 1
            result_line = "Верно."
        else:
            result_line = f"Неверно. Правильный ответ: {question['answer']}."

        state.quiz_index += 1
        if state.quiz_index >= len(QUIZ_QUESTIONS):
            score = state.score
            total = len(QUIZ_QUESTIONS)
            self.states[user_id] = UserState()
            self.send_message(chat_id, f"{result_line}\n\nТест завершен: {score}/{total}.", main_menu())
            return

        self.send_message(chat_id, result_line)
        self.send_quiz_question(chat_id, user_id)

    def run_forever(self) -> None:
        print("Bot is running. Press Ctrl+C to stop.")
        offset: int | None = None
        while True:
            try:
                updates = self.get_updates(offset)
                for update in updates:
                    offset = update["update_id"] + 1
                    self.handle_update(update)
            except (urllib.error.URLError, TimeoutError) as error:
                print(f"Network error: {error}. Retrying in 3 seconds.", file=sys.stderr)
                time.sleep(3)


def main_menu() -> dict[str, Any]:
    return {
        "inline_keyboard": [
            [
                {"text": "Услуги", "callback_data": "services"},
                {"text": "Оставить заявку", "callback_data": "request"},
            ],
            [
                {"text": "FAQ", "callback_data": "faq"},
                {"text": "Ссылки", "callback_data": "links"},
            ],
            [
                {"text": "Пройти тест", "callback_data": "quiz_start"},
                {"text": "Помощь", "callback_data": "help"},
            ],
        ]
    }


def links_keyboard() -> dict[str, Any]:
    return {
        "inline_keyboard": [
            [{"text": "Сайт", "url": SITE_URL}],
            [{"text": "Портфолио", "url": PORTFOLIO_URL}],
            [{"text": "Написать в Telegram", "url": CONTACT_URL}],
            [{"text": "Документация Bot API", "url": HELP_URL}],
            [{"text": "Назад в меню", "callback_data": "help"}],
        ]
    }


def quiz_keyboard(options: list[str]) -> dict[str, Any]:
    return {
        "inline_keyboard": [
            [{"text": option, "callback_data": f"quiz_answer:{option}"}] for option in options
        ]
    }


def help_text() -> str:
    return (
        "Команды:\n"
        "/start - открыть меню\n"
        "/services - услуги\n"
        "/faq - ответы на вопросы\n"
        "/links - показать ссылки\n"
        "/test - пройти встроенный тест\n"
        "/request - оставить заявку\n"
        "/cancel - отменить текущее действие\n"
        "/help - помощь\n\n"
        "Если заявка включена, бот отправит ее администратору."
    )


def services_text() -> str:
    lines = ["Услуги:"]
    for index, service in enumerate(SERVICES, start=1):
        lines.append(
            f"\n{index}. {service['title']}\n"
            f"{service['description']}\n"
            f"Стоимость: {service['price']}"
        )
    return "\n".join(lines)


def faq_text() -> str:
    lines = ["Частые вопросы:"]
    for question, answer in FAQ:
        lines.append(f"\n{question}\n{answer}")
    return "\n".join(lines)


def load_token() -> str:
    token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    if not token:
        raise SystemExit(
            "Не найден TELEGRAM_BOT_TOKEN. Создайте бота через @BotFather и запустите так:\n"
            "TELEGRAM_BOT_TOKEN=123:abc python telegram_bot.py"
        )
    return token


def load_admin_chat_id() -> int | None:
    value = os.getenv("ADMIN_CHAT_ID", "").strip()
    if not value:
        return None
    try:
        return int(value)
    except ValueError as error:
        raise SystemExit("ADMIN_CHAT_ID должен быть числом.") from error


if __name__ == "__main__":
    BotApp(load_token(), admin_chat_id=load_admin_chat_id()).run_forever()
