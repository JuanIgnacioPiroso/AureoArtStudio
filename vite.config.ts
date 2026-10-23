import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * En desarrollo, monta los mismos handlers que Vercel sirve en /api/*,
 * para que `npm run dev` funcione con las claves de .env.local sin exponerlas al cliente.
 */
function devApi(): Plugin {
  return {
    name: 'aureo-dev-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '')
      for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v

      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const route = url.pathname.match(/^\/api\/([a-z-]+)$/)?.[1]
        if (!route) return next()
        try {
          const mod = (await server.ssrLoadModule(`/api/${route}.ts`)) as Record<
            string,
            ((r: Request) => Promise<Response>) | undefined
          >
          const handler = mod[req.method ?? 'GET']
          if (!handler) {
            res.statusCode = 405
            return res.end()
          }
          const chunks: Buffer[] = []
          for await (const c of req) chunks.push(c as Buffer)
          const body = chunks.length ? Buffer.concat(chunks) : undefined
          const request = new Request(url, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
          })
          const response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          server.config.logger.error(String(err))
          res.statusCode = 500
          res.end(JSON.stringify({ code: 'dev_api_error' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), devApi()],
  // three.js + drei viven en un chunk diferido que sólo se descarga con el Custom Lab.
  build: { chunkSizeWarningLimit: 1100 },
})
