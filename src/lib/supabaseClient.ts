import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client

  const url = import.meta.env.VITE_SUPABASE_URL
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anon) {
    console.error('[SUPABASE] Variáveis de ambiente ausentes', {
      VITE_SUPABASE_URL: !!url,
      VITE_SUPABASE_ANON_KEY: !!anon,
    })
    throw new Error('Configuração do Supabase ausente. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
  }

  client = createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return client!
}
