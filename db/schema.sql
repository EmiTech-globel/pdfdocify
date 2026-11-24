create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  clerk_user_id text not null,
  email text not null,
  amount_kobo bigint not null check (amount_kobo > 0),
  currency text not null default 'NGN',
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create table if not exists order_items (
  order_id uuid not null references orders(id) on delete cascade,
  product_slug text not null,
  title text not null,
  primary key (order_id, product_slug)
);
create table if not exists entitlements (
  clerk_user_id text not null,
  product_slug text not null,
  order_id uuid references orders(id),
  granted_at timestamptz not null default now(),
  primary key (clerk_user_id, product_slug)
);
create index if not exists orders_user_idx on orders (clerk_user_id);
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
-- Admin panel: refunds and an audit trail.
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check check (status in ('pending','paid','failed','refunded'));
alter table orders add column if not exists refunded_at timestamptz;
create table if not exists admin_log (
  id bigint generated always as identity primary key,
  admin_user_id text not null,
  action text not null,
  target text,
  detail jsonb,
  created_at timestamptz not null default now()
);
create index if not exists admin_log_created_idx on admin_log (created_at desc);
create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status);
-- Human-friendly order numbers (TRX-0001). Existing orders are numbered automatically, oldest first.
alter table orders add column if not exists order_no bigint generated always as identity;
create unique index if not exists orders_order_no_idx on orders (order_no);
