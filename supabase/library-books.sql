-- One-time setup for the Library shelf uploads (run once in Supabase: SQL Editor).
-- Stores each uploaded book's details in library_books and its PDF in the library-books bucket.

create table if not exists public.library_books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  blurb text not null default '',
  tone text not null default 'sky' check (tone in ('sun', 'mint', 'sky', 'berry')),
  file_path text not null,
  created_at timestamptz not null default now()
);

alter table public.library_books enable row level security;

drop policy if exists "library books are readable" on public.library_books;
create policy "library books are readable"
  on public.library_books for select
  using (true);

drop policy if exists "library books can be added" on public.library_books;
create policy "library books can be added"
  on public.library_books for insert
  with check (true);

-- Public bucket: PDFs open by URL. Uploads are limited to PDF files.
insert into storage.buckets (id, name, public)
values ('library-books', 'library-books', true)
on conflict (id) do update set public = true;

drop policy if exists "library pdfs are readable" on storage.objects;
create policy "library pdfs are readable"
  on storage.objects for select
  using (bucket_id = 'library-books');

drop policy if exists "library pdfs can be uploaded" on storage.objects;
create policy "library pdfs can be uploaded"
  on storage.objects for insert
  with check (bucket_id = 'library-books' and lower(storage.extension(name)) = 'pdf');
