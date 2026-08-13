create extension if not exists pgcrypto with schema extensions;

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  description text,
  discount_type text not null,
  discount_value numeric(12, 2) not null,
  minimum_order_amount numeric(12, 2) not null default 0,
  maximum_discount_amount numeric(12, 2),
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean not null default true,
  max_total_uses integer,
  max_uses_per_user integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupons_code_not_blank check (length(btrim(code)) > 0),
  constraint coupons_name_not_blank check (length(btrim(name)) > 0),
  constraint coupons_discount_type_check check (discount_type in ('percentage', 'fixed_amount')),
  constraint coupons_discount_value_positive check (discount_value > 0),
  constraint coupons_percentage_value_check check (discount_type <> 'percentage' or discount_value <= 100),
  constraint coupons_minimum_order_amount_nonnegative check (minimum_order_amount >= 0),
  constraint coupons_maximum_discount_amount_nonnegative check (maximum_discount_amount is null or maximum_discount_amount >= 0),
  constraint coupons_maximum_discount_only_for_percentage check (discount_type = 'percentage' or maximum_discount_amount is null),
  constraint coupons_max_total_uses_nonnegative check (max_total_uses is null or max_total_uses >= 0),
  constraint coupons_max_uses_per_user_nonnegative check (max_uses_per_user is null or max_uses_per_user >= 0),
  constraint coupons_valid_date_range check (expires_at is null or starts_at is null or expires_at >= starts_at)
);

create unique index if not exists coupons_code_upper_unique
  on public.coupons (upper(btrim(code)));

create index if not exists coupons_active_dates_idx
  on public.coupons (active, starts_at, expires_at);

create table if not exists public.coupon_products (
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  product_id integer not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (coupon_id, product_id)
);

create index if not exists coupon_products_product_id_idx
  on public.coupon_products (product_id);

create table if not exists public.coupon_categories (
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  category_id integer not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (coupon_id, category_id)
);

create index if not exists coupon_categories_category_id_idx
  on public.coupon_categories (category_id);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  user_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  discount_amount numeric(12, 2) not null default 0,
  redeemed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint coupon_redemptions_discount_amount_nonnegative check (discount_amount >= 0)
);

create index if not exists coupon_redemptions_coupon_id_idx
  on public.coupon_redemptions (coupon_id);

create index if not exists coupon_redemptions_user_id_idx
  on public.coupon_redemptions (user_id);

create index if not exists coupon_redemptions_order_id_idx
  on public.coupon_redemptions (order_id);

create unique index if not exists coupon_redemptions_coupon_order_unique
  on public.coupon_redemptions (coupon_id, order_id)
  where order_id is not null;

create or replace function public.set_coupon_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_coupon_updated_at on public.coupons;

create trigger set_coupon_updated_at
  before update on public.coupons
  for each row
  execute function public.set_coupon_updated_at();

alter table public.coupons enable row level security;
alter table public.coupon_products enable row level security;
alter table public.coupon_categories enable row level security;
alter table public.coupon_redemptions enable row level security;

create policy "admins can manage coupons"
  on public.coupons
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "customers can read active coupons"
  on public.coupons
  for select
  to anon, authenticated
  using (
    active = true
    and (starts_at is null or starts_at <= now())
    and (expires_at is null or expires_at >= now())
  );

create policy "admins can manage coupon products"
  on public.coupon_products
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "customers can read active coupon products"
  on public.coupon_products
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.coupons
      where coupons.id = coupon_products.coupon_id
        and coupons.active = true
        and (coupons.starts_at is null or coupons.starts_at <= now())
        and (coupons.expires_at is null or coupons.expires_at >= now())
    )
  );

create policy "admins can manage coupon categories"
  on public.coupon_categories
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "customers can read active coupon categories"
  on public.coupon_categories
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.coupons
      where coupons.id = coupon_categories.coupon_id
        and coupons.active = true
        and (coupons.starts_at is null or coupons.starts_at <= now())
        and (coupons.expires_at is null or coupons.expires_at >= now())
    )
  );

create policy "admins can manage coupon redemptions"
  on public.coupon_redemptions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "users can read own coupon redemptions"
  on public.coupon_redemptions
  for select
  to authenticated
  using (auth.uid() = user_id);

revoke all on public.coupons from anon, authenticated;
revoke all on public.coupon_products from anon, authenticated;
revoke all on public.coupon_categories from anon, authenticated;
revoke all on public.coupon_redemptions from anon, authenticated;

grant select on public.coupons to anon, authenticated;
grant select on public.coupon_products to anon, authenticated;
grant select on public.coupon_categories to anon, authenticated;
grant select on public.coupon_redemptions to authenticated;

grant insert, update, delete on public.coupons to authenticated;
grant insert, update, delete on public.coupon_products to authenticated;
grant insert, update, delete on public.coupon_categories to authenticated;
grant insert, update, delete on public.coupon_redemptions to authenticated;
