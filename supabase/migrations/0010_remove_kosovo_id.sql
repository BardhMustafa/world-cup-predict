-- Drop user_verification table (no longer collecting Kosovo ID)
drop table if exists public.user_verification cascade;

-- Update handle_new_user to no longer insert into user_verification
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
declare
  v_name text := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'New Patriot');
  v_initials text;
begin
  v_initials := upper(
    coalesce(
      substring(split_part(v_name, ' ', 1) from 1 for 1) ||
      nullif(substring(split_part(v_name, ' ', 2) from 1 for 1), ''),
      substring(v_name from 1 for 2)
    )
  );

  insert into public.profiles (id, full_name, handle, city, initials)
  values (
    new.id,
    v_name,
    nullif(new.raw_user_meta_data ->> 'handle', ''),
    nullif(new.raw_user_meta_data ->> 'city', ''),
    v_initials
  )
  on conflict (id) do nothing;

  return new;
end $$;
