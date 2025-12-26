-- Create budgets table
create table if not exists budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  amount numeric not null default 0,
  category text default 'global',
  period text default 'monthly',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, category)
);

-- RLS Policies
alter table budgets enable row level security;

create policy "Users can view their own budgets"
  on budgets for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own budgets"
  on budgets for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own budgets"
  on budgets for update
  using ( auth.uid() = user_id );
