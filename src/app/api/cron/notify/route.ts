import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPostEmail } from '@/lib/email'
import type { Database } from '@/types/database'

// Daily Vercel Cron: emails every scheduled post due in the next 24 hours, once.
// No user session here, so it reads through security definer RPCs that check
// the same CRON_SECRET (no service_role key).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )

  const { data: due, error } = await supabase.rpc('get_due_reminders', {
    p_secret: secret,
  })
  if (error) {
    console.error('cron: get_due_reminders failed', error.message)
    return NextResponse.json({ error: 'Could not load reminders' }, { status: 500 })
  }

  const sent: string[] = []
  for (const row of due) {
    try {
      await sendPostEmail(row.email, row, row)
      sent.push(row.id)
    } catch (e) {
      console.error('cron: email failed for post', row.id, e)
    }
  }

  if (sent.length > 0) {
    await supabase.rpc('mark_reminders_sent', { p_secret: secret, p_ids: sent })
  }

  return NextResponse.json({ due: due.length, sent: sent.length })
}
