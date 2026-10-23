import type { AiErrorCode } from '../src/lab/services/aiContract'

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

export function aiError(code: AiErrorCode, message: string, status: number): Response {
  return json({ code, message }, status)
}
