alter table orders add column if not exists order_no bigint generated always as identity;
create unique index if not exists orders_order_no_idx on orders (order_no);
