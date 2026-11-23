create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  clerk_user_id text not null,
  display_name text not null,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text not null check (char_length(body) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  unique (product_slug, clerk_user_id)
);
create table if not exists review_media (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  object_key text not null unique,
  kind text not null check (kind in ('image','video')),
  content_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on reviews (product_slug, status, created_at desc);
create index if not exists review_media_review_idx on review_media (review_id);
