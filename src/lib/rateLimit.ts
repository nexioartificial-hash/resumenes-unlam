import { createAdminClient } from '@/lib/supabase/admin'

export const RATE_LIMITS = {
  chat: 30,  // mensajes por hora
  exam: 10,  // generaciones por hora
} as const

export type RateLimitEndpoint = keyof typeof RATE_LIMITS

export async function checkRateLimit(
  userId: string,
  endpoint: RateLimitEndpoint
): Promise<{ allowed: boolean; remaining: number }> {
  const admin = createAdminClient()
  const limit = RATE_LIMITS[endpoint]
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { count } = await admin
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('created_at', since)

  const used = count ?? 0
  const allowed = used < limit

  if (allowed) {
    await admin.from('ai_usage').insert({ user_id: userId, endpoint })
  }

  return { allowed, remaining: Math.max(0, limit - used - (allowed ? 1 : 0)) }
}
