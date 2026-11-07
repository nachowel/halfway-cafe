begin;

do $$
begin
  if not exists (
    select 1 from auth.users
    where deleted_at is null
      and raw_app_meta_data ->> 'role' = 'halfway_admin'
  ) then
    raise exception 'Refusing policy hardening: no active halfway_admin app_metadata claim exists';
  end if;
end;
$$;

drop policy if exists "Auth manage menu_items" on public.menu_items;
drop policy if exists "Auth manage opening_hours" on public.opening_hours;
drop policy if exists "Auth manage gallery_images" on public.gallery_images;
drop policy if exists "Auth manage site_settings" on public.site_settings;
drop policy if exists "Authenticated can manage categories" on public.categories;

create policy "Halfway admins manage menu_items"
  on public.menu_items for all to authenticated
  using (public.is_halfway_admin()) with check (public.is_halfway_admin());
create policy "Halfway admins manage opening_hours"
  on public.opening_hours for all to authenticated
  using (public.is_halfway_admin()) with check (public.is_halfway_admin());
create policy "Halfway admins manage gallery_images"
  on public.gallery_images for all to authenticated
  using (public.is_halfway_admin()) with check (public.is_halfway_admin());
create policy "Halfway admins manage site_settings"
  on public.site_settings for all to authenticated
  using (public.is_halfway_admin()) with check (public.is_halfway_admin());
create policy "Halfway admins manage categories"
  on public.categories for all to authenticated
  using (public.is_halfway_admin()) with check (public.is_halfway_admin());

commit;
