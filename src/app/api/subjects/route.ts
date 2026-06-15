import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subjects')
    .select('name, slug, price, available, description, benefit, department')
    .order('order_index')

  if (error) return NextResponse.json({ error: 'Error al obtener materias' }, { status: 500 })

  return NextResponse.json(data ?? [], {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  })
}
