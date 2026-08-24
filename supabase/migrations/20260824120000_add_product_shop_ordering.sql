alter table public.products
  add column if not exists shop_position bigint;

with ordered_products as (
  select
    id,
    row_number() over (order by id desc) as row_number
  from public.products
  where shop_position is null
)
update public.products product
set shop_position = ordered_products.row_number * 1000
from ordered_products
where product.id = ordered_products.id;

alter table public.products
  alter column shop_position set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_shop_position_unique'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_shop_position_unique
      unique (shop_position)
      deferrable initially immediate;
  end if;
end;
$$;

create or replace function public.set_new_product_shop_position()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_top_position bigint;
begin
  perform pg_advisory_xact_lock(hashtext('products_shop_position'));

  select min(shop_position)
    into v_top_position
  from public.products;

  new.shop_position = coalesce(v_top_position, 1000) - 1000;
  return new;
end;
$$;

drop trigger if exists set_new_product_shop_position on public.products;

create trigger set_new_product_shop_position
  before insert on public.products
  for each row
  execute function public.set_new_product_shop_position();

create or replace function public.move_product_shop_position(
  p_product_id bigint,
  p_direction text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id bigint;
  v_product_position bigint;
  v_adjacent_id bigint;
  v_adjacent_position bigint;
begin
  if not public.is_admin() then
    raise exception 'Only admins can reorder products.' using errcode = '42501';
  end if;

  if p_direction not in ('up', 'down') then
    raise exception 'Direction must be up or down.' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext('products_shop_position'));
  set constraints products_shop_position_unique deferred;

  select id, shop_position
    into v_product_id, v_product_position
  from public.products
  where id = p_product_id
  for update;

  if not found then
    raise exception 'Product not found.' using errcode = 'P0002';
  end if;

  if p_direction = 'up' then
    select id, shop_position
      into v_adjacent_id, v_adjacent_position
    from public.products
    where shop_position < v_product_position
    order by shop_position desc, id desc
    limit 1
    for update;
  else
    select id, shop_position
      into v_adjacent_id, v_adjacent_position
    from public.products
    where shop_position > v_product_position
    order by shop_position asc, id asc
    limit 1
    for update;
  end if;

  if not found then
    return;
  end if;

  update public.products
  set shop_position = case
    when id = v_product_id then v_adjacent_position
    when id = v_adjacent_id then v_product_position
    else shop_position
  end
  where id in (v_product_id, v_adjacent_id);
end;
$$;

revoke all on function public.move_product_shop_position(bigint, text) from public;
grant execute on function public.move_product_shop_position(bigint, text) to authenticated;
