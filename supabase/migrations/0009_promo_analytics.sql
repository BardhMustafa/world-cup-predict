-- ═══════════════════════════════════════════════════════════════
-- Promo analytics — impression & click counters
-- track_promo_event() is callable by anon so even the public
-- homepage can track impressions without a signed-in user.
-- ═══════════════════════════════════════════════════════════════

alter table public.promotions
  add column if not exists impression_count integer not null default 0,
  add column if not exists click_count      integer not null default 0;

-- Atomic counter bump — security definer bypasses the admin-only
-- write policy so anyone can call it, but only the two allowed
-- events modify data.
create or replace function public.track_promo_event(p_promo_id uuid, p_event text)
returns void language plpgsql security definer
set search_path = public as $$
begin
  if p_event = 'impression' then
    update public.promotions
    set impression_count = impression_count + 1
    where id = p_promo_id;
  elsif p_event = 'click' then
    update public.promotions
    set click_count = click_count + 1
    where id = p_promo_id;
  end if;
end $$;

grant execute on function public.track_promo_event(uuid, text) to anon, authenticated;
