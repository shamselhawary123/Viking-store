create or replace function public.build_checkout_items(p_items jsonb)
returns table (
  product_id integer,
  product_name text,
  product_image text,
  product_price numeric,
  color text,
  size text,
  quantity integer,
  category_id integer,
  line_total numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    product.id as product_id,
    product.title as product_name,
    coalesce(item->>'image', product.cover_image) as product_image,
    product.price::numeric as product_price,
    coalesce(item->>'color', '') as color,
    coalesce(item->>'size', '') as size,
    greatest(coalesce((item->>'quantity')::integer, 0), 0) as quantity,
    product.category_id as category_id,
    round(product.price::numeric * greatest(coalesce((item->>'quantity')::integer, 0), 0), 2) as line_total
  from jsonb_array_elements(p_items) item
  join public.products product on product.id = (item->>'id')::integer
  where greatest(coalesce((item->>'quantity')::integer, 0), 0) > 0
$$;

create or replace function public.calculate_checkout_coupon_discount(
  p_coupon public.coupons,
  p_items jsonb,
  p_user_id uuid default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_subtotal numeric(12, 2) := 0;
  v_eligible_subtotal numeric(12, 2) := 0;
  v_discount numeric(12, 2) := 0;
  v_total_uses integer := 0;
  v_user_uses integer := 0;
  v_has_product_restrictions boolean := false;
  v_has_category_restrictions boolean := false;
begin
  select coalesce(round(sum(item.line_total), 2), 0)
    into v_subtotal
  from public.build_checkout_items(p_items) item;

  if p_coupon.id is null then
    return jsonb_build_object('ok', false, 'error', 'Coupon not found.', 'discount_amount', 0, 'subtotal', v_subtotal, 'total', v_subtotal);
  end if;

  if p_coupon.active = false then
    return jsonb_build_object('ok', false, 'error', 'Coupon is inactive.', 'discount_amount', 0, 'subtotal', v_subtotal, 'total', v_subtotal);
  end if;

  if p_coupon.starts_at is not null and p_coupon.starts_at > v_now then
    return jsonb_build_object('ok', false, 'error', 'Coupon is not active yet.', 'discount_amount', 0, 'subtotal', v_subtotal, 'total', v_subtotal);
  end if;

  if p_coupon.expires_at is not null and p_coupon.expires_at < v_now then
    return jsonb_build_object('ok', false, 'error', 'Coupon has expired.', 'discount_amount', 0, 'subtotal', v_subtotal, 'total', v_subtotal);
  end if;

  if v_subtotal < p_coupon.minimum_order_amount then
    return jsonb_build_object('ok', false, 'error', 'Minimum order amount not met.', 'discount_amount', 0, 'subtotal', v_subtotal, 'total', v_subtotal);
  end if;

  select count(*) into v_total_uses
  from public.coupon_redemptions
  where coupon_id = p_coupon.id;

  if p_coupon.max_total_uses is not null and v_total_uses >= p_coupon.max_total_uses then
    return jsonb_build_object('ok', false, 'error', 'Coupon usage limit has been reached.', 'discount_amount', 0, 'subtotal', v_subtotal, 'total', v_subtotal);
  end if;

  if p_coupon.max_uses_per_user is not null then
    if p_user_id is null then
      return jsonb_build_object('ok', false, 'error', 'Sign in to use this coupon.', 'requires_authentication', true, 'discount_amount', 0, 'subtotal', v_subtotal, 'total', v_subtotal);
    end if;

    select count(*) into v_user_uses
    from public.coupon_redemptions
    where coupon_id = p_coupon.id
      and user_id = p_user_id;

    if v_user_uses >= p_coupon.max_uses_per_user then
      return jsonb_build_object('ok', false, 'error', 'You have already used this coupon.', 'discount_amount', 0, 'subtotal', v_subtotal, 'total', v_subtotal);
    end if;
  end if;

  select exists(select 1 from public.coupon_products where coupon_id = p_coupon.id)
    into v_has_product_restrictions;
  select exists(select 1 from public.coupon_categories where coupon_id = p_coupon.id)
    into v_has_category_restrictions;

  select coalesce(round(sum(item.line_total), 2), 0)
    into v_eligible_subtotal
  from public.build_checkout_items(p_items) item
  where (not v_has_product_restrictions and not v_has_category_restrictions)
    or exists (
      select 1
      from public.coupon_products
      where coupon_id = p_coupon.id
        and product_id = item.product_id
    )
    or exists (
      select 1
      from public.coupon_categories
      where coupon_id = p_coupon.id
        and category_id = item.category_id
    );

  if v_eligible_subtotal <= 0 then
    return jsonb_build_object('ok', false, 'error', 'Coupon does not apply to the items in your cart.', 'discount_amount', 0, 'subtotal', v_subtotal, 'eligible_subtotal', 0, 'total', v_subtotal);
  end if;

  if p_coupon.discount_type = 'percentage' then
    v_discount := round(v_eligible_subtotal * (p_coupon.discount_value / 100), 2);
    if p_coupon.maximum_discount_amount is not null then
      v_discount := least(v_discount, p_coupon.maximum_discount_amount);
    end if;
  elsif p_coupon.discount_type = 'fixed_amount' then
    v_discount := least(p_coupon.discount_value, v_eligible_subtotal);
  else
    return jsonb_build_object('ok', false, 'error', 'Coupon discount type is invalid.', 'discount_amount', 0, 'subtotal', v_subtotal, 'total', v_subtotal);
  end if;

  v_discount := round(least(greatest(v_discount, 0), v_subtotal), 2);

  return jsonb_build_object(
    'ok', true,
    'error', '',
    'coupon_id', p_coupon.id,
    'code', p_coupon.code,
    'discount_amount', v_discount,
    'subtotal', v_subtotal,
    'eligible_subtotal', v_eligible_subtotal,
    'total', round(greatest(v_subtotal - v_discount, 0), 2)
  );
end;
$$;

create or replace function public.preview_checkout_coupon(
  p_code text,
  p_items jsonb
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_coupon public.coupons;
begin
  if p_code is null or btrim(p_code) = '' then
    return jsonb_build_object('ok', false, 'error', 'Enter a coupon code.', 'discount_amount', 0);
  end if;

  select *
    into v_coupon
  from public.coupons
  where upper(btrim(code)) = upper(regexp_replace(btrim(p_code), '\s+', '', 'g'))
  limit 1;

  return public.calculate_checkout_coupon_discount(v_coupon, p_items, auth.uid());
end;
$$;

create or replace function public.create_checkout_order(
  p_order_id uuid,
  p_items jsonb,
  p_customer jsonb,
  p_coupon_code text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_is_guest boolean := coalesce((p_customer->>'is_guest')::boolean, true);
  v_coupon public.coupons;
  v_coupon_result jsonb;
  v_discount numeric(12, 2) := 0;
  v_subtotal numeric(12, 2) := 0;
  v_total numeric(12, 2) := 0;
  v_item_count integer := 0;
begin
  if p_order_id is null then
    raise exception 'Order id is required.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty.';
  end if;

  select count(*), coalesce(round(sum(item.line_total), 2), 0)
    into v_item_count, v_subtotal
  from public.build_checkout_items(p_items) item;

  if v_item_count <> jsonb_array_length(p_items) then
    raise exception 'One or more cart products could not be found.';
  end if;

  if v_subtotal <= 0 then
    raise exception 'Cart total must be greater than zero.';
  end if;

  if not v_is_guest and v_user_id is null then
    raise exception 'Please login first.';
  end if;

  if p_coupon_code is not null and btrim(p_coupon_code) <> '' then
    select *
      into v_coupon
    from public.coupons
    where upper(btrim(code)) = upper(regexp_replace(btrim(p_coupon_code), '\s+', '', 'g'))
    for update;

    v_coupon_result := public.calculate_checkout_coupon_discount(v_coupon, p_items, v_user_id);

    if coalesce((v_coupon_result->>'ok')::boolean, false) = false then
      raise exception '%', coalesce(v_coupon_result->>'error', 'Coupon is invalid.');
    end if;

    v_discount := (v_coupon_result->>'discount_amount')::numeric;
  end if;

  v_total := round(greatest(v_subtotal - v_discount, 0), 2);

  insert into public.orders (
    id,
    user_id,
    total_price,
    status,
    payment_method,
    full_name,
    phone,
    city,
    address,
    notes,
    guest_name,
    guest_phone,
    guest_city,
    guest_address,
    guest_notes,
    shipping_cost,
    discount,
    payment_status
  )
  values (
    p_order_id,
    case when v_is_guest then null else v_user_id end,
    v_total,
    'pending',
    'cash',
    case when v_is_guest then null else nullif(btrim(p_customer->>'full_name'), '') end,
    case when v_is_guest then null else nullif(btrim(p_customer->>'phone'), '') end,
    case when v_is_guest then null else nullif(btrim(p_customer->>'city'), '') end,
    case when v_is_guest then null else nullif(btrim(p_customer->>'address'), '') end,
    case when v_is_guest then null else nullif(btrim(p_customer->>'notes'), '') end,
    case when v_is_guest then nullif(btrim(p_customer->>'full_name'), '') else null end,
    case when v_is_guest then nullif(btrim(p_customer->>'phone'), '') else null end,
    case when v_is_guest then nullif(btrim(p_customer->>'city'), '') else null end,
    case when v_is_guest then nullif(btrim(p_customer->>'address'), '') else null end,
    case when v_is_guest then nullif(btrim(p_customer->>'notes'), '') else null end,
    0,
    v_discount,
    'unpaid'
  );

  insert into public.order_items (
    order_id,
    product_id,
    product_name,
    product_image,
    product_price,
    color,
    size,
    quantity
  )
  select
    p_order_id,
    item.product_id,
    item.product_name,
    item.product_image,
    item.product_price,
    item.color,
    item.size,
    item.quantity
  from public.build_checkout_items(p_items) item;

  if v_coupon.id is not null then
    insert into public.coupon_redemptions (
      coupon_id,
      user_id,
      order_id,
      discount_amount
    )
    values (
      v_coupon.id,
      case when v_is_guest then null else v_user_id end,
      p_order_id,
      v_discount
    );
  end if;

  return jsonb_build_object(
    'id', p_order_id,
    'user_id', case when v_is_guest then null else v_user_id end,
    'total_price', v_total,
    'discount', v_discount,
    'shipping_cost', 0,
    'payment_status', 'unpaid',
    'status', 'pending',
    'coupon_id', v_coupon.id
  );
end;
$$;

revoke all on function public.build_checkout_items(jsonb) from public;
revoke all on function public.calculate_checkout_coupon_discount(public.coupons, jsonb, uuid) from public;
revoke all on function public.preview_checkout_coupon(text, jsonb) from public;
revoke all on function public.create_checkout_order(uuid, jsonb, jsonb, text) from public;

grant execute on function public.preview_checkout_coupon(text, jsonb) to anon, authenticated;
grant execute on function public.create_checkout_order(uuid, jsonb, jsonb, text) to anon, authenticated;
