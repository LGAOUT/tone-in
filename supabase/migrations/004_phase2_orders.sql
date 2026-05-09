create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  service_id uuid references public.services(id) on delete set null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  stripe_session_id text unique,
  stripe_payment_intent text,
  amount decimal(10,2) not null,
  platform_fee decimal(10,2) not null,
  currency text default 'EUR',
  status text default 'pending' check (status in (
    'pending', 'paid', 'delivered', 'cancelled', 'refunded'
  )),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on public.orders(buyer_id);
create index on public.orders(seller_id);
create index on public.orders(stripe_session_id);
create index on public.orders(status);

alter table public.orders enable row level security;

create policy "Acheteur et vendeur voient la commande"
  on public.orders for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Système crée les commandes"
  on public.orders for insert
  with check (true);

create policy "Système met à jour les commandes"
  on public.orders for update
  using (true);