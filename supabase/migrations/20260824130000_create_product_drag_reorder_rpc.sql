create or replace function public.move_product_shop_position_to(
  p_product_id bigint,
  p_previous_product_id bigint,
  p_next_product_id bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id bigint;
  v_remaining_count integer;
  v_expected_next_id bigint;
  v_expected_previous_id bigint;
  v_previous_position bigint;
  v_next_position bigint;
  v_new_position bigint;
  v_needs_rebalance boolean := false;
  v_order_ids bigint[];
  v_insert_after integer;
begin
  if public.is_admin() is not true then
    raise exception 'Only admins can reorder products.'
      using errcode = '42501';
  end if;

  if p_previous_product_id = p_product_id or p_next_product_id = p_product_id then
    raise exception 'Destination is stale or invalid.';
  end if;

  if p_previous_product_id is not null and p_previous_product_id = p_next_product_id then
    raise exception 'Destination is stale or invalid.';
  end if;

  perform pg_advisory_xact_lock(hashtext('products_shop_position'));
  set constraints products_shop_position_unique deferred;

  perform 1
  from public.products
  order by shop_position asc, id asc
  for update;

  select id
  into v_product_id
  from public.products
  where id = p_product_id;

  if v_product_id is null then
    raise exception 'Product not found.';
  end if;

  select count(*)
  into v_remaining_count
  from public.products
  where id <> p_product_id;

  if p_previous_product_id is null and p_next_product_id is null then
    if v_remaining_count = 0 then
      return;
    end if;

    raise exception 'Destination is stale or invalid.';
  end if;

  if p_previous_product_id is null then
    select id
    into v_expected_next_id
    from public.products
    where id <> p_product_id
    order by shop_position asc, id asc
    limit 1;

    if v_expected_next_id is distinct from p_next_product_id then
      raise exception 'Destination is stale or invalid.';
    end if;
  elsif p_next_product_id is null then
    select id
    into v_expected_previous_id
    from public.products
    where id <> p_product_id
    order by shop_position desc, id desc
    limit 1;

    if v_expected_previous_id is distinct from p_previous_product_id then
      raise exception 'Destination is stale or invalid.';
    end if;
  else
    with ordered_products as (
      select
        id,
        lead(id) over (order by shop_position asc, id asc) as next_id
      from public.products
      where id <> p_product_id
    )
    select next_id
    into v_expected_next_id
    from ordered_products
    where id = p_previous_product_id;

    if v_expected_next_id is distinct from p_next_product_id then
      raise exception 'Destination is stale or invalid.';
    end if;
  end if;

  if p_previous_product_id is not null then
    select shop_position
    into v_previous_position
    from public.products
    where id = p_previous_product_id;
  end if;

  if p_next_product_id is not null then
    select shop_position
    into v_next_position
    from public.products
    where id = p_next_product_id;
  end if;

  if p_previous_product_id is null then
    if v_next_position <= -9223372036854774808 then
      v_needs_rebalance := true;
    else
      v_new_position := v_next_position - 1000;
    end if;
  elsif p_next_product_id is null then
    if v_previous_position >= 9223372036854774807 then
      v_needs_rebalance := true;
    else
      v_new_position := v_previous_position + 1000;
    end if;
  elsif (v_next_position::numeric - v_previous_position::numeric) > 1 then
    v_new_position := floor(
      v_previous_position::numeric + ((v_next_position::numeric - v_previous_position::numeric) / 2)
    )::bigint;
  else
    v_needs_rebalance := true;
  end if;

  if not v_needs_rebalance then
    update public.products
    set shop_position = v_new_position
    where id = p_product_id;

    return;
  end if;

  select coalesce(array_agg(id order by shop_position asc, id asc), '{}'::bigint[])
  into v_order_ids
  from public.products
  where id <> p_product_id;

  if p_previous_product_id is null then
    v_order_ids := array_prepend(p_product_id, v_order_ids);
  elsif p_next_product_id is null then
    v_order_ids := array_append(v_order_ids, p_product_id);
  else
    select ordinality
    into v_insert_after
    from unnest(v_order_ids) with ordinality as ordered(id, ordinality)
    where id = p_previous_product_id;

    if v_insert_after is null then
      raise exception 'Destination is stale or invalid.';
    end if;

    select array_agg(id order by sort_order)
    into v_order_ids
    from (
      select id, ordinality::numeric as sort_order
      from unnest(v_order_ids) with ordinality as ordered(id, ordinality)
      union all
      select p_product_id, v_insert_after::numeric + 0.5
    ) reordered_products;
  end if;

  with new_order as (
    select id, row_number() over (order by ordinality) as new_position_index
    from unnest(v_order_ids) with ordinality as ordered(id, ordinality)
  )
  update public.products
  set shop_position = new_order.new_position_index * 1000
  from new_order
  where products.id = new_order.id;
end;
$$;

revoke all on function public.move_product_shop_position_to(bigint, bigint, bigint) from public;
grant execute on function public.move_product_shop_position_to(bigint, bigint, bigint) to authenticated;
