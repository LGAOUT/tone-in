-- Table services
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text check (category in (
    'mixing', 'mastering', 'production', 'beatmaking',
    'songwriting', 'recording', 'lessons', 'arrangement',
    'graphic', 'other'
  )) not null,
  price decimal(10,2) not null check (price > 0),
  currency text default 'EUR',
  delivery_days int not null check (delivery_days > 0),
  examples text[] default '{}',
  active boolean default true,
  orders_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index
create index on public.services(provider_id);
create index on public.services(category);
create index on public.services(active);
create index on public.services(price);

-- RLS
alter table public.services enable row level security;

create policy "Services actifs visibles par tous"
  on public.services for select
  using (active = true or auth.uid() = provider_id);

create policy "Utilisateur crée ses services"
  on public.services for insert
  with check (auth.uid() = provider_id);

create policy "Utilisateur modifie ses services"
  on public.services for update
  using (auth.uid() = provider_id);

create policy "Utilisateur supprime ses services"
  on public.services for delete
  using (auth.uid() = provider_id);