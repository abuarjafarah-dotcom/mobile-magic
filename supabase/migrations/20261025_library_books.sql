-- Library shelf: book rows + PDF bucket. Run once in the Supabase SQL editor.

create table if not exists public.library_books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  blurb text,
  tone text not null default 'sun' check (tone in ('sun', 'mint', 'sky', 'berry')),
  file_path text not null,
  created_at timestamptz not null default now()
);

alter table public.library_books enable row level security;

-- The shelf is family-only behind the family password in the app, so the anon key can read and add books.
create policy "library_books read" on public.library_books for select using (true);
create policy "library_books insert" on public.library_books for insert with check (true);

-- Public bucket for PDFs, 50 MB per file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('library', 'library', true, 52428800, array['application/pdf'])
on conflict (id) do nothing;

create policy "library files read" on storage.objects for select
  using (bucket_id = 'library');
create policy "library files upload" on storage.objects for insert
  with check (bucket_id = 'library');
