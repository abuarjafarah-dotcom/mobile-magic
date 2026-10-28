-- Storybook shelf: covers and cleaned-up table. Run after 20261025_library_books.sql.

alter table public.library_books add column if not exists cover_path text;
alter table public.library_books drop column if exists tone;

-- Bucket now holds PDFs (books/) and cover pictures (covers/).
update storage.buckets
set allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    file_size_limit = 52428800
where id = 'library';
