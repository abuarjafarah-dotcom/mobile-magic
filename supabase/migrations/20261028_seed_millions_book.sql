-- Adds "Millions, Billions & Trillions" as the first storybook on the shelf.
-- Before running this, upload these two files in Supabase Storage (bucket `library`):
--   books/millions-billions-trillions.pdf      (the PDF)
--   covers/millions-billions-trillions.jpg     (the cover picture)
-- Then run this script once. Running it again does nothing.

insert into public.library_books (title, author, file_path, cover_path)
select
  'Millions, Billions & Trillions',
  'David A. Adler',
  'books/millions-billions-trillions.pdf',
  'covers/millions-billions-trillions.jpg'
where not exists (
  select 1 from public.library_books where file_path = 'books/millions-billions-trillions.pdf'
);
