import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { buildPrompt, parseAISortResponse } from './src/lib/aiSort.js'

const PROVIDERS = {
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-haiku-4-5-20251001',
    buildRequest(apiKey, model, prompt) {
      return {
        url: this.url,
        options: {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
          }),
        },
      }
    },
    extractText(data) {
      return data.content?.[0]?.text ?? ''
    },
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    buildRequest(apiKey, model, prompt) {
      return {
        url: this.url,
        options: {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
          }),
        },
      }
    },
    extractText(data) {
      return data.choices?.[0]?.message?.content ?? ''
    },
  },
  mistral: {
    url: 'https://api.mistral.ai/v1/chat/completions',
    defaultModel: 'mistral-small-latest',
    buildRequest(apiKey, model, prompt) {
      return {
        url: this.url,
        options: {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
          }),
        },
      }
    },
    extractText(data) {
      return data.choices?.[0]?.message?.content ?? ''
    },
  },
}

function aiSortPlugin(env) {
  return {
    name: 'ai-sort',
    configureServer(server) {
      server.middlewares.use('/api/ai/sort', async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const apiKey = env.AI_API_KEY
        if (!apiKey) {
          res.writeHead(500, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ error: 'AI_API_KEY is not configured' }))
          return
        }

        const providerName = (env.AI_PROVIDER || 'anthropic').toLowerCase()
        const provider = PROVIDERS[providerName]
        if (!provider) {
          res.writeHead(500, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ error: `Unknown AI_PROVIDER: ${providerName}` }))
          return
        }

        // Collect request body
        let body = ''
        for await (const chunk of req) {
          body += chunk
        }

        let todos
        try {
          const parsed = JSON.parse(body)
          todos = parsed.todos
          if (!Array.isArray(todos)) throw new Error('todos must be an array')
        } catch (err) {
          res.writeHead(400, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ error: `Invalid request body: ${err.message}` }))
          return
        }

        const model = env.AI_MODEL || provider.defaultModel
        const prompt = buildPrompt(todos)

        let aiResponse
        try {
          const { url, options } = provider.buildRequest(apiKey, model, prompt)
          aiResponse = await fetch(url, options)
        } catch (err) {
          res.writeHead(502, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ error: `Network error calling AI provider: ${err.message}` }))
          return
        }

        if (!aiResponse.ok) {
          const errText = await aiResponse.text()
          res.writeHead(502, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ error: `AI provider returned ${aiResponse.status}: ${errText}` }))
          return
        }

        const data = await aiResponse.json()
        const rawText = provider.extractText(data)

        let sortedIds
        try {
          sortedIds = parseAISortResponse(rawText)
        } catch (err) {
          res.writeHead(502, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ error: `Failed to parse AI response: ${err.message}` }))
          return
        }

        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ sortedIds }))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (no prefix filter) so AI_* vars are available server-side.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), aiSortPlugin(env)],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
    },
  }
})
