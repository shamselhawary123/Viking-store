create extension if not exists pgcrypto;

alter table public.products
add column if not exists product_group_key uuid;

alter table public.product_variants
add column if not exists public_key uuid;

update public.products
set product_group_key = gen_random_uuid()
where product_group_key is null;

update public.product_variants
set public_key = gen_random_uuid()
where public_key is null;

alter table public.products
alter column product_group_key set default gen_random_uuid(),
alter column product_group_key set not null;

alter table public.product_variants
alter column public_key set default gen_random_uuid(),
alter column public_key set not null;

create unique index if not exists products_product_group_key_unique
on public.products (product_group_key);

create unique index if not exists product_variants_public_key_unique
on public.product_variants (public_key);
