alter table public.product_variants
add column if not exists old_price numeric;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'product_variants_old_price_nonnegative'
      and conrelid = 'public.product_variants'::regclass
  ) then
    alter table public.product_variants
    add constraint product_variants_old_price_nonnegative
    check (old_price is null or old_price >= 0);
  end if;
end $$;


create table if not exists public.bulk_sale_operations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  scope_type text not null check (scope_type in ('all', 'category', 'selected_products')),
  scope_category_id bigint references public.categories(id) on delete set null,
  scope_product_ids bigint[] not null default array[]::bigint[],
  discount_percent numeric not null check (discount_percent > 0 and discount_percent < 100),
  exclude_missing_cost boolean not null default false,
  exclude_below_cost boolean not null default false,
  rounding_rule text not null default 'nearest_whole_egp',
  applied_item_count integer not null default 0,
  status text not null default 'active' check (status in ('active', 'ended')),
  ended_at timestamptz
);

create table if not exists public.bulk_sale_operation_items (
  id bigint generated always as identity primary key,
  operation_id uuid not null references public.bulk_sale_operations(id) on delete cascade,
  product_id bigint not null,
  variant_id bigint,
  item_type text not null check (item_type in ('legacy', 'variant')),
  was_active boolean not null default true,
  previous_price numeric not null,
  sale_price numeric not null,
  previous_old_price numeric,
  sale_old_price numeric not null,
  cost_price numeric,
  created_at timestamptz not null default now()
);

create unique index if not exists bulk_sale_operation_items_legacy_target_uidx
on public.bulk_sale_operation_items (operation_id, product_id)
where variant_id is null;

create unique index if not exists bulk_sale_operation_items_variant_target_uidx
on public.bulk_sale_operation_items (operation_id, variant_id)
where variant_id is not null;

create table if not exists public.bulk_sale_product_snapshots (
  operation_id uuid not null references public.bulk_sale_operations(id) on delete cascade,
  product_id bigint not null,
  previous_parent_old_price numeric,
  sale_parent_price numeric,
  sale_parent_old_price numeric,
  sale_parent_variant_id bigint,
  created_at timestamptz not null default now(),
  primary key (operation_id, product_id)
);

alter table public.bulk_sale_operations enable row level security;
alter table public.bulk_sale_operation_items enable row level security;
alter table public.bulk_sale_product_snapshots enable row level security;

drop policy if exists "admins manage bulk sale operations" on public.bulk_sale_operations;
create policy "admins manage bulk sale operations"
on public.bulk_sale_operations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage bulk sale operation items" on public.bulk_sale_operation_items;
create policy "admins manage bulk sale operation items"
on public.bulk_sale_operation_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage bulk sale product snapshots" on public.bulk_sale_product_snapshots;
create policy "admins manage bulk sale product snapshots"
on public.bulk_sale_product_snapshots
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

revoke all on public.bulk_sale_operations from anon, authenticated;
revoke all on public.bulk_sale_operation_items from anon, authenticated;
revoke all on public.bulk_sale_product_snapshots from anon, authenticated;
grant select on public.bulk_sale_operations to authenticated;
grant select on public.bulk_sale_operation_items to authenticated;
grant select on public.bulk_sale_product_snapshots to authenticated;

create or replace function public.preview_bulk_sale(
  p_scope jsonb,
  p_sale jsonb
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
  current_old_price numeric,
  raw_sale_price numeric,
  sale_price numeric,
  sale_old_price numeric,
  effective_discount_percent numeric,
  sale_gross_profit numeric,
  sale_markup_percent numeric,
  sale_margin_percent numeric,
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
  v_discount_percent numeric := nullif(btrim(coalesce(p_sale->>'discount_percent', '')), '')::numeric;
  v_exclude_missing_cost boolean := coalesce((p_sale->>'exclude_missing_cost')::boolean, false);
  v_exclude_below_cost boolean := coalesce((p_sale->>'exclude_below_cost')::boolean, false);
begin
  if public.is_admin() is not true then
    raise exception 'Only admins can preview bulk sales.' using errcode = '42501';
  end if;

  if v_scope_type not in ('all', 'category', 'selected_products') then
    raise exception 'Invalid bulk sale scope.' using errcode = '22023';
  end if;

  if v_discount_percent is null or v_discount_percent <= 0 or v_discount_percent >= 100 then
    raise exception 'Sale discount percent must be greater than 0 and less than 100.' using errcode = '23514';
  end if;

  -- Acceptance examples: 199 with 30 percent off rounds to 139.
  -- Variant examples: old 180 -> new 135, old 220 -> new 165, old 280 -> new 210.
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
      product.price as current_price,
      product.old_price as current_old_price
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
      variant.price as current_price,
      variant.old_price as current_old_price
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
      unit.current_price * (1 - v_discount_percent / 100) as raw_price
    from selling_units unit
  ),
  rounded as (
    select
      calculated.*,
      public.round_bulk_price_egp(calculated.raw_price) as rounded_price
    from calculated
  ),
  flagged as (
    select
      rounded.*,
      rounded.cost_price is null as cost_missing,
      rounded.cost_price is not null and rounded.rounded_price < rounded.cost_price as below_cost
    from rounded
  )
  select
    flagged.product_id,
    flagged.variant_id,
    flagged.item_type,
    flagged.product_title,
    flagged.variant_label,
    flagged.is_active,
    flagged.cost_price,
    flagged.current_price,
    flagged.current_old_price,
    flagged.raw_price as raw_sale_price,
    flagged.rounded_price as sale_price,
    flagged.current_price as sale_old_price,
    case
      when flagged.current_price = 0 then null
      else ((flagged.current_price - flagged.rounded_price) / flagged.current_price) * 100
    end as effective_discount_percent,
    case
      when flagged.cost_price is null then null
      else flagged.rounded_price - flagged.cost_price
    end as sale_gross_profit,
    case
      when flagged.cost_price is null or flagged.cost_price = 0 then null
      else ((flagged.rounded_price - flagged.cost_price) / flagged.cost_price) * 100
    end as sale_markup_percent,
    case
      when flagged.rounded_price = 0 or flagged.cost_price is null then null
      else ((flagged.rounded_price - flagged.cost_price) / flagged.rounded_price) * 100
    end as sale_margin_percent,
    case
      when flagged.cost_missing then 'Cost unavailable'
      when flagged.below_cost then 'Below Cost'
      when flagged.rounded_price <= 0 then 'Sale price must be greater than zero'
      when flagged.current_old_price is not null and flagged.current_old_price > flagged.current_price
        then 'Item already has a compare price; the current selling price will become the new Sale old price.'
      else null
    end as warning,
    (
      flagged.rounded_price > 0
      and not (flagged.cost_missing and not v_exclude_missing_cost)
      and not (flagged.below_cost and not v_exclude_below_cost)
    ) as is_valid,
    (
      (flagged.cost_missing and v_exclude_missing_cost)
      or (flagged.below_cost and v_exclude_below_cost)
    ) as excluded
  from flagged
  order by flagged.product_id, flagged.variant_id nulls first;
end;
$$;

create or replace function public.apply_bulk_sale(
  p_scope jsonb,
  p_sale jsonb,
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
  v_category_id bigint := nullif(btrim(coalesce(p_scope->>'category_id', '')), '')::bigint;
  v_discount_percent numeric := nullif(btrim(coalesce(p_sale->>'discount_percent', '')), '')::numeric;
  v_exclude_missing_cost boolean := coalesce((p_sale->>'exclude_missing_cost')::boolean, false);
  v_exclude_below_cost boolean := coalesce((p_sale->>'exclude_below_cost')::boolean, false);
  v_sync_product_id bigint;
begin
  if public.is_admin() is not true then
    raise exception 'Only admins can apply bulk sales.' using errcode = '42501';
  end if;

  create temporary table tmp_bulk_sale_preview on commit drop as
  select *
  from public.preview_bulk_sale(p_scope, p_sale);

  perform 1
  from public.products product
  where product.id in (select distinct preview.product_id from tmp_bulk_sale_preview preview)
  order by product.id
  for update;

  perform 1
  from public.product_variants variant
  where variant.id in (
    select preview.variant_id
    from tmp_bulk_sale_preview preview
    where preview.variant_id is not null
  )
  order by variant.id
  for update;

  perform 1
  from public.product_costs product_cost
  where product_cost.product_id in (
    select preview.product_id
    from tmp_bulk_sale_preview preview
    where preview.variant_id is null
  )
  order by product_cost.product_id
  for update;

  perform 1
  from public.product_variant_costs variant_cost
  where variant_cost.variant_id in (
    select preview.variant_id
    from tmp_bulk_sale_preview preview
    where preview.variant_id is not null
  )
  order by variant_cost.variant_id
  for update;

  truncate table tmp_bulk_sale_preview;
  insert into tmp_bulk_sale_preview
  select *
  from public.preview_bulk_sale(p_scope, p_sale);

  create temporary table tmp_bulk_sale_expected on commit drop as
  select
    (expected->>'product_id')::bigint as product_id,
    nullif(btrim(coalesce(expected->>'variant_id', '')), '')::bigint as variant_id,
    (expected->>'is_active')::boolean as is_active,
    (expected->>'current_price')::numeric as current_price,
    nullif(btrim(coalesce(expected->>'current_old_price', '')), '')::numeric as current_old_price,
    nullif(btrim(coalesce(expected->>'cost_price', '')), '')::numeric as cost_price,
    (expected->>'sale_price')::numeric as sale_price,
    (expected->>'sale_old_price')::numeric as sale_old_price,
    (expected->>'is_valid')::boolean as is_valid,
    (expected->>'excluded')::boolean as excluded
  from jsonb_array_elements(coalesce(p_expected_items, '[]'::jsonb)) expected;

  if exists (
    select 1
    from tmp_bulk_sale_expected expected
    group by expected.product_id, expected.variant_id
    having count(*) > 1
  )
  or exists (
    select 1
    from tmp_bulk_sale_preview preview
    where not exists (
      select 1
      from tmp_bulk_sale_expected expected
      where expected.product_id = preview.product_id
        and expected.variant_id is not distinct from preview.variant_id
        and expected.is_active is not distinct from preview.is_active
        and expected.current_price = preview.current_price
        and expected.current_old_price is not distinct from preview.current_old_price
        and expected.cost_price is not distinct from preview.cost_price
        and expected.sale_price = preview.sale_price
        and expected.sale_old_price = preview.sale_old_price
        and expected.is_valid is not distinct from preview.is_valid
        and expected.excluded is not distinct from preview.excluded
    )
  )
  or exists (
    select 1
    from tmp_bulk_sale_expected expected
    where not exists (
      select 1
      from tmp_bulk_sale_preview preview
      where preview.product_id = expected.product_id
        and preview.variant_id is not distinct from expected.variant_id
        and preview.is_active is not distinct from expected.is_active
        and preview.current_price = expected.current_price
        and preview.current_old_price is not distinct from expected.current_old_price
        and preview.cost_price is not distinct from expected.cost_price
        and preview.sale_price = expected.sale_price
        and preview.sale_old_price = expected.sale_old_price
        and preview.is_valid is not distinct from expected.is_valid
        and preview.excluded is not distinct from expected.excluded
    )
  ) then
    raise exception 'Prices, costs, or Sale targets changed since preview. Refresh the preview before applying.' using errcode = '40001';
  end if;

  if exists (
    select 1
    from tmp_bulk_sale_preview preview
    where preview.cost_price is null
      and preview.excluded is false
  ) then
    raise exception 'Missing cost sale rows must be excluded before applying.' using errcode = '23514';
  end if;

  if exists (
    select 1
    from tmp_bulk_sale_preview preview
    where preview.cost_price is not null
      and preview.sale_price < preview.cost_price
      and preview.excluded is false
  ) then
    raise exception 'Below-cost sale rows must be excluded before applying.' using errcode = '23514';
  end if;

  if exists (
    select 1
    from tmp_bulk_sale_preview preview
    where preview.is_valid is false
      and preview.excluded is false
  ) then
    raise exception 'Bulk sale preview contains invalid rows.' using errcode = '23514';
  end if;

  create temporary table tmp_bulk_sale_targets on commit drop as
  select
    preview.product_id,
    preview.variant_id,
    preview.is_active,
    preview.current_price,
    preview.current_old_price,
    preview.cost_price,
    preview.sale_price,
    preview.sale_old_price
  from tmp_bulk_sale_preview preview
  where preview.is_valid
    and preview.excluded is false
    and preview.sale_price is distinct from preview.current_price;

  select count(*)
    into v_applied_count
  from tmp_bulk_sale_targets target;

  if v_applied_count <= 0 then
    raise exception 'No sale price changes to apply.' using errcode = '22023';
  end if;

  insert into public.bulk_sale_operations (
    created_by,
    scope_type,
    scope_category_id,
    scope_product_ids,
    discount_percent,
    exclude_missing_cost,
    exclude_below_cost,
    applied_item_count
  )
  values (
    auth.uid(),
    v_scope_type,
    v_category_id,
    coalesce(
      array(select value::bigint from jsonb_array_elements_text(coalesce(p_scope->'product_ids', '[]'::jsonb))),
      array[]::bigint[]
    ),
    v_discount_percent,
    v_exclude_missing_cost,
    v_exclude_below_cost,
    v_applied_count
  )
  returning id into v_operation_id;

  insert into public.bulk_sale_operation_items (
    operation_id,
    product_id,
    variant_id,
    item_type,
    was_active,
    previous_price,
    sale_price,
    previous_old_price,
    sale_old_price,
    cost_price
  )
  select
    v_operation_id,
    preview.product_id,
    preview.variant_id,
    preview.item_type,
    preview.is_active,
    preview.current_price,
    preview.sale_price,
    preview.current_old_price,
    preview.sale_old_price,
    preview.cost_price
  from tmp_bulk_sale_preview preview
  where preview.is_valid
    and preview.excluded is false
    and preview.sale_price is distinct from preview.current_price;

  insert into public.bulk_sale_product_snapshots (
    operation_id,
    product_id,
    previous_parent_old_price,
    sale_parent_price,
    sale_parent_old_price,
    sale_parent_variant_id
  )
  select
    v_operation_id,
    product.id,
    product.old_price,
    null::numeric,
    null::numeric,
    null::bigint
  from public.products product
  where product.inventory_model = 'variants'
    and product.id in (
      select distinct item.product_id
      from public.bulk_sale_operation_items item
      where item.operation_id = v_operation_id
        and item.variant_id is not null
    );

  update public.products
  set old_price = item.sale_old_price,
      price = item.sale_price
  from public.bulk_sale_operation_items item
  where item.variant_id is null
    and item.operation_id = v_operation_id
    and item.product_id = public.products.id;

  update public.product_variants
  set old_price = item.sale_old_price,
      price = item.sale_price
  from public.bulk_sale_operation_items item
  where item.variant_id is not null
    and item.operation_id = v_operation_id
    and item.variant_id = public.product_variants.id;

  for v_sync_product_id in
    select distinct item.product_id
    from public.bulk_sale_operation_items item
    where item.operation_id = v_operation_id
      and item.variant_id is not null
    order by item.product_id
  loop
    perform public.sync_product_variant_parent_price(v_sync_product_id);
  end loop;

  update public.bulk_sale_product_snapshots snapshot
  set sale_parent_price = cheapest_variant.price,
      sale_parent_old_price = cheapest_variant.old_price,
      sale_parent_variant_id = cheapest_variant.variant_id
  from public.products product
  left join lateral (
    select variant.id as variant_id,
           variant.price as price,
           variant.old_price as old_price
    from public.product_variants variant
    where variant.product_id = product.id
      and variant.is_active
    order by variant.price asc, variant.id asc
    limit 1
  ) cheapest_variant on true
  where snapshot.operation_id = v_operation_id
    and snapshot.product_id = product.id;

  update public.products
  set old_price = snapshot.sale_parent_old_price
  from public.bulk_sale_product_snapshots snapshot
  where snapshot.operation_id = v_operation_id
    and snapshot.product_id = public.products.id;

  return v_operation_id;
end;
$$;

create or replace function public.end_bulk_sale(p_operation_id uuid)
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
    raise exception 'Only admins can end bulk sales.' using errcode = '42501';
  end if;

  perform 1
  from public.bulk_sale_operations operation
  where operation.id = p_operation_id
  for update;

  if not found then
    raise exception 'Bulk Sale operation not found.' using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from public.bulk_sale_operations operation
    where operation.id = p_operation_id
      and operation.status = 'ended'
  ) then
    raise exception 'Bulk Sale has already ended.' using errcode = '23514';
  end if;

  perform 1
  from public.products product
  where product.id in (
    select distinct item.product_id
    from public.bulk_sale_operation_items item
    where item.operation_id = p_operation_id
    union
    select snapshot.product_id
    from public.bulk_sale_product_snapshots snapshot
    where snapshot.operation_id = p_operation_id
  )
  order by product.id
  for update;

  perform 1
  from public.product_variants variant
  where variant.id in (
    select item.variant_id
    from public.bulk_sale_operation_items item
    where item.operation_id = p_operation_id
      and item.variant_id is not null
  )
  order by variant.id
  for update;

  perform 1
  from public.product_variants variant
  where variant.product_id in (
    select snapshot.product_id
    from public.bulk_sale_product_snapshots snapshot
    where snapshot.operation_id = p_operation_id
  )
  order by variant.product_id, variant.id
  for update;

  if exists (
    select 1
    from public.bulk_sale_operation_items item
    left join public.products product on product.id = item.product_id
    where item.operation_id = p_operation_id
      and item.variant_id is null
      and product.id is null
  )
  or exists (
    select 1
    from public.bulk_sale_operation_items item
    left join public.product_variants variant on variant.id = item.variant_id
    where item.operation_id = p_operation_id
      and item.variant_id is not null
      and (
        variant.id is null
        or variant.product_id is distinct from item.product_id
      )
  )
  or exists (
    select 1
    from public.bulk_sale_product_snapshots snapshot
    left join public.products product on product.id = snapshot.product_id
    where snapshot.operation_id = p_operation_id
      and product.id is null
  ) then
    raise exception 'Undo blocked because one or more Sale pricing targets no longer exist.' using errcode = '40001';
  end if;

  if exists (
    select 1
    from public.bulk_sale_operation_items item
    join public.products product on product.id = item.product_id
    where item.operation_id = p_operation_id
      and item.variant_id is null
      and (
        product.price <> item.sale_price
        or product.old_price is distinct from item.sale_old_price
      )
  )
  or exists (
    select 1
    from public.bulk_sale_operation_items item
    join public.product_variants variant on variant.id = item.variant_id
    where item.operation_id = p_operation_id
      and item.variant_id is not null
      and (
        variant.price <> item.sale_price
        or variant.old_price is distinct from item.sale_old_price
        or variant.is_active is distinct from item.was_active
      )
  )
  or exists (
    select 1
    from public.bulk_sale_product_snapshots snapshot
    join public.products product on product.id = snapshot.product_id
    where snapshot.operation_id = p_operation_id
      and (
        product.price is distinct from snapshot.sale_parent_price
        or product.old_price is distinct from snapshot.sale_parent_old_price
      )
  )
  or exists (
    select 1
    from public.bulk_sale_product_snapshots snapshot
    join public.products product on product.id = snapshot.product_id
    left join lateral (
      select variant.id as variant_id,
             variant.price as price,
             variant.old_price as old_price
      from public.product_variants variant
      where variant.product_id = snapshot.product_id
        and variant.is_active
      order by variant.price asc, variant.id asc
      limit 1
    ) cheapest_variant on true
    where snapshot.operation_id = p_operation_id
      and (
        cheapest_variant.variant_id is distinct from snapshot.sale_parent_variant_id
        or cheapest_variant.price is distinct from snapshot.sale_parent_price
        or cheapest_variant.old_price is distinct from snapshot.sale_parent_old_price
      )
  ) then
    raise exception 'End Sale blocked because pricing changed after this Sale was created.' using errcode = '40001';
  end if;

  update public.products
  set price = item.previous_price,
      old_price = item.previous_old_price
  from public.bulk_sale_operation_items item
  where item.variant_id is null
    and item.operation_id = p_operation_id
    and item.product_id = public.products.id;

  update public.product_variants
  set price = item.previous_price,
      old_price = item.previous_old_price
  from public.bulk_sale_operation_items item
  where item.variant_id is not null
    and item.operation_id = p_operation_id
    and item.variant_id = public.product_variants.id;

  for v_sync_product_id in
    select distinct item.product_id
    from public.bulk_sale_operation_items item
    where item.operation_id = p_operation_id
      and item.variant_id is not null
    order by item.product_id
  loop
    perform public.sync_product_variant_parent_price(v_sync_product_id);
  end loop;

  update public.products
  set old_price = snapshot.previous_parent_old_price
  from public.bulk_sale_product_snapshots snapshot
  where snapshot.operation_id = p_operation_id
    and snapshot.product_id = public.products.id;

  update public.bulk_sale_operations
  set status = 'ended',
      ended_at = now()
  where id = p_operation_id;
end;
$$;

revoke all on function public.preview_bulk_sale(jsonb, jsonb) from public;
revoke all on function public.apply_bulk_sale(jsonb, jsonb, jsonb) from public;
revoke all on function public.end_bulk_sale(uuid) from public;

revoke execute on function public.preview_bulk_sale(jsonb, jsonb) from anon;
revoke execute on function public.apply_bulk_sale(jsonb, jsonb, jsonb) from anon;
revoke execute on function public.end_bulk_sale(uuid) from anon;

grant execute on function public.preview_bulk_sale(jsonb, jsonb) to authenticated;
grant execute on function public.apply_bulk_sale(jsonb, jsonb, jsonb) to authenticated;
grant execute on function public.end_bulk_sale(uuid) to authenticated;
