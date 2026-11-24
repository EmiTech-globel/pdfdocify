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
