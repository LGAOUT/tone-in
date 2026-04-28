-- Extensions utiles
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLE : profiles (liée à auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  role text check (role in (
    'musician', 'producer', 'beatmaker',
    'songwriter', 'teacher', 'learner'
  )),
  badge_level text default 'beginner' check (badge_level in (
    'beginner', 'intermediate', 'advanced', 'expert'
  )),
  skills text[] default '{}',
  website_url text,
  followers_count int default 0,
  following_count int default 0,
  posts_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- TABLE : follows
-- ============================================
create table public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

-- ============================================
-- TABLE : posts
-- ============================================
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  media_url text,
  media_type text check (media_type in ('image', 'audio', 'video', null)),
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- TABLE : post_likes
-- ============================================
create table public.post_likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- ============================================
-- TABLE : comments
-- ============================================
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================
-- TABLE : messages
-- ============================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- INDEX (performances)
-- ============================================
create index on public.posts(author_id);
create index on public.posts(created_at desc);
create index on public.follows(follower_id);
create index on public.follows(following_id);
create index on public.messages(sender_id, receiver_id);
create index on public.post_likes(post_id);
create index on public.comments(post_id);

-- Activer RLS sur toutes les tables
alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.messages enable row level security;

-- ============================================
-- POLICIES : profiles
-- ============================================
create policy "Profils visibles par tous"
  on public.profiles for select using (true);

create policy "Utilisateur modifie son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================
-- POLICIES : posts
-- ============================================
create policy "Posts visibles par tous"
  on public.posts for select using (true);

create policy "Utilisateur crée ses posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Utilisateur modifie ses posts"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "Utilisateur supprime ses posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- ============================================
-- POLICIES : follows
-- ============================================
create policy "Follows visibles par tous"
  on public.follows for select using (true);

create policy "Utilisateur gère ses follows"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Utilisateur supprime ses follows"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- ============================================
-- POLICIES : post_likes
-- ============================================
create policy "Likes visibles par tous"
  on public.post_likes for select using (true);

create policy "Utilisateur gère ses likes"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

create policy "Utilisateur supprime ses likes"
  on public.post_likes for delete
  using (auth.uid() = user_id);

-- ============================================
-- POLICIES : comments
-- ============================================
create policy "Commentaires visibles par tous"
  on public.comments for select using (true);

create policy "Utilisateur crée ses commentaires"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Utilisateur supprime ses commentaires"
  on public.comments for delete
  using (auth.uid() = author_id);

-- ============================================
-- POLICIES : messages
-- ============================================
create policy "Utilisateur voit ses messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Utilisateur envoie des messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);


  -- Fonction déclenchée à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Attacher le trigger à auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();