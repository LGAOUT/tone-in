create table public.masterclasses (
  id uuid default uuid_generate_v4() primary key,
  instructor_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  thumbnail_url text,
  category text check (category in (
    'mixing', 'mastering', 'production', 'beatmaking',
    'songwriting', 'theory', 'instrument', 'business', 'other'
  )) not null,
  price decimal(10,2) not null check (price > 0),
  currency text default 'EUR',
  level text check (level in ('beginner', 'intermediate', 'advanced', 'expert')) default 'beginner',
  duration_minutes int default 0,
  students_count int default 0,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.masterclass_chapters (
  id uuid default uuid_generate_v4() primary key,
  masterclass_id uuid references public.masterclasses(id) on delete cascade not null,
  title text not null,
  description text,
  video_url text,
  duration_minutes int default 0,
  position int not null,
  free_preview boolean default false,
  created_at timestamptz default now()
);

create table public.masterclass_enrollments (
  id uuid default uuid_generate_v4() primary key,
  masterclass_id uuid references public.masterclasses(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  stripe_session_id text,
  created_at timestamptz default now(),
  unique(masterclass_id, student_id)
);

create index on public.masterclasses(instructor_id);
create index on public.masterclasses(published);
create index on public.masterclass_chapters(masterclass_id);
create index on public.masterclass_enrollments(student_id);
create index on public.masterclass_enrollments(masterclass_id);

alter table public.masterclasses enable row level security;
alter table public.masterclass_chapters enable row level security;
alter table public.masterclass_enrollments enable row level security;

-- Masterclasses
create policy "Masterclasses publiées visibles par tous"
  on public.masterclasses for select
  using (published = true or auth.uid() = instructor_id);

create policy "Instructeur crée ses masterclasses"
  on public.masterclasses for insert
  with check (auth.uid() = instructor_id);

create policy "Instructeur modifie ses masterclasses"
  on public.masterclasses for update
  using (auth.uid() = instructor_id);

create policy "Instructeur supprime ses masterclasses"
  on public.masterclasses for delete
  using (auth.uid() = instructor_id);

-- Chapitres
create policy "Chapitres visibles par tous"
  on public.masterclass_chapters for select
  using (true);

create policy "Instructeur gère ses chapitres"
  on public.masterclass_chapters for insert
  with check (
    auth.uid() = (
      select instructor_id from masterclasses where id = masterclass_id
    )
  );

create policy "Instructeur modifie ses chapitres"
  on public.masterclass_chapters for update
  using (
    auth.uid() = (
      select instructor_id from masterclasses where id = masterclass_id
    )
  );

create policy "Instructeur supprime ses chapitres"
  on public.masterclass_chapters for delete
  using (
    auth.uid() = (
      select instructor_id from masterclasses where id = masterclass_id
    )
  );

-- Enrollments
create policy "Étudiant voit ses enrollments"
  on public.masterclass_enrollments for select
  using (auth.uid() = student_id or auth.uid() = (
    select instructor_id from masterclasses where id = masterclass_id
  ));

create policy "Système crée les enrollments"
  on public.masterclass_enrollments for insert
  with check (true);

create or replace function increment_students_count(mc_id uuid)
returns void as $$
  update masterclasses set students_count = students_count + 1 where id = mc_id;
$$ language sql security definer;  