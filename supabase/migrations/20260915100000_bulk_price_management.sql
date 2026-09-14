create table if not exists public.bulk_price_operations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  scope_type text not null check (scope_type in ('all', 'category', 'selected_products')),
  scope_category_id bigint references public.categories(id) on delete set null,
  scope_product_ids bigint[] not null default array[]::bigint[],
  pricing_method text not null check (pricing_method in ('current_price', 'cost_markup')),
  adjustment_type text not null check (adjustment_type in ('percent', 'fixed', 'markup_percent')),
  adjustment_direction text check (adjustment_direction in ('increase', 'decrease')),
  adjustment_value numeric not null check (adjustment_value >= 0),
  exclude_missing_cost boolean not null default false,
  rounding_rule text not null default 'nearest_whole_egp',
  applied_item_count integer not null default 0,
  status text not null default 'applied' check (status in ('applied', 'undone')),
  undone_at timestamptz
);

create table if not exists public.bulk_price_operation_items (
  id bigint generated always as identity primary key,
  operation_id uuid not null references public.bulk_price_operations(id) on delete cascade,
  product_id bigint not null,
  variant_id bigint,
  item_type text not null check (item_type in ('legacy', 'variant')),
  was_active boolean not null default true,
  old_price numeric not null,
  new_price numeric not null,
  cost_price numeric,
  created_at timestamptz not null default now()
);

create unique index if not exists bulk_price_operation_items_legacy_target_uidx
on public.bulk_price_operation_items (operation_id, product_id)
where variant_id is null;

create unique index if not exists bulk_price_operation_items_variant_target_uidx
on public.bulk_price_operation_items (operation_id, variant_id)
where variant_id is not null;

alter table public.bulk_price_operations enable row level security;
alter table public.bulk_price_operation_items enable row level security;

drop policy if exists "admins manage bulk price operations" on public.bulk_price_operations;
create policy "admins manage bulk price operations"
on public.bulk_price_operations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage bulk price operation items" on public.bulk_price_operation_items;
create policy "admins manage bulk price operation items"
on public.bulk_price_operation_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

revoke all on public.bulk_price_operations from anon, authenticated;
revoke all on public.bulk_price_operation_items from anon, authenticated;
grant select on public.bulk_price_operations to authenticated;
grant select on public.bulk_price_operation_items to authenticated;

create or replace function public.round_bulk_price_egp(p_value numeric)
returns numeric
language sql
immutable
set search_path = public
as $$
  select round(p_value);
$$;

create or replace function public.preview_bulk_price_update(
  p_scope jsonb,
  p_pricing jsonb
)
returns table (
  product_id bigint,
  variant_id bigint,
  item_type text,
  product_title text,
  variant_label text,
  is_active boolean,
  cost_price numeric,
  current_price numeric,
  raw_new_price numeric,
  new_price numeric,
  price_delta numeric,
  price_delta_percent numeric,
  new_gross_profit numeric,
  new_markup_percent numeric,
  new_margin_percent numeric,
  warning text,
  is_valid boolean,
  excluded boolean
)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_scope_type text := coalesce(p_scope->>'type', 'all');
  v_category_id bigint := nullif(btrim(coalesce(p_scope->>'category_id', '')), '')::bigint;
  v_pricing_method text := coalesce(p_pricing->>'method', 'current_price');
  v_adjustment_type text := coalesce(p_pricing->>'adjustment_type', 'percent');
  v_adjustment_direction text := coalesce(p_pricing->>'direction', 'increase');
  v_adjustment_value numeric := nullif(btrim(coalesce(p_pricing->>'value', '')), '')::numeric;
  v_exclude_missing_cost boolean := coalesce((p_pricing->>'exclude_missing_cost')::boolean, false);
begin
  if public.is_admin() is not true then
    raise exception 'Only admins can preview bulk price updates.' using errcode = '42501';
  end if;

  if v_scope_type not in ('all', 'category', 'selected_products') then
    raise exception 'Invalid bulk price scope.' using errcode = '22023';
  end if;

  if v_pricing_method not in ('current_price', 'cost_markup') then
    raise exception 'Invalid bulk price method.' using errcode = '22023';
  end if;

  if v_adjustment_value is null or v_adjustment_value < 0 then
    raise exception 'Bulk price adjustment must be zero or more.' using errcode = '23514';
  end if;

  if v_pricing_method = 'current_price' and v_adjustment_type not in ('percent', 'fixed') then
    raise exception 'Invalid current-price adjustment type.' using errcode = '22023';
  end if;

  if v_pricing_method = 'cost_markup' and v_adjustment_type <> 'markup_percent' then
    raise exception 'Invalid cost-markup adjustment type.' using errcode = '22023';
  end if;

  -- Acceptance examples: 199 with 20 percent increase rounds to 239.
  -- Variants 150, 170, 210 with 20 percent increase become 180, 204, 252.
  return query
  with selected_product_ids as (
    select value::bigint as id
    from jsonb_array_elements_text(coalesce(p_scope->'product_ids', '[]'::jsonb))
  ),
  scope_products as (
    select product.*
    from public.products product
    where
      (v_scope_type = 'all')
      or (v_scope_type = 'category' and product.category_id = v_category_id)
      or (v_scope_type = 'selected_products' and product.id in (select id from selected_product_ids))
  ),
  selling_units as (
    select
      product.id as product_id,
      null::bigint as variant_id,
      'legacy'::text as item_type,
      product.title as product_title,
      null::text as variant_label,
      true as is_active,
      product_cost.cost_price,
      product.price as current_price
    from scope_products product
    left join public.product_costs product_cost on product_cost.product_id = product.id
    where coalesce(product.inventory_model, 'legacy') <> 'variants'

    union all

    select
      product.id as product_id,
      variant.id as variant_id,
      'variant'::text as item_type,
      product.title as product_title,
      concat_ws(' / ', color.name, size.size) as variant_label,
      variant.is_active as is_active,
      variant_cost.cost_price,
      variant.price as current_price
    from scope_products product
    join public.product_variants variant on variant.product_id = product.id
    left join public.product_colors color on color.id = variant.color_id
    left join public.product_sizes size on size.id = variant.size_id
    left join public.product_variant_costs variant_cost on variant_cost.variant_id = variant.id
    where product.inventory_model = 'variants'
  ),
  calculated as (
    select
      unit.*,
      case
        when v_pricing_method = 'current_price' and v_adjustment_type = 'percent' and v_adjustment_direction = 'increase'
          then unit.current_price * (1 + v_adjustment_value / 100)
        when v_pricing_method = 'current_price' and v_adjustment_type = 'percent' and v_adjustment_direction = 'decrease'
          then unit.current_price * (1 - v_adjustment_value / 100)
        when v_pricing_method = 'current_price' and v_adjustment_type = 'fixed' and v_adjustment_direction = 'increase'
          then unit.current_price + v_adjustment_value
        when v_pricing_method = 'current_price' and v_adjustment_type = 'fixed' and v_adjustment_direction = 'decrease'
          then unit.current_price - v_adjustment_value
        when v_pricing_method = 'cost_markup' and unit.cost_price is not null
          then unit.cost_price * (1 + v_adjustment_value / 100)
        else null
      end as raw_price,
      v_pricing_method = 'cost_markup' and unit.cost_price is null as cost_missing
    from selling_units unit
  ),
  rounded as (
    select
      calculated.*,
      case
        when calculated.raw_price is null then null
        else public.round_bulk_price_egp(calculated.raw_price)
      end as rounded_price
    from calculated
  )
  select
    rounded.product_id,
    rounded.variant_id,
    rounded.item_type,
    rounded.product_title,
    rounded.variant_label,
    rounded.is_active,
    rounded.cost_price,
    rounded.current_price,
    rounded.raw_price as raw_new_price,
    rounded.rounded_price as new_price,
    case when rounded.rounded_price is null then null else rounded.rounded_price - rounded.current_price end as price_delta,
    case
      when rounded.rounded_price is null or rounded.current_price = 0 then null
      else ((rounded.rounded_price - rounded.current_price) / rounded.current_price) * 100
    end as price_delta_percent,
    case
      when rounded.cost_price is null or rounded.rounded_price is null then null
      else rounded.rounded_price - rounded.cost_price
    end as new_gross_profit,
    case
      when rounded.cost_price is null or rounded.cost_price = 0 or rounded.rounded_price is null then null
      else ((rounded.rounded_price - rounded.cost_price) / rounded.cost_price) * 100
    end as new_markup_percent,
    case
      when rounded.rounded_price is null or rounded.rounded_price = 0 or rounded.cost_price is null then null
      else ((rounded.rounded_price - rounded.cost_price) / rounded.rounded_price) * 100
    end as new_margin_percent,
    case
      when rounded.cost_missing then 'Missing Cost Price'
      when rounded.rounded_price is null then 'Invalid price calculation'
      when rounded.rounded_price < 0 then 'New price cannot be negative'
      when rounded.cost_price is not null and rounded.rounded_price < rounded.cost_price then 'New selling price is below cost'
      when rounded.rounded_price = rounded.current_price then 'No price change'
      else null
    end as warning,
    (
      rounded.rounded_price is not null
      and rounded.rounded_price >= 0
      and not (rounded.cost_missing and not v_exclude_missing_cost)
    ) as is_valid,
    (rounded.cost_missing and v_exclude_missing_cost) as excluded
  from rounded
  order by rounded.product_id, rounded.variant_id nulls first;
end;
$$;

create or replace function public.apply_bulk_price_update(
  p_scope jsonb,
  p_pricing jsonb,
  p_expected_items jsonb
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  v_operation_id uuid;
  v_applied_count integer;
  v_scope_type text := coalesce(p_scope->>'type', 'all');
  v_pricing_method text := coalesce(p_pricing->>'method', 'current_price');
  v_adjustment_type text := coalesce(p_pricing->>'adjustment_type', 'percent');
  v_adjustment_direction text := coalesce(p_pricing->>'direction', 'increase');
  v_adjustment_value numeric := nullif(btrim(coalesce(p_pricing->>'value', '')), '')::numeric;
  v_exclude_missing_cost boolean := coalesce((p_pricing->>'exclude_missing_cost')::boolean, false);
  v_sync_product_id bigint;
begin
  if public.is_admin() is not true then
    raise exception 'Only admins can apply bulk price updates.' using errcode = '42501';
  end if;

  create temporary table tmp_bulk_preview on commit drop as
  select *
  from public.preview_bulk_price_update(p_scope, p_pricing);

  perform 1
  from public.products product
  where product.id in (select distinct preview.product_id from tmp_bulk_preview preview)
  order by product.id
  for update;

  perform 1
  from public.product_variants variant
  where variant.id in (select preview.variant_id from tmp_bulk_preview preview where preview.variant_id is not null)
  order by variant.id
  for update;

  truncate table tmp_bulk_preview;
  insert into tmp_bulk_preview
  select *
  from public.preview_bulk_price_update(p_scope, p_pricing);

  create temporary table tmp_bulk_expected on commit drop as
  select
    (expected->>'product_id')::bigint as product_id,
    nullif(btrim(coalesce(expected->>'variant_id', '')), '')::bigint as variant_id,
    (expected->>'current_price')::numeric as current_price,
    (expected->>'new_price')::numeric as new_price
  from jsonb_array_elements(coalesce(p_expected_items, '[]'::jsonb)) expected;

  create temporary table tmp_bulk_preview_targets on commit drop as
  select
    preview.product_id,
    preview.variant_id,
    preview.current_price,
    preview.new_price
  from tmp_bulk_preview preview
  where preview.is_valid
    and preview.excluded is false
    and preview.new_price is distinct from preview.current_price;

  if exists (
    select 1
    from tmp_bulk_preview preview
    where preview.cost_price is null
      and v_pricing_method = 'cost_markup'
      and preview.excluded is false
  ) then
    raise exception 'Missing cost prices must be excluded before applying.' using errcode = '23514';
  end if;

  if exists (
    select 1
    from tmp_bulk_preview preview
    where preview.is_valid is false
      and preview.excluded is false
  ) then
    raise exception 'Bulk price preview contains invalid rows.' using errcode = '23514';
  end if;

  if exists (
    select 1
    from tmp_bulk_expected expected
    group by expected.product_id, expected.variant_id
    having count(*) > 1
  )
  or exists (
    select 1
    from tmp_bulk_preview_targets preview
    where not exists (
        select 1
        from tmp_bulk_expected expected
        where expected.product_id = preview.product_id
          and expected.variant_id is not distinct from preview.variant_id
          and expected.current_price = preview.current_price
          and expected.new_price = preview.new_price
      )
  )
  or exists (
    select 1
    from tmp_bulk_expected expected
    where not exists (
        select 1
        from tmp_bulk_preview_targets preview
        where preview.product_id = expected.product_id
          and preview.variant_id is not distinct from expected.variant_id
          and preview.current_price = expected.current_price
          and preview.new_price = expected.new_price
      )
  ) then
    raise exception 'Prices or pricing targets changed since preview. Refresh the preview before applying.' using errcode = '40001';
  end if;

  select count(*)
    into v_applied_count
  from tmp_bulk_preview_targets preview;

  if v_applied_count <= 0 then
    raise exception 'No price changes to apply.' using errcode = '22023';
  end if;

  insert into public.bulk_price_operations (
    created_by,
    scope_type,
    scope_category_id,
    scope_product_ids,
    pricing_method,
    adjustment_type,
    adjustment_direction,
    adjustment_value,
    exclude_missing_cost,
    applied_item_count
  )
  values (
    auth.uid(),
    v_scope_type,
    nullif(btrim(coalesce(p_scope->>'category_id', '')), '')::bigint,
    coalesce(
      array(select value::bigint from jsonb_array_elements_text(coalesce(p_scope->'product_ids', '[]'::jsonb))),
      array[]::bigint[]
    ),
    v_pricing_method,
    v_adjustment_type,
    v_adjustment_direction,
    v_adjustment_value,
    v_exclude_missing_cost,
    v_applied_count
  )
  returning id into v_operation_id;

  insert into public.bulk_price_operation_items (
    operation_id,
    product_id,
    variant_id,
    item_type,
    was_active,
    old_price,
    new_price,
    cost_price
  )
  select
    v_operation_id,
    preview.product_id,
    preview.variant_id,
    preview.item_type,
    preview.is_active,
    preview.current_price,
    preview.new_price,
    preview.cost_price
  from tmp_bulk_preview preview
  where preview.is_valid
    and preview.excluded is false
    and preview.new_price is distinct from preview.current_price;

  update public.products
  set price = item.new_price
  from public.bulk_price_operation_items item
  where item.variant_id is null
    and item.operation_id = v_operation_id
    and item.product_id = public.products.id;

  update public.product_variants
  set price = item.new_price
  from public.bulk_price_operation_items item
  where item.variant_id is not null
    and item.operation_id = v_operation_id
    and item.variant_id = public.product_variants.id;

  for v_sync_product_id in
    select distinct item.product_id
    from public.bulk_price_operation_items item
    where item.operation_id = v_operation_id
      and item.variant_id is not null
    order by item.product_id
  loop
    perform public.sync_product_variant_parent_price(v_sync_product_id);
  end loop;

  return v_operation_id;
end;
$$;

create or replace function public.undo_bulk_price_operation(p_operation_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  v_sync_product_id bigint;
begin
  if public.is_admin() is not true then
    raise exception 'Only admins can undo bulk price updates.' using errcode = '42501';
  end if;

  perform 1
  from public.bulk_price_operations operation
  where operation.id = p_operation_id
  for update;

  if not found then
    raise exception 'Bulk price operation not found.' using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from public.bulk_price_operations operation
    where operation.id = p_operation_id
      and operation.status = 'undone'
  ) then
    raise exception 'Operation has already been undone.' using errcode = '23514';
  end if;

  perform 1
  from public.products product
  where product.id in (
    select distinct item.product_id
    from public.bulk_price_operation_items item
    where item.operation_id = p_operation_id
  )
  order by product.id
  for update;

  perform 1
  from public.product_variants variant
  where variant.id in (
    select item.variant_id
    from public.bulk_price_operation_items item
    where item.operation_id = p_operation_id
      and item.variant_id is not null
  )
  order by variant.id
  for update;

  if exists (
    select 1
    from public.bulk_price_operation_items item
    left join public.products product on product.id = item.product_id
    where item.operation_id = p_operation_id
      and item.variant_id is null
      and product.id is null
  )
  or exists (
    select 1
    from public.bulk_price_operation_items item
    left join public.product_variants variant on variant.id = item.variant_id
    where item.operation_id = p_operation_id
      and item.variant_id is not null
      and (
        variant.id is null
        or variant.product_id is distinct from item.product_id
      )
  ) then
    raise exception 'Undo blocked because one or more pricing targets no longer exist.' using errcode = '40001';
  end if;

  if exists (
    select 1
    from public.bulk_price_operation_items item
    join public.products product on product.id = item.product_id
    where item.operation_id = p_operation_id
      and item.variant_id is null
      and product.price <> item.new_price
  )
  or exists (
    select 1
    from public.bulk_price_operation_items item
    join public.product_variants variant on variant.id = item.variant_id
    where item.operation_id = p_operation_id
      and item.variant_id is not null
      and variant.price <> item.new_price
  ) then
    raise exception 'Undo blocked because prices changed after this operation.' using errcode = '40001';
  end if;

  update public.products
  set price = item.old_price
  from public.bulk_price_operation_items item
  where item.variant_id is null
    and item.operation_id = p_operation_id
    and item.product_id = public.products.id;

  update public.product_variants
  set price = item.old_price
  from public.bulk_price_operation_items item
  where item.variant_id is not null
    and item.operation_id = p_operation_id
    and item.variant_id = public.product_variants.id;

  for v_sync_product_id in
    select distinct item.product_id
    from public.bulk_price_operation_items item
    where item.operation_id = p_operation_id
      and item.variant_id is not null
    order by item.product_id
  loop
    perform public.sync_product_variant_parent_price(v_sync_product_id);
  end loop;

  update public.bulk_price_operations
  set status = 'undone',
      undone_at = now()
  where id = p_operation_id;
end;
$$;

revoke all on function public.round_bulk_price_egp(numeric) from public;
revoke all on function public.preview_bulk_price_update(jsonb, jsonb) from public;
revoke all on function public.apply_bulk_price_update(jsonb, jsonb, jsonb) from public;
revoke all on function public.undo_bulk_price_operation(uuid) from public;

revoke execute on function public.preview_bulk_price_update(jsonb, jsonb) from anon;
revoke execute on function public.apply_bulk_price_update(jsonb, jsonb, jsonb) from anon;
revoke execute on function public.undo_bulk_price_operation(uuid) from anon;

grant execute on function public.preview_bulk_price_update(jsonb, jsonb) to authenticated;
grant execute on function public.apply_bulk_price_update(jsonb, jsonb, jsonb) to authenticated;
grant execute on function public.undo_bulk_price_operation(uuid) to authenticated;
