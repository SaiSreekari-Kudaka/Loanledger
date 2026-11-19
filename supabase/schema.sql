-- supabase/schema.sql
-- Run this once in your Supabase SQL Editor (Database > SQL Editor) to create
-- all tables, RLS policies, and seed data.

-- 1. PROFILES
create table if not exists profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  email     text not null,
  full_name text,
  role      text not null check (role in ('user','ngo')) default 'user',
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users see own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

/* Trigger: auto-create profile on signup */
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Self-service account deletion.
-- security definer so it can delete from auth.users; it ONLY ever removes the
-- caller's own row (auth.uid()), so it is safe to call from the client.
-- All user data (profile, loans, beneficiaries, ngo_loans) cascades away.
create or replace function public.delete_user()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
grant execute on function public.delete_user to authenticated;

-- 2. BANKS (global read)
create table if not exists banks (
  id            serial primary key,
  name          text not null,
  logo_url      text,
  interest_rate numeric(5,2) not null,
  loan_type     text not null,
  min_amount    bigint default 10000,
  max_amount    bigint default 10000000,
  created_at    timestamptz default now()
);
alter table banks enable row level security;
create policy "Anyone can read banks" on banks for select using (true);

/* Seed banks */
insert into banks (name, interest_rate, loan_type) values
  ('State Bank of India',  8.50,  'Home Loan'),
  ('HDFC Bank',            9.20,  'Personal Loan'),
  ('ICICI Bank',           8.80,  'Business Loan'),
  ('Axis Bank',            10.50, 'Education Loan'),
  ('Kotak Mahindra Bank',  9.75,  'Vehicle Loan'),
  ('Punjab National Bank', 7.90,  'Gold Loan'),
  ('Bank of Baroda',       9.10,  'Agricultural Loan'),
  ('Canara Bank',          8.65,  'Home Loan')
on conflict do nothing;

-- 3. LOANS (user-owned)
create table if not exists loans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  loan_name       text not null,
  bank_name       text,
  amount          numeric(15,2) not null,
  interest_rate   numeric(5,2)  not null,
  tenure          int           not null,
  emi             numeric(15,2),
  paid_amount     numeric(15,2) default 0,
  remaining_amount numeric(15,2),
  status          text not null check (status in ('active','completed','defaulted','pending')) default 'active',
  start_date      date default current_date,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table loans enable row level security;
create policy "Users manage own loans" on loans for all using (auth.uid() = user_id);

-- 4. BENEFICIARIES (NGO-owned)
create table if not exists beneficiaries (
  id         uuid primary key default gen_random_uuid(),
  ngo_id     uuid not null references profiles(id) on delete cascade,
  name       text not null,
  contact    text,
  address    text,
  income     numeric(12,2),
  notes      text,
  created_at timestamptz default now()
);
alter table beneficiaries enable row level security;
create policy "NGO manages own beneficiaries" on beneficiaries for all using (auth.uid() = ngo_id);

-- 5. NGO LOANS
create table if not exists ngo_loans (
  id               uuid primary key default gen_random_uuid(),
  ngo_id           uuid not null references profiles(id) on delete cascade,
  beneficiary_id   uuid not null references beneficiaries(id) on delete cascade,
  bank_name        text,
  amount           numeric(15,2) not null,
  interest_rate    numeric(5,2)  not null,
  tenure           int           not null,
  emi              numeric(15,2),
  paid_amount      numeric(15,2) default 0,
  remaining_amount numeric(15,2),
  missed_emis      int default 0,
  status           text not null check (status in ('active','completed','defaulted','pending')) default 'active',
  start_date       date default current_date,
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
alter table ngo_loans enable row level security;
create policy "NGO manages own ngo_loans" on ngo_loans for all using (auth.uid() = ngo_id);

-- 6. PAYMENTS LOG
create table if not exists payments (
  id         uuid primary key default gen_random_uuid(),
  loan_id    uuid,
  ngo_loan_id uuid,
  amount     numeric(15,2) not null,
  paid_on    date default current_date,
  notes      text,
  created_at timestamptz default now()
);
alter table payments enable row level security;
create policy "Users see own payments" on payments for all using (
  loan_id in (select id from loans where user_id = auth.uid())
  or
  ngo_loan_id in (select id from ngo_loans where ngo_id = auth.uid())
);