create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text check (type in ('follow', 'message', 'like', 'comment')) not null,
  from_user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade,
  read boolean default false,
  created_at timestamptz default now()
);

create index on public.notifications(user_id);
create index on public.notifications(created_at desc);

alter table public.notifications enable row level security;

create policy "Utilisateur voit ses notifs"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Notifs créées par le système"
  on public.notifications for insert
  with check (true);

create policy "Utilisateur marque ses notifs comme lues"
  on public.notifications for update
  using (auth.uid() = user_id);

alter publication supabase_realtime add table notifications;

-- Notif quand quelqu'un follow
create or replace function notify_on_follow()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, from_user_id)
  values (new.following_id, 'follow', new.follower_id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_follow_created
  after insert on public.follows
  for each row execute procedure notify_on_follow();

-- Notif quand quelqu'un envoie un message
create or replace function notify_on_message()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, from_user_id)
  values (new.receiver_id, 'message', new.sender_id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_message_created
  after insert on public.messages
  for each row execute procedure notify_on_message();