-- Table groupes
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  cover_url text,
  category text check (category in (
    'genre', 'instrument', 'production', 'theory',
    'business', 'collaboration', 'general'
  )),
  created_by uuid references public.profiles(id) on delete cascade not null,
  members_count int default 1,
  posts_count int default 0,
  created_at timestamptz default now()
);

-- Table membres
create table public.group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- Table posts de groupe
create table public.group_posts (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  media_url text,
  media_type text check (media_type in ('image', 'audio', 'video', null)),
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamptz default now()
);

-- Index
create index on public.groups(created_by);
create index on public.group_members(group_id);
create index on public.group_members(user_id);
create index on public.group_posts(group_id);
create index on public.group_posts(created_at desc);

-- RLS
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_posts enable row level security;

-- Policies groups
create policy "Groupes visibles par tous"
  on public.groups for select using (true);

create policy "Utilisateur crée un groupe"
  on public.groups for insert
  with check (auth.uid() = created_by);

create policy "Admin modifie le groupe"
  on public.groups for update
  using (auth.uid() = created_by);

create policy "Admin supprime le groupe"
  on public.groups for delete
  using (auth.uid() = created_by);

-- Policies group_members
create policy "Membres visibles par tous"
  on public.group_members for select using (true);

create policy "Utilisateur rejoint un groupe"
  on public.group_members for insert
  with check (auth.uid() = user_id);

create policy "Utilisateur quitte un groupe"
  on public.group_members for delete
  using (auth.uid() = user_id);

-- Policies group_posts
create policy "Posts de groupe visibles par membres"
  on public.group_posts for select using (true);

create policy "Membre crée un post"
  on public.group_posts for insert
  with check (auth.uid() = author_id);

create policy "Membre supprime son post"
  on public.group_posts for delete
  using (auth.uid() = author_id);


create or replace function increment_group_members(gid uuid)
returns void as $$
  update groups set members_count = members_count + 1 where id = gid;
$$ language sql security definer;

create or replace function decrement_group_members(gid uuid)
returns void as $$
  update groups set members_count = greatest(members_count - 1, 0) where id = gid;
$$ language sql security definer;

create or replace function increment_group_posts(gid uuid)
returns void as $$
  update groups set posts_count = posts_count + 1 where id = gid;
$$ language sql security definer;