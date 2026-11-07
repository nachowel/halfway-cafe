begin;

alter table public.categories add column if not exists image_url text;

create or replace function public.is_halfway_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'halfway_admin';
$$;

revoke all on function public.is_halfway_admin() from public;
grant execute on function public.is_halfway_admin() to anon, authenticated;

create table if not exists public.image_assets (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  asset_id text unique,
  version bigint,
  format text not null check (format in ('jpeg', 'png', 'webp')),
  width integer not null check (width between 1 and 6000),
  height integer not null check (height between 1 and 6000),
  byte_size integer not null check (byte_size between 1 and 4000000),
  source_sha256 text not null unique check (source_sha256 ~ '^[a-f0-9]{64}$'),
  original_filename text not null check (char_length(original_filename) between 1 and 255),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  status text not null default 'pending' check (status in ('pending', 'ready', 'failed')),
  error_code text,
  idempotency_key uuid not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint image_assets_namespace check (
    public_id like 'halfway-cafe/admin/%'
    and public_id not like '%..%'
    and public_id not like '%//%'
  ),
  constraint image_assets_ready_metadata check (
    status <> 'ready' or (asset_id is not null and version is not null and version > 0)
  ),
  unique (created_by, idempotency_key)
);

create index if not exists image_assets_ready_created_idx
  on public.image_assets (created_at desc) where status = 'ready';

alter table public.image_assets enable row level security;

create policy "Halfway admins manage image assets"
  on public.image_assets for all
  to authenticated
  using (public.is_halfway_admin())
  with check (public.is_halfway_admin());

create or replace function public.resolve_public_image_asset(p_public_id text)
returns table (public_id text, version bigint, format text, width integer, height integer)
language sql
stable
security definer
set search_path = ''
as $$
  select a.public_id, a.version, a.format, a.width, a.height
  from public.image_assets a
  where a.public_id = p_public_id
    and a.public_id like 'halfway-cafe/%'
    and a.status = 'ready'
  limit 1;
$$;

revoke all on function public.resolve_public_image_asset(text) from public;
grant execute on function public.resolve_public_image_asset(text) to anon, authenticated;

create table if not exists public.admin_image_rate_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('upload', 'picker', 'reconcile')),
  created_at timestamptz not null default now()
);

create index if not exists admin_image_rate_events_lookup_idx
  on public.admin_image_rate_events (user_id, action, created_at desc);

alter table public.admin_image_rate_events enable row level security;

create or replace function public.consume_admin_image_rate_limit(p_action text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_short_count integer;
  v_hour_count integer;
  v_short_window interval;
  v_short_limit integer;
  v_hour_limit integer;
begin
  if v_user is null or not public.is_halfway_admin() then
    raise exception 'halfway_admin authorization required' using errcode = '42501';
  end if;

  if p_action = 'upload' then
    v_short_window := interval '10 minutes'; v_short_limit := 5; v_hour_limit := 20;
  elsif p_action = 'picker' then
    v_short_window := interval '1 minute'; v_short_limit := 60; v_hour_limit := 600;
  elsif p_action = 'reconcile' then
    v_short_window := interval '1 hour'; v_short_limit := 10; v_hour_limit := 10;
  else
    raise exception 'unsupported rate-limit action' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text || ':' || p_action, 0));

  select count(*) into v_short_count
  from public.admin_image_rate_events
  where user_id = v_user and action = p_action and created_at >= now() - v_short_window;

  select count(*) into v_hour_count
  from public.admin_image_rate_events
  where user_id = v_user and action = p_action and created_at >= now() - interval '1 hour';

  if v_short_count >= v_short_limit or v_hour_count >= v_hour_limit then
    raise exception 'admin image rate limit exceeded' using errcode = 'P0001';
  end if;

  insert into public.admin_image_rate_events (user_id, action) values (v_user, p_action);
  delete from public.admin_image_rate_events where created_at < now() - interval '24 hours';
end;
$$;

revoke all on function public.consume_admin_image_rate_limit(text) from public;
grant execute on function public.consume_admin_image_rate_limit(text) to authenticated;

create or replace function public.begin_image_asset(
  p_public_id text,
  p_format text,
  p_width integer,
  p_height integer,
  p_byte_size integer,
  p_source_sha256 text,
  p_original_filename text,
  p_mime_type text,
  p_idempotency_key uuid
)
returns public.image_assets
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_existing public.image_assets;
  v_created public.image_assets;
begin
  if v_user is null or not public.is_halfway_admin() then
    raise exception 'halfway_admin authorization required' using errcode = '42501';
  end if;

  select * into v_existing from public.image_assets
  where created_by = v_user and idempotency_key = p_idempotency_key;
  if found then
    if v_existing.source_sha256 <> p_source_sha256 then
      raise exception 'idempotency key was already used for different bytes' using errcode = '22023';
    end if;
    return v_existing;
  end if;

  select * into v_existing from public.image_assets
  where source_sha256 = p_source_sha256;
  if found then return v_existing; end if;

  perform public.consume_admin_image_rate_limit('upload');

  insert into public.image_assets (
    public_id, format, width, height, byte_size, source_sha256,
    original_filename, mime_type, idempotency_key, created_by
  ) values (
    p_public_id, p_format, p_width, p_height, p_byte_size, p_source_sha256,
    p_original_filename, p_mime_type, p_idempotency_key, v_user
  ) returning * into v_created;

  return v_created;
end;
$$;

revoke all on function public.begin_image_asset(text,text,integer,integer,integer,text,text,text,uuid) from public;
grant execute on function public.begin_image_asset(text,text,integer,integer,integer,text,text,text,uuid) to authenticated;

create or replace function public.finalize_image_asset(
  p_id uuid,
  p_asset_id text,
  p_version bigint,
  p_format text,
  p_width integer,
  p_height integer,
  p_byte_size integer
)
returns public.image_assets
language plpgsql
security definer
set search_path = ''
as $$
declare v_asset public.image_assets;
begin
  if auth.uid() is null or not public.is_halfway_admin() then
    raise exception 'halfway_admin authorization required' using errcode = '42501';
  end if;

  update public.image_assets
  set asset_id = p_asset_id, version = p_version, format = p_format,
      width = p_width, height = p_height, byte_size = p_byte_size,
      status = 'ready', error_code = null, updated_at = now()
  where id = p_id and created_by = auth.uid() and status = 'pending'
    and format = p_format and width = p_width and height = p_height and byte_size = p_byte_size
  returning * into v_asset;

  if not found then
    raise exception 'asset finalization metadata mismatch' using errcode = '22023';
  end if;
  return v_asset;
end;
$$;

revoke all on function public.finalize_image_asset(uuid,text,bigint,text,integer,integer,integer) from public;
grant execute on function public.finalize_image_asset(uuid,text,bigint,text,integer,integer,integer) to authenticated;

create or replace function public.fail_image_asset(p_id uuid, p_error_code text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_halfway_admin() then
    raise exception 'halfway_admin authorization required' using errcode = '42501';
  end if;
  update public.image_assets
  set status = 'failed', error_code = left(p_error_code, 80), updated_at = now()
  where id = p_id and created_by = auth.uid() and status = 'pending';
end;
$$;

revoke all on function public.fail_image_asset(uuid,text) from public;
grant execute on function public.fail_image_asset(uuid,text) to authenticated;

create or replace function public.save_gallery_atomic(p_rows jsonb, p_delete_ids uuid[] default '{}')
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare v_row jsonb;
begin
  if auth.uid() is null or not public.is_halfway_admin() then
    raise exception 'halfway_admin authorization required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 100 then
    raise exception 'invalid gallery batch' using errcode = '22023';
  end if;

  delete from public.gallery_images where id = any(coalesce(p_delete_ids, '{}'));

  for v_row in select value from jsonb_array_elements(p_rows)
  loop
    if nullif(v_row ->> 'url', '') is null then
      raise exception 'gallery image reference is required' using errcode = '22023';
    end if;
    insert into public.gallery_images (id, url, alt_text, sort_order, active)
    values (
      (v_row ->> 'id')::uuid,
      v_row ->> 'url',
      nullif(v_row ->> 'alt_text', ''),
      coalesce((v_row ->> 'sort_order')::integer, 0),
      coalesce((v_row ->> 'active')::boolean, true)
    )
    on conflict (id) do update set
      url = excluded.url,
      alt_text = excluded.alt_text,
      sort_order = excluded.sort_order,
      active = excluded.active;
  end loop;
end;
$$;

revoke all on function public.save_gallery_atomic(jsonb,uuid[]) from public;
grant execute on function public.save_gallery_atomic(jsonb,uuid[]) to authenticated;

commit;
