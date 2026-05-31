import { defineConfig } from 'vite'
import path from 'path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const NVIDIA_CHAT_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'
const AI_MODEL = 'meta/llama-3.1-8b-instruct'

type ChatMessage = {
  text?: string
  type?: 'user' | 'ai'
}

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function localChatReply(message: string) {
  const isRussian = /[а-яё]/i.test(message)

  if (/(not responding|не отвеч|не работает|doesn.?t answer|туп|wait|жду|ответь)/i.test(message)) {
    return isRussian
      ? 'Ты прав, я отвечал слишком шаблонно. Сейчас я работаю в резервном режиме без внешнего AI-ключа, но все равно могу помогать по приложению: оформить репорт, объяснить статусы, GPS, rewards и подсказать текст title/description. Напиши, что именно случилось, и я помогу сформулировать заявку.'
      : 'You are right, I was replying too generically. I am currently running in fallback mode without the external AI key, but I can still help with reports, statuses, GPS, rewards, and writing a clear title or description. Tell me what happened, and I will help you turn it into a useful report.'
  }

  if (/(status|статус|active|closed|resolved|закрыт|актив|my reports|мои|отчет)/i.test(message)) {
    return isRussian
      ? 'В My Reports есть три фильтра: Active показывает открытые заявки, All показывает все, Closed показывает закрытые или отклоненные. По умолчанию открыт Active, а новые заявки идут сверху.'
      : 'Open My Reports to track your reports. Active shows open work first, All shows every report, and Closed shows resolved or rejected reports. New reports appear first.'
  }

  if (/(report|репорт|жалоб|заявк|problem|issue|problem)/i.test(message)) {
    return isRussian
      ? [
        'Чтобы создать заявку, нажми круглую кнопку сканера на карте, сделай фото, затем выбери категорию и добавь название с описанием. GPS берется автоматически с устройства.',
        'Хорошая заявка: короткий title, что именно сломано, насколько срочно, и что видно на фото.',
      ].join('\n\n')
      : [
        'To submit a report, tap the scanner button on the map, take a photo, then add the category, title, description, and GPS location.',
        'A strong report should include what happened, exactly where it is, and why it needs attention.',
      ].join('\n\n')
  }

  if (/(reward|coupon|балл|купон|награ)/i.test(message)) {
    return isRussian
      ? 'За принятые заявки начисляются баллы. Каждые 100 баллов превращаются в 1 купон, а купоны можно тратить в Rewards.'
      : 'Accepted reports earn points. Every 100 points becomes 1 coupon, and coupons can be redeemed in the Rewards screen.'
  }

  if (/(gps|location|гео|локац|координат)/i.test(message)) {
    return isRussian
      ? 'GPS берется автоматически с устройства. На телефоне открывай HTTPS tunnel link и разреши доступ к геолокации, когда браузер спросит.'
      : 'GPS is captured automatically from the device. On mobile, use the HTTPS tunnel link and allow location access when the browser asks.'
  }

  if (/(hello|hi|salam|привет|здрав)/i.test(message)) {
    return isRussian
      ? 'Привет. Я могу помочь оформить городскую заявку, объяснить статусы, GPS, rewards или подсказать хороший title/description.'
      : 'Hi. I can help you create a clear city issue report, understand report statuses, and explain rewards.'
  }

  if (message.trim().length > 2) {
    return isRussian
      ? `Понял: "${message}". Я могу помочь превратить это в заявку. Например:\n\nTitle: коротко назови проблему\nDescription: что произошло, где именно, насколько срочно, есть ли опасность для людей\n\nНапиши категорию или пришли больше деталей, и я помогу сформулировать текст.`
      : `Got it: "${message}". I can help turn this into a report.\n\nTitle: name the issue briefly\nDescription: explain what happened, where it is, how urgent it is, and whether it creates risk for people\n\nSend the category or more details, and I will help write the final text.`
  }

  return isRussian
    ? 'Я могу помочь с заявками, статусами, GPS, rewards и формулировкой title/description. Напиши, что произошло.'
    : 'I can help with city reports, statuses, GPS, rewards, and writing a clear title or description. Tell me what happened.'
}

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk
      if (body.length > 1_000_000) {
        req.destroy()
        reject(new Error('Request body is too large'))
      }
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function localChatApi() {
  return {
    name: 'local-chat-api',
    configureServer(server: any) {
      server.middlewares.use('/api/chat', async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Allow', 'POST')
          res.end()
          return
        }

        try {
          const body = JSON.parse(await readBody(req) || '{}')
          const message = typeof body.message === 'string' ? body.message.trim() : ''

          if (!message) {
            sendJson(res, 400, { error: 'Message is required' })
            return
          }

          const apiKey = process.env.NVIDIA_API_KEY
          if (!apiKey) {
            sendJson(res, 200, { reply: localChatReply(message), mode: 'local' })
            return
          }

          const history = Array.isArray(body.history) ? body.history.slice(-8) as ChatMessage[] : []
          const messages = [
            {
              role: 'system',
              content: "You are City Grind's helpful mobile assistant for residents of Narimanov district in Baku. Keep answers concise and practical.",
            },
            ...history
              .filter(item => item && typeof item.text === 'string')
              .map(item => ({
                role: item.type === 'user' ? 'user' : 'assistant',
                content: item.text,
              })),
            { role: 'user', content: message },
          ]

          const aiResponse = await fetch(NVIDIA_CHAT_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: AI_MODEL,
              messages,
              temperature: 0.2,
              top_p: 0.7,
              max_tokens: 512,
              stream: false,
            }),
          })

          if (!aiResponse.ok) {
            sendJson(res, 200, { reply: localChatReply(message), mode: 'local' })
            return
          }

          const data = await aiResponse.json()
          const reply = data?.choices?.[0]?.message?.content?.trim()
          sendJson(res, 200, { reply: reply || localChatReply(message), mode: reply ? 'ai' : 'local' })
        } catch {
          sendJson(res, 200, { reply: localChatReply(''), mode: 'local' })
        }
      })
    },
  }
}

export default defineConfig({
  base: './',
  server: {
    allowedHosts: true,
    proxy: {
      '/backend': {
        target: process.env.VITE_BACKEND_PROXY_TARGET || 'http://main-server:8989',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/backend/, ''),
      },
    },
  },
  plugins: [
    localChatApi(),
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
