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
