import { createAdminClient } from '@/lib/supabase/admin'

export const RATE_LIMITS = {
  chat: 30,  // mensajes por hora
  exam: 10,  // generaciones por hora
} as const

export type RateLimitEndpoint = keyof typeof RATE_LIMITS

export async function checkRateLimit(
  userId: string,
  endpoint: RateLimitEndpoint
): Promise<{ allowed: boolean }> {
  const admin = createAdminClient()
  const { data } = await admin.rpc('check_and_record_ai_usage', {
    p_user_id:  userId,
    p_endpoint: endpoint,
    p_limit:    RATE_LIMITS[endpoint],
  })
  return { allowed: data === true }
}
