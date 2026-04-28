import unittest

from telegram_bot import BotApp, QUIZ_QUESTIONS, links_keyboard, main_menu, quiz_keyboard


class FakeTelegram:
    def __init__(self):
        self.calls = []

    def __call__(self, method, payload):
        self.calls.append((method, payload))
        return {"ok": True, "result": []}


class BotAppTest(unittest.TestCase):
    def setUp(self):
        self.fake = FakeTelegram()
        self.bot = BotApp("test-token", request=self.fake)

    def last_message(self):
        method, payload = self.fake.calls[-1]
        self.assertEqual(method, "sendMessage")
        return payload

    def test_start_sends_main_menu(self):
        self.bot.handle_message(chat_id=10, user_id=20, text="/start")

        payload = self.last_message()
        self.assertIn("Выберите действие", payload["text"])
        self.assertEqual(payload["reply_markup"], main_menu())

    def test_links_keyboard_contains_urls(self):
        keyboard = links_keyboard()

        rows = keyboard["inline_keyboard"]
        urls = [row[0]["url"] for row in rows if "url" in row[0]]
        self.assertIn("https://core.telegram.org/bots", urls)
        self.assertIn("https://t.me/", urls)

    def test_quiz_starts_with_first_question(self):
        self.bot.handle_message(chat_id=10, user_id=20, text="/test")

        payload = self.last_message()
        self.assertIn(QUIZ_QUESTIONS[0]["question"], payload["text"])
        self.assertEqual(payload["reply_markup"], quiz_keyboard(QUIZ_QUESTIONS[0]["options"]))

    def test_quiz_counts_correct_answers(self):
        self.bot.handle_message(chat_id=10, user_id=20, text="/test")

        for question in QUIZ_QUESTIONS:
            self.bot.handle_callback(
                chat_id=10,
                user_id=20,
                data=f"quiz_answer:{question['answer']}",
            )

        payload = self.last_message()
        self.assertIn(f"{len(QUIZ_QUESTIONS)}/{len(QUIZ_QUESTIONS)}", payload["text"])
        self.assertEqual(payload["reply_markup"], main_menu())

    def test_unknown_text_echoes_message(self):
        self.bot.handle_message(chat_id=10, user_id=20, text="hello")

        payload = self.last_message()
        self.assertIn("Вы написали: hello", payload["text"])

    def test_services_command_sends_services(self):
        self.bot.handle_message(chat_id=10, user_id=20, text="/services")

        payload = self.last_message()
        self.assertIn("Услуги", payload["text"])
        self.assertIn("Разработка Telegram-бота", payload["text"])

    def test_request_flow_notifies_admin(self):
        bot = BotApp("test-token", admin_chat_id=99, request=self.fake)

        bot.handle_message(chat_id=10, user_id=20, text="/request")
        bot.handle_message(
            chat_id=10,
            user_id=20,
            text="Анна, @anna, нужен бот для записи",
            username="anna",
        )

        admin_call = self.fake.calls[-2]
        user_call = self.fake.calls[-1]
        self.assertEqual(admin_call[1]["chat_id"], 99)
        self.assertIn("Новая заявка", admin_call[1]["text"])
        self.assertEqual(user_call[1]["chat_id"], 10)
        self.assertIn("Заявка принята", user_call[1]["text"])


if __name__ == "__main__":
    unittest.main()
