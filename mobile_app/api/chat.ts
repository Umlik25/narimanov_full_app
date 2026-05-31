const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "meta/llama-3.1-8b-instruct";

const rolePrompts = {
  user: [
    "You are City Grind's helpful mobile assistant for residents of Narimanov district in Baku.",
    "Help users report city issues, understand report statuses, points-based rewards, and expected resolution times.",
    "Keep answers concise, practical, and friendly. Do not claim access to live backend data.",
  ].join(" "),
  admin: [
    "You are City Grind's operations assistant for Narimanov district administrators in Baku.",
    "Help summarize demo district issues, prioritize urgent reports, explain AI detections, and suggest operational next steps.",
    "Keep answers concise, practical, and presentation-ready. Do not claim access to live backend data.",
  ].join(" "),
};

function localChatReply(message: string) {
  const isRussian = /[а-яё]/i.test(message);

  if (/(not responding|не отвеч|не работает|doesn.?t answer|туп|wait|жду|ответь)/i.test(message)) {
    return isRussian
      ? "Ты прав, я отвечал слишком шаблонно. Сейчас я работаю в резервном режиме без внешнего AI-ключа, но все равно могу помогать по приложению: оформить репорт, объяснить статусы, GPS, rewards и подсказать текст title/description. Напиши, что именно случилось, и я помогу сформулировать заявку."
      : "You are right, I was replying too generically. I am currently running in fallback mode without the external AI key, but I can still help with reports, statuses, GPS, rewards, and writing a clear title or description. Tell me what happened, and I will help you turn it into a useful report.";
  }

  if (/(status|статус|active|closed|resolved|закрыт|актив|my reports|мои|отчет)/i.test(message)) {
    return isRussian
      ? "В My Reports есть три фильтра: Active показывает открытые заявки, All показывает все, Closed показывает закрытые или отклоненные. По умолчанию открыт Active, а новые заявки идут сверху."
      : "Open My Reports to track your reports. Active shows open work first, All shows every report, and Closed shows resolved or rejected reports. New reports appear first.";
  }

  if (/(report|репорт|жалоб|заявк|problem|issue)/i.test(message)) {
    return isRussian
      ? [
        "Чтобы создать заявку, нажми круглую кнопку сканера на карте, сделай фото, затем выбери категорию и добавь название с описанием. GPS берется автоматически с устройства.",
        "Хорошая заявка: короткий title, что именно сломано, насколько срочно, и что видно на фото.",
      ].join("\n\n")
      : [
        "To submit a report, tap the scanner button on the map, take a photo, then add the category, title, description, and GPS location.",
        "A strong report should include what happened, exactly where it is, and why it needs attention.",
      ].join("\n\n");
  }

  if (/(reward|coupon|балл|купон|награ)/i.test(message)) {
    return isRussian
      ? "За принятые заявки начисляются баллы. Их можно тратить в Rewards на доступные награды."
      : "Accepted reports earn points. You can spend them directly in Rewards on available rewards.";
  }

  if (/(gps|location|гео|локац|координат)/i.test(message)) {
    return isRussian
      ? "GPS берется автоматически с устройства. На телефоне открывай HTTPS tunnel link и разреши доступ к геолокации, когда браузер спросит."
      : "GPS is captured automatically from the device. On mobile, use the HTTPS tunnel link and allow location access when the browser asks.";
  }

  if (/(hello|hi|salam|привет|здрав)/i.test(message)) {
    return isRussian
      ? "Привет. Я могу помочь оформить городскую заявку, объяснить статусы, GPS, points и подсказать хороший title/description."
      : "Hi. I can help you create a clear city issue report, understand report statuses, and explain points rewards.";
  }

  if (message.trim().length > 2) {
    return isRussian
      ? `Понял: "${message}". Я могу помочь превратить это в заявку. Например:\n\nTitle: коротко назови проблему\nDescription: что произошло, где именно, насколько срочно, есть ли опасность для людей\n\nНапиши категорию или пришли больше деталей, и я помогу сформулировать текст.`
      : `Got it: "${message}". I can help turn this into a report.\n\nTitle: name the issue briefly\nDescription: explain what happened, where it is, how urgent it is, and whether it creates risk for people\n\nSend the category or more details, and I will help write the final text.`;
  }

  return isRussian
    ? "Я могу помочь с заявками, статусами, GPS, points и формулировкой title/description. Напиши, что произошло."
    : "I can help with city reports, statuses, GPS, points, and writing a clear title or description. Tell me what happened.";
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.NVIDIA_API_KEY;

  try {
    const { message, role = "user", history = [] } = req.body || {};
    const cleanMessage = typeof message === "string" ? message.trim() : "";

    if (!cleanMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!apiKey) {
      return res.status(200).json({ reply: localChatReply(cleanMessage), mode: "local" });
    }

    const normalizedRole = role === "admin" ? "admin" : "user";
    const recentHistory = Array.isArray(history) ? history.slice(-8) : [];

    const messages = [
      { role: "system", content: rolePrompts[normalizedRole] },
      ...recentHistory
        .filter((item: any) => item && typeof item.text === "string")
        .map((item: any) => ({
          role: item.type === "user" ? "user" : "assistant",
          content: item.text,
        })),
      { role: "user", content: cleanMessage },
    ];

    const aiResponse = await fetch(NVIDIA_CHAT_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 512,
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      return res.status(200).json({ reply: localChatReply(cleanMessage), mode: "local" });
    }

    const data = await aiResponse.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(200).json({ reply: localChatReply(cleanMessage), mode: "local" });
    }

    return res.status(200).json({ reply, mode: "ai" });
  } catch (error) {
    return res.status(200).json({ reply: localChatReply(""), mode: "local" });
  }
}
