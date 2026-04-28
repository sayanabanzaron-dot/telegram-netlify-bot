const BUSINESS_NAME = "Рабочий бот";
const SITE_URL = "https://example.com/";
const PORTFOLIO_URL = "https://github.com/";
const CONTACT_URL = "https://t.me/";
const HELP_URL = "https://core.telegram.org/bots";

const SERVICES = [
  {
    title: "Консультация",
    description: "Разберем задачу, подберем формат работы и следующий шаг.",
    price: "от 0 руб.",
  },
  {
    title: "Разработка Telegram-бота",
    description: "Меню, заявки, тесты, ссылки, уведомления и запуск.",
    price: "по задаче",
  },
  {
    title: "Автоматизация",
    description: "Свяжем Telegram с таблицами, CRM, формами или внутренними процессами.",
    price: "по задаче",
  },
];

const FAQ = [
  [
    "Как оставить заявку?",
    "Отправьте команду /request и текст заявки одним сообщением. Например: /request Анна, @anna, нужен бот для записи клиентов.",
  ],
  [
    "Сколько занимает запуск?",
    "Простой бот можно запустить за один день. Сложные сценарии зависят от интеграций.",
  ],
  [
    "Можно ли поменять тексты?",
    "Да. Все тексты лежат в netlify/functions/telegram.js и легко редактируются.",
  ],
];

const QUIZ_QUESTIONS = [
  {
    question: "Что нужно боту для запуска?",
    options: ["Токен", "Пароль от аккаунта", "Номер карты"],
    answer: "Токен",
  },
  {
    question: "Где создают Telegram-ботов?",
    options: ["BotFather", "Settings", "Saved Messages"],
    answer: "BotFather",
  },
  {
    question: "Какая команда показывает полезные ссылки?",
    options: ["/links", "/sleep", "/delete"],
    answer: "/links",
  },
];

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return text("Telegram bot webhook is ready.");
  }

  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secretToken && event.headers["x-telegram-bot-api-secret-token"] !== secretToken) {
    return json({ ok: false, error: "Forbidden" }, 403);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return json({ ok: false, error: "TELEGRAM_BOT_TOKEN is missing" }, 500);
  }

  try {
    const update = JSON.parse(event.body || "{}");
    await handleUpdate(update, token);
  } catch (error) {
    console.error("Webhook handling failed", error);
  }

  return json({ ok: true });
};

async function handleUpdate(update, token) {
  if (update.message) {
    const message = update.message;
    const chatId = message.chat.id;
    const userId = message.from?.id ?? chatId;
    const username = message.from?.username ?? "";
    const textValue = (message.text ?? "").trim();
    await handleMessage(token, chatId, userId, textValue, username);
    return;
  }

  if (update.callback_query) {
    const callback = update.callback_query;
    const chatId = callback.message.chat.id;
    const data = callback.data ?? "";
    await telegramApi(token, "answerCallbackQuery", { callback_query_id: callback.id });
    await handleCallback(token, chatId, data);
  }
}

async function handleMessage(token, chatId, userId, textValue, username) {
  const [command, ...rest] = textValue.split(/\s+/);
  const normalized = (command ?? "").toLowerCase();
  const requestText = rest.join(" ").trim();

  if (normalized === "/start") {
    await sendMessage(
      token,
      chatId,
      `Привет! Это ${BUSINESS_NAME}.\n\nЗдесь можно посмотреть услуги, пройти короткий тест, открыть полезные ссылки или оставить заявку.\n\nВыберите действие:`,
      mainMenu(),
    );
  } else if (normalized === "/help") {
    await sendMessage(token, chatId, helpText(), mainMenu());
  } else if (normalized === "/services") {
    await sendMessage(token, chatId, servicesText(), mainMenu());
  } else if (normalized === "/faq") {
    await sendMessage(token, chatId, faqText(), mainMenu());
  } else if (normalized === "/links") {
    await sendMessage(token, chatId, "Полезные ссылки:", linksKeyboard());
  } else if (normalized === "/test") {
    await sendQuizQuestion(token, chatId, 0, 0);
  } else if (normalized === "/request") {
    await handleRequestCommand(token, chatId, userId, username, requestText);
  } else if (textValue) {
    await sendMessage(
      token,
      chatId,
      `Вы написали: ${textValue}\n\nКоманды: /start, /services, /faq, /links, /test, /request`,
      mainMenu(),
    );
  } else {
    await sendMessage(token, chatId, "Отправьте текст или команду /start.", mainMenu());
  }
}

async function handleCallback(token, chatId, data) {
  if (data === "help") {
    await sendMessage(token, chatId, helpText(), mainMenu());
  } else if (data === "services") {
    await sendMessage(token, chatId, servicesText(), mainMenu());
  } else if (data === "faq") {
    await sendMessage(token, chatId, faqText(), mainMenu());
  } else if (data === "links") {
    await sendMessage(token, chatId, "Полезные ссылки:", linksKeyboard());
  } else if (data === "request") {
    await sendMessage(
      token,
      chatId,
      "Чтобы оставить заявку, отправьте одним сообщением:\n\n/request Имя, контакт, что нужно сделать\n\nНапример: /request Анна, @anna, нужен бот для записи клиентов.",
      mainMenu(),
    );
  } else if (data === "quiz_start") {
    await sendQuizQuestion(token, chatId, 0, 0);
  } else if (data.startsWith("quiz:")) {
    await checkQuizAnswer(token, chatId, data);
  } else {
    await sendMessage(token, chatId, "Неизвестное действие. Откройте меню:", mainMenu());
  }
}

async function handleRequestCommand(token, chatId, userId, username, requestText) {
  if (!requestText) {
    await sendMessage(
      token,
      chatId,
      "Отправьте заявку так:\n\n/request Имя, контакт, что нужно сделать\n\nНапример: /request Анна, @anna, нужен бот для записи клиентов.",
      mainMenu(),
    );
    return;
  }

  const adminChatId = process.env.ADMIN_CHAT_ID;
  const usernameLine = username ? `@${username}` : "username не указан";
  const adminText = `Новая заявка из Telegram-бота\n\nUser ID: ${userId}\nTelegram: ${usernameLine}\nСообщение: ${requestText}`;

  if (adminChatId) {
    await sendMessage(token, Number(adminChatId), adminText);
  }

  await sendMessage(
    token,
    chatId,
    "Спасибо! Заявка принята. Мы свяжемся с вами в ближайшее время.",
    mainMenu(),
  );
}

async function sendQuizQuestion(token, chatId, index, score) {
  const question = QUIZ_QUESTIONS[index];
  await sendMessage(
    token,
    chatId,
    `Вопрос ${index + 1}/${QUIZ_QUESTIONS.length}\n${question.question}`,
    quizKeyboard(question.options, index, score),
  );
}

async function checkQuizAnswer(token, chatId, data) {
  const [, indexRaw, scoreRaw, answer] = data.split(":");
  const index = Number(indexRaw);
  const score = Number(scoreRaw);
  const question = QUIZ_QUESTIONS[index];
  const nextScore = answer === question.answer ? score + 1 : score;
  const resultLine =
    answer === question.answer ? "Верно." : `Неверно. Правильный ответ: ${question.answer}.`;
  const nextIndex = index + 1;

  if (nextIndex >= QUIZ_QUESTIONS.length) {
    await sendMessage(
      token,
      chatId,
      `${resultLine}\n\nТест завершен: ${nextScore}/${QUIZ_QUESTIONS.length}.`,
      mainMenu(),
    );
    return;
  }

  await sendMessage(token, chatId, resultLine);
  await sendQuizQuestion(token, chatId, nextIndex, nextScore);
}

function mainMenu() {
  return {
    inline_keyboard: [
      [
        { text: "Услуги", callback_data: "services" },
        { text: "Оставить заявку", callback_data: "request" },
      ],
      [
        { text: "FAQ", callback_data: "faq" },
        { text: "Ссылки", callback_data: "links" },
      ],
      [
        { text: "Пройти тест", callback_data: "quiz_start" },
        { text: "Помощь", callback_data: "help" },
      ],
    ],
  };
}

function linksKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "Сайт", url: SITE_URL }],
      [{ text: "Портфолио", url: PORTFOLIO_URL }],
      [{ text: "Написать в Telegram", url: CONTACT_URL }],
      [{ text: "Документация Bot API", url: HELP_URL }],
    ],
  };
}

function quizKeyboard(options, index, score) {
  return {
    inline_keyboard: options.map((option) => [
      { text: option, callback_data: `quiz:${index}:${score}:${option}` },
    ]),
  };
}

function servicesText() {
  return [
    "Услуги:",
    ...SERVICES.map(
      (service, index) =>
        `\n${index + 1}. ${service.title}\n${service.description}\nСтоимость: ${service.price}`,
    ),
  ].join("\n");
}

function faqText() {
  return ["Частые вопросы:", ...FAQ.map(([question, answer]) => `\n${question}\n${answer}`)].join(
    "\n",
  );
}

function helpText() {
  return [
    "Команды:",
    "/start - открыть меню",
    "/services - услуги",
    "/faq - ответы на вопросы",
    "/links - показать ссылки",
    "/test - пройти встроенный тест",
    "/request - оставить заявку",
    "/help - помощь",
    "",
    "Для заявки отправьте: /request Имя, контакт, что нужно сделать",
  ].join("\n");
}

async function sendMessage(token, chatId, messageText, replyMarkup) {
  const payload = { chat_id: chatId, text: messageText };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  return telegramApi(token, "sendMessage", payload);
}

async function telegramApi(token, method, payload) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function json(payload, statusCode = 200) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}

function text(body, statusCode = 200) {
  return {
    statusCode,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body,
  };
}
