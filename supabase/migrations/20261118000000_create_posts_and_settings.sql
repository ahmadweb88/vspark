-- Shared trigger: keep updated_at current
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Posts: one row per caption the user saves or schedules
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  caption text not null check (char_length(caption) between 1 and 2200),
  platform text not null check (platform in ('instagram', 'x', 'linkedin')),
  scheduled_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sent')),
  image_path text,
  drive_file_id text,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_user_scheduled_idx on public.posts (user_id, scheduled_at);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute procedure public.set_updated_at();

alter table public.posts enable row level security;

create policy "Posts: owner can read"
  on public.posts for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Posts: owner can insert"
  on public.posts for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Posts: owner can update"
  on public.posts for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Posts: owner can delete"
  on public.posts for delete to authenticated
  using (user_id = (select auth.uid()));

-- Notification settings: one row per user
create table public.notification_settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  email text not null check (char_length(email) between 3 and 254),
  enabled boolean not null default true,
  remind_minutes_before integer not null default 60 check (remind_minutes_before between 5 and 1440),
  subject_template text not null default 'Reminder: your {platform} post at {time}'
    check (char_length(subject_template) between 1 and 150),
  message_template text not null default E'Your post is scheduled for {time} on {platform}:\n\n{caption}'
    check (char_length(message_template) between 1 and 2000),
  updated_at timestamptz not null default now()
);

create trigger notification_settings_set_updated_at
  before update on public.notification_settings
  for each row execute procedure public.set_updated_at();

alter table public.notification_settings enable row level security;

create policy "Settings: owner can read"
  on public.notification_settings for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Settings: owner can insert"
  on public.notification_settings for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Settings: owner can update"
  on public.notification_settings for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Cron access without the service_role key: a private secret checked by
-- security definer functions. The secret value is inserted by hand, never here.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.app_secrets (
  name text primary key,
  value text not null
);

create or replace function public.get_due_reminders(p_secret text)
returns table (
  id uuid,
  caption text,
  platform text,
  scheduled_at timestamptz,
  email text,
  subject_template text,
  message_template text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from private.app_secrets s
    where s.name = 'cron_secret' and s.value = p_secret
  ) then
    raise exception 'invalid secret' using errcode = '42501';
  end if;

  return query
  select p.id, p.caption, p.platform, p.scheduled_at,
         ns.email, ns.subject_template, ns.message_template
  from public.posts p
  join public.notification_settings ns on ns.user_id = p.user_id
  where p.status = 'scheduled'
    and p.reminder_sent_at is null
    and ns.enabled
    and p.scheduled_at between now() and now() + interval '24 hours';
end;
$$;

create or replace function public.mark_reminders_sent(p_secret text, p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from private.app_secrets s
    where s.name = 'cron_secret' and s.value = p_secret
  ) then
    raise exception 'invalid secret' using errcode = '42501';
  end if;

  update public.posts
  set reminder_sent_at = now(), status = 'sent'
  where id = any (p_ids);
end;
$$;

revoke all on function public.get_due_reminders(text) from public;
revoke all on function public.mark_reminders_sent(text, uuid[]) from public;
grant execute on function public.get_due_reminders(text) to anon, authenticated;
grant execute on function public.mark_reminders_sent(text, uuid[]) to anon, authenticated;
