-- ═══════════════════════════════════════════════════════════════
-- "Match of the Day" — let an admin feature one fixture on the front
-- page. A partial unique index guarantees at most one featured match.
-- ═══════════════════════════════════════════════════════════════
alter table public.matches add column if not exists is_featured boolean not null default false;

create unique index if not exists matches_one_featured
  on public.matches (is_featured) where is_featured;

-- Atomically move the "featured" flag to one match (or clear it with null).
-- Admin-only, security definer so it can flip the flag under RLS.
create or replace function public.set_featured_match(p_match uuid)
returns void language plpgsql security definer
set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'only the editorial desk may feature a match';
  end if;
  update public.matches set is_featured = false where is_featured;
  if p_match is not null then
    update public.matches set is_featured = true where id = p_match;
  end if;
end $$;

grant execute on function public.set_featured_match(uuid) to authenticated;
