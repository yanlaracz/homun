create table if not exists public.booking_reservations (
  id uuid primary key default gen_random_uuid(),
  check_in date not null,
  check_out date not null,
  guests integer not null check (guests between 1 and 6),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  customer_email text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  constraint booking_reservations_valid_range check (check_out > check_in)
);

create index if not exists booking_reservations_dates_status_idx
  on public.booking_reservations (check_in, check_out, status);

create or replace function public.create_booking_hold(
  p_check_in date,
  p_check_out date,
  p_guests integer
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  new_id uuid;
begin
  if p_check_in is null or p_check_out is null or p_check_out <= p_check_in
     or p_check_in < (now() at time zone 'America/Cancun')::date
     or p_check_out - p_check_in > 30
     or p_guests is null or p_guests < 1 or p_guests > 6 then
    raise exception 'Invalid reservation request';
  end if;

  -- One property: serialize date checks so two simultaneous checkouts cannot
  -- acquire overlapping holds.
  perform pg_advisory_xact_lock(741209, 1);

  update public.booking_reservations
     set status = 'cancelled', expires_at = null
   where status = 'pending' and expires_at <= now();

  if exists (
    select 1
      from public.booking_reservations r
     where r.status in ('confirmed', 'pending')
       and (r.status = 'confirmed' or r.expires_at > now())
       and r.check_in < p_check_out
       and r.check_out > p_check_in
  ) then
    return null;
  end if;

  insert into public.booking_reservations (check_in, check_out, guests, status, expires_at)
  values (p_check_in, p_check_out, p_guests, 'pending', now() + interval '1 hour')
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.list_booking_busy_dates(
  p_from date,
  p_to date
) returns text[]
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(array_agg(to_char(d::date, 'YYYY-MM-DD') order by d::date), array[]::text[])
    from public.booking_reservations r
    cross join lateral generate_series(
      r.check_in::timestamp,
      (r.check_out - 1)::timestamp,
      interval '1 day'
    ) as d
   where p_from is not null and p_to is not null and p_to > p_from
     and d::date >= p_from and d::date < p_to
     and (r.status = 'confirmed' or (r.status = 'pending' and r.expires_at > now()));
$$;

alter table public.booking_reservations enable row level security;
revoke all on public.booking_reservations from public, anon, authenticated;
grant all on public.booking_reservations to service_role;
revoke all on function public.create_booking_hold(date, date, integer) from public, anon, authenticated;
revoke all on function public.list_booking_busy_dates(date, date) from public, anon, authenticated;
grant execute on function public.create_booking_hold(date, date, integer) to service_role;
grant execute on function public.list_booking_busy_dates(date, date) to service_role;
