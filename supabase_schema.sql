-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Credit Cards Table
create table public.credit_cards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  bank_name text not null,
  alias text not null,
  last_4_digits text,
  type text not null,
  credit_limit numeric not null,
  currency text not null,
  cutoff_day integer not null,
  payment_due_day integer not null,
  payment_window_days integer,
  parent_card_id uuid references public.credit_cards(id) on delete set null,
  current_balance numeric default 0,
  statement_balance numeric default 0,
  minimum_payment numeric default 0,
  status text default 'Active',
  is_shared_limit boolean default false,
  created_at timestamptz default now()
);

-- 2. Loans Table
create table public.loans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  bank_name text not null,
  alias text not null,
  last_4_digits text,
  total_amount numeric not null,
  remaining_amount numeric not null,
  monthly_payment numeric not null,
  currency text not null,
  payment_day integer not null,
  interest_rate numeric,
  status text default 'Active',
  created_at timestamptz default now()
);

-- 3. Fixed Expenses Table
create table public.fixed_expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  amount numeric not null,
  currency text not null,
  due_day integer not null,
  is_paid boolean default false,
  created_at timestamptz default now()
);

-- 4. Transactions Table (History)
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  product_type text not null, -- 'card', 'loan'
  product_id uuid not null, -- Can reference either table, logic handled in app
  date timestamptz not null,
  type text not null, -- 'PAGO', 'CORTE'
  amount numeric not null,
  description text,
  created_at timestamptz default now()
);

-- 5. Installments Table
create table public.installments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  card_id uuid references public.credit_cards not null,
  description text not null,
  total_amount numeric not null,
  monthly_amount numeric not null,
  total_installments integer not null,
  current_installment integer not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.credit_cards enable row level security;
alter table public.loans enable row level security;
alter table public.fixed_expenses enable row level security;
alter table public.transactions enable row level security;
alter table public.installments enable row level security;

-- Policies (Users can only see their own data)
create policy "Users can translate their own cards" on public.credit_cards for all using (auth.uid() = user_id);
create policy "Users can translate their own loans" on public.loans for all using (auth.uid() = user_id);
create policy "Users can translate their own expenses" on public.fixed_expenses for all using (auth.uid() = user_id);
create policy "Users can translate their own transactions" on public.transactions for all using (auth.uid() = user_id);
create policy "Users can translate their own installments" on public.installments for all using (auth.uid() = user_id);

-- 6. Budget Categories (Variable Expenses Groups)
create table public.budget_categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  monthly_limit numeric not null,
  icon text, -- Emoji or Lucide icon name
  color text, -- CSS color class or hex
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 7. Variable Expenses (Daily spending)
create table public.variable_expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  category_id uuid references public.budget_categories(id) on delete set null,
  amount numeric not null,
  date timestamptz not null default now(),
  description text,
  created_at timestamptz default now()
);

-- RLS
alter table public.budget_categories enable row level security;
alter table public.variable_expenses enable row level security;

create policy "Users can translate their own categories" on public.budget_categories for all using (auth.uid() = user_id);
create policy "Users can translate their own variable expenses" on public.variable_expenses for all using (auth.uid() = user_id);
