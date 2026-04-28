const BUSINESS_NAME = "Banzaron Neuro Bot";
const SITE_URL = "https://banzaronneuro.com/";
const INSTAGRAM_URL = "https://instagram.com/banzaron_neuro";
const CONTACT_URL = "https://t.me/Listmebiusa";
const BOOKING_URL = "https://banzaronneuro.com/";
const HELP_URL = "https://core.telegram.org/bots";

const SERVICES = [
  {
    title: "Нейропсихологическая диагностика",
    description:
      "Онлайн или офлайн. Полный разбор функционального профиля мозга ребенка: внимание, память, моторика, эмоциональная регуляция, обучаемость. Результат: письменный нейропрофиль, устный разбор и план действий. 60-90 минут.",
    price: "по записи",
  },
  {
    title: "Индивидуальная программа нейрокоррекции",
    description:
      "Персональные домашние протоколы и нейроупражнения на основе диагностики, плюс регулярное сопровождение родителей. Первые изменения обычно заметны через 2-4 недели при системной практике.",
    price: "после диагностики",
  },
  {
    title: "Консультация для родителей",
    description:
      "Онлайн-разбор конкретной ситуации: поведение, обучение, эмоции, гаджеты, переходные периоды. Вы уходите с пониманием причин и конкретным планом, а не с общими советами.",
    price: "по записи",
  },
];

const FAQ = [
  [
    "Это медицинская услуга?",
    "Нет. Banzaron Neuro работает в области нейропсихологии и нейрофизиологии развития. Это прикладное, не медицинское направление. Мы не ставим диагнозов, не назначаем лечения и не заменяем врача. Наша работа - развитие функций мозга и поведенческих стратегий на основе научных данных. При наличии медицинских показаний мы рекомендуем обратиться к профильному специалисту.",
  ],
  [
    "С какого возраста вы работаете?",
    "Оптимально с 4 лет: в этом возрасте уже можно объективно оценить внимание, моторику, эмоциональную регуляцию и обучаемость. До 4 лет рекомендуем консультацию для родителей по развитию, режиму и среде.",
  ],
  [
    "Онлайн-формат настолько же эффективен?",
    "Да. Диагностика и рекомендации адаптированы для дистанционного формата с участием родителя. Большинство семей из нашей практики работают онлайн без потери качества результата.",
  ],
  [
    "Сколько длится диагностика?",
    "Сессия длится 60-90 минут. После вы получаете письменный нейропрофиль и практические рекомендации. Устный разбор с родителем включен в стоимость.",
  ],
  [
    "Когда виден результат?",
    "При системной практике первые изменения заметны в течение 2-4 недель. Это не магия, а нейропластичность: мозг меняется через повторение. Мы сопровождаем процесс и корректируем программу по мере прогресса.",
  ],
  [
    "Вы работаете с детьми с диагнозами: СДВГ, РАС, задержки?",
    "Да, мы работаем с детьми с разным функциональным профилем. Наша работа развивающая, не лечебная. При наличии медицинского диагноза мы действуем в координации с лечащим врачом, а не вместо него.",
  ],
];

const QUIZ_QUESTIONS = [
  {
    question: "Ребенку сложно удерживать внимание на задании дольше 5-10 минут?",
    options: [
      { text: "Да, часто", points: 1 },
      { text: "Иногда", points: 0 },
      { text: "Нет", points: 0 },
    ],
  },
  {
    question: "Ребенок быстро устает от учебных задач, чтения или письма?",
    options: [
      { text: "Да, заметно", points: 1 },
      { text: "Иногда", points: 0 },
      { text: "Нет", points: 0 },
    ],
  },
  {
    question: "Есть резкие эмоциональные реакции: слезы, вспышки, сильное раздражение?",
    options: [
      { text: "Да, часто", points: 1 },
      { text: "Иногда", points: 0 },
      { text: "Редко", points: 0 },
    ],
  },
  {
    question: "Сложно переключаться между делами или спокойно завершать игру/мультики?",
    options: [
      { text: "Да", points: 1 },
      { text: "Иногда", points: 0 },
      { text: "Нет", points: 0 },
    ],
  },
  {
    question: "Есть неловкость в движениях, почерке, координации или мелкой моторике?",
    options: [
      { text: "Да", points: 1 },
      { text: "Немного", points: 0 },
      { text: "Нет", points: 0 },
    ],
  },
  {
    question: "Ребенку сложно запоминать инструкции из 2-3 шагов?",
    options: [
      { text: "Да", points: 1 },
      { text: "Иногда", points: 0 },
      { text: "Нет", points: 0 },
    ],
  },
  {
    question: "Обучение дается тяжелее, чем вы ожидали по возрасту ребенка?",
    options: [
      { text: "Да", points: 1 },
      { text: "В отдельных темах", points: 0 },
      { text: "Нет", points: 0 },
    ],
  },
  {
    question: "Есть сенсорные особенности: сильная реакция на звуки, одежду, еду, прикосновения?",
    options: [
      { text: "Да", points: 1 },
      { text: "Иногда", points: 0 },
      { text: "Нет", points: 0 },
    ],
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
      startText(),
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
      `Я вас услышал.\n\nЧтобы я помог точнее, выберите раздел в меню или отправьте заявку командой /request.`,
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
      requestInstructionText(),
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
      requestInstructionText(),
      mainMenu(),
    );
    return;
  }

  const adminChatId = process.env.ADMIN_CHAT_ID;
  const usernameLine = username ? `@${username}` : "username не указан";
  const adminText = `Новая заявка в ${BUSINESS_NAME}\n\nUser ID: ${userId}\nTelegram: ${usernameLine}\nСообщение: ${requestText}`;

  if (adminChatId) {
    await sendMessage(token, Number(adminChatId), adminText);
  }

  await sendMessage(
    token,
    chatId,
    "Спасибо. Заявка принята.\n\nМы свяжемся с вами и подскажем, какой формат лучше подойдет: диагностика, консультация или программа нейрокоррекции.",
    mainMenu(),
  );
}

async function sendQuizQuestion(token, chatId, index, score) {
  const question = QUIZ_QUESTIONS[index];
  await sendMessage(
    token,
    chatId,
    `Нейропрофиль ребенка за 3 минуты\n\nВопрос ${index + 1}/${QUIZ_QUESTIONS.length}\n${question.question}`,
    quizKeyboard(question.options, index, score),
  );
}

async function checkQuizAnswer(token, chatId, data) {
  const [, indexRaw, scoreRaw, pointsRaw] = data.split(":");
  const index = Number(indexRaw);
  const score = Number(scoreRaw);
  const points = Number(pointsRaw);
  const nextScore = score + points;
  const nextIndex = index + 1;

  if (nextIndex >= QUIZ_QUESTIONS.length) {
    await sendMessage(
      token,
      chatId,
      quizResultText(nextScore),
      mainMenu(),
    );
    return;
  }

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
        { text: "Нейропрофиль 3 мин", callback_data: "quiz_start" },
        { text: "Помощь", callback_data: "help" },
      ],
    ],
  };
}

function linksKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "Сайт", url: SITE_URL }],
      [{ text: "Instagram", url: INSTAGRAM_URL }],
      [{ text: "Написать в Telegram", url: CONTACT_URL }],
      [{ text: "Записаться на консультацию", url: BOOKING_URL }],
      [{ text: "Документация Bot API", url: HELP_URL }],
    ],
  };
}

function quizKeyboard(options, index, score) {
  return {
    inline_keyboard: options.map((option) => [
      { text: option.text, callback_data: `quiz:${index}:${score}:${option.points}` },
    ]),
  };
}

function startText() {
  return [
    "Вы в пространстве Banzaron Neuro - прикладной нейропсихологии для семьи.",
    "",
    "Здесь вы получите научно обоснованное понимание того, как развивается мозг вашего ребенка, и конкретные инструменты для работы с этим каждый день.",
    "",
    "Выберите, с чем пришли:",
    "- Диагностика развития",
    "- Консультация для родителей",
    "- Развитие и обучение",
    "",
    "Или начните с быстрого нейропрофиля: 3 минуты, конкретный результат.",
  ].join("\n");
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
    "/test - пройти нейропрофиль за 3 минуты",
    "/request - оставить заявку",
    "/help - помощь",
    "",
    "Для заявки отправьте: /request и данные по шаблону.",
  ].join("\n");
}

function requestInstructionText() {
  return [
    "Чтобы оставить заявку, отправьте одним сообщением после команды /request:",
    "",
    "1. Имя родителя",
    "2. Имя и возраст ребенка",
    "3. Основной запрос: что беспокоит и как давно",
    "4. Что уже пробовали: специалисты, методы, занятия",
    "5. Формат: онлайн, офлайн или не принципиально",
    "6. Удобное время для связи",
    "7. Контакт: WhatsApp или Telegram",
    "",
    "Пример:",
    "/request Анна. Ребенок Марк, 7 лет. Сложно удерживать внимание, быстро устает от письма, вспышки раздражения около года. Были у логопеда, делали занятия на моторику. Формат онлайн. Связь в будни после 18:00. Telegram @username.",
  ].join("\n");
}

function quizResultText(score) {
  if (score <= 2) {
    return [
      `Ваш результат: ${score} флаг(а) из ${QUIZ_QUESTIONS.length}.`,
      "",
      "Рекомендация: консультация для родителей.",
      "",
      "Сейчас важно спокойно разобрать ситуацию: что является возрастной нормой, что связано со средой и режимом, а где ребенку уже нужна поддержка. Консультация поможет понять причины и получить конкретный план действий.",
      "",
      "Чтобы записаться, нажмите «Оставить заявку» или отправьте /request.",
    ].join("\n");
  }

  if (score <= 4) {
    return [
      `Ваш результат: ${score} флага из ${QUIZ_QUESTIONS.length}.`,
      "",
      "Рекомендация: нейропсихологическая диагностика.",
      "",
      "Есть несколько устойчивых сигналов по вниманию, регуляции, моторике или обучению. Диагностика поможет увидеть функциональный профиль ребенка и понять, какие упражнения и изменения в быту дадут результат.",
      "",
      "Чтобы записаться, нажмите «Оставить заявку» или отправьте /request.",
    ].join("\n");
  }

  return [
    `Ваш результат: ${score} флагов из ${QUIZ_QUESTIONS.length}.`,
    "",
    "Рекомендация: диагностика в приоритетном порядке.",
    "",
    "Сигналов достаточно много, и лучше не гадать по отдельным симптомам. Нужен целостный разбор: внимание, эмоциональная регуляция, моторика, память, обучаемость и сенсорные особенности.",
    "",
    "Это не диагноз и не повод пугаться. Это повод понять, как именно помочь ребенку системно.",
    "",
    "Чтобы записаться, нажмите «Оставить заявку» или отправьте /request.",
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
