alter table public.orders
  add column if not exists governorate_code text;

create table if not exists public.shipping_settings (
  id boolean primary key default true,
  shipping_enabled boolean not null default true,
  free_shipping_all_orders boolean not null default true,
  free_shipping_threshold_enabled boolean not null default false,
  free_shipping_threshold numeric(12, 2),
  default_shipping_fee numeric(12, 2),
  updated_at timestamptz not null default now(),
  constraint shipping_settings_singleton check (id),
  constraint default_shipping_fee_non_negative check (default_shipping_fee is null or default_shipping_fee >= 0),
  constraint free_shipping_threshold_positive check (free_shipping_threshold is null or free_shipping_threshold > 0),
  constraint free_shipping_threshold_required_when_enabled check (
    free_shipping_threshold_enabled = false
    or (free_shipping_threshold is not null and free_shipping_threshold > 0)
  )
);

insert into public.shipping_settings (id)
values (true)
on conflict (id) do nothing;

create table if not exists public.shipping_governorates (
  code text primary key,
  name_ar text not null,
  name_en text not null,
  shipping_fee numeric(12, 2),
  is_enabled boolean not null default true,
  sort_order integer not null unique,
  updated_at timestamptz not null default now(),
  constraint shipping_governorates_code_format check (code ~ '^[a-z0-9-]+$'),
  constraint shipping_governorates_fee_non_negative check (shipping_fee is null or shipping_fee >= 0)
);

insert into public.shipping_governorates (code, name_ar, name_en, sort_order)
values
  ('cairo', 'القاهرة', 'Cairo', 10),
  ('giza', 'الجيزة', 'Giza', 20),
  ('alexandria', 'الإسكندرية', 'Alexandria', 30),
  ('qalyubia', 'القليوبية', 'Qalyubia', 40),
  ('sharqia', 'الشرقية', 'Sharqia', 50),
  ('dakahlia', 'الدقهلية', 'Dakahlia', 60),
  ('gharbia', 'الغربية', 'Gharbia', 70),
  ('monufia', 'المنوفية', 'Monufia', 80),
  ('beheira', 'البحيرة', 'Beheira', 90),
  ('kafr-el-sheikh', 'كفر الشيخ', 'Kafr El Sheikh', 100),
  ('damietta', 'دمياط', 'Damietta', 110),
  ('port-said', 'بورسعيد', 'Port Said', 120),
  ('ismailia', 'الإسماعيلية', 'Ismailia', 130),
  ('suez', 'السويس', 'Suez', 140),
  ('fayoum', 'الفيوم', 'Fayoum', 150),
  ('beni-suef', 'بني سويف', 'Beni Suef', 160),
  ('minya', 'المنيا', 'Minya', 170),
  ('assiut', 'أسيوط', 'Assiut', 180),
  ('sohag', 'سوهاج', 'Sohag', 190),
  ('qena', 'قنا', 'Qena', 200),
  ('luxor', 'الأقصر', 'Luxor', 210),
  ('aswan', 'أسوان', 'Aswan', 220),
  ('red-sea', 'البحر الأحمر', 'Red Sea', 230),
  ('new-valley', 'الوادي الجديد', 'New Valley', 240),
  ('matrouh', 'مطروح', 'Matrouh', 250),
  ('north-sinai', 'شمال سيناء', 'North Sinai', 260),
  ('south-sinai', 'جنوب سيناء', 'South Sinai', 270)
on conflict (code) do update
set name_ar = excluded.name_ar,
    name_en = excluded.name_en,
    sort_order = excluded.sort_order;

alter table public.shipping_settings enable row level security;
alter table public.shipping_governorates enable row level security;

drop policy if exists "Anyone can read shipping settings" on public.shipping_settings;
create policy "Anyone can read shipping settings"
  on public.shipping_settings
  for select
  using (true);

drop policy if exists "Anyone can read enabled governorates" on public.shipping_governorates;
create policy "Anyone can read enabled governorates"
  on public.shipping_governorates
  for select
  using (is_enabled = true or public.is_admin() is true);

revoke all on public.shipping_settings from anon, authenticated;
revoke all on public.shipping_governorates from anon, authenticated;
grant select on public.shipping_settings to anon, authenticated;
grant select on public.shipping_governorates to anon, authenticated;

create or replace function public.calculate_checkout_shipping(
  p_subtotal numeric,
  p_discount numeric,
  p_governorate_code text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  settings public.shipping_settings;
  governorate public.shipping_governorates;
  v_code text := nullif(btrim(p_governorate_code), '');
  v_merchandise_total numeric(12, 2) := round(greatest(coalesce(p_subtotal, 0) - coalesce(p_discount, 0), 0), 2);
  v_shipping_cost numeric(12, 2);
begin
  select *
    into settings
  from public.shipping_settings
  where id = true
  limit 1;

  if not found or settings.shipping_enabled = false then
    return jsonb_build_object('ok', false, 'error', 'Shipping is currently unavailable.', 'shipping_cost', 0, 'shipping_enabled', false);
  end if;

  if settings.free_shipping_all_orders = true and v_code is null then
    return jsonb_build_object('ok', true, 'error', '', 'shipping_cost', 0, 'free_shipping_applied', true, 'shipping_required', false, 'shipping_enabled', true, 'governorate_code', null);
  end if;

  if v_code is null then
    return jsonb_build_object('ok', false, 'error', 'Select a governorate.', 'shipping_cost', 0, 'shipping_required', true, 'shipping_enabled', true);
  end if;

  select *
    into governorate
  from public.shipping_governorates
  where code = v_code
  limit 1;

  if not found or governorate.is_enabled = false then
    return jsonb_build_object('ok', false, 'error', 'Shipping is not available for this governorate.', 'shipping_cost', 0, 'shipping_required', true, 'shipping_enabled', true);
  end if;

  if settings.free_shipping_all_orders = true then
    return jsonb_build_object('ok', true, 'error', '', 'shipping_cost', 0, 'free_shipping_applied', true, 'shipping_required', false, 'shipping_enabled', true, 'governorate_code', v_code);
  end if;

  if settings.free_shipping_threshold_enabled = true
    and settings.free_shipping_threshold is not null
    and v_merchandise_total >= settings.free_shipping_threshold
  then
    return jsonb_build_object('ok', true, 'error', '', 'shipping_cost', 0, 'free_shipping_applied', true, 'shipping_required', false, 'shipping_enabled', true, 'governorate_code', v_code);
  end if;

  v_shipping_cost := coalesce(governorate.shipping_fee, settings.default_shipping_fee);

  if v_shipping_cost is null then
    return jsonb_build_object('ok', false, 'error', 'Shipping rate unavailable for this governorate.', 'shipping_cost', 0, 'shipping_required', true, 'shipping_enabled', true, 'governorate_code', v_code);
  end if;

  return jsonb_build_object(
    'ok', true,
    'error', '',
    'shipping_cost', round(v_shipping_cost, 2),
    'free_shipping_applied', v_shipping_cost = 0,
    'shipping_required', true,
    'shipping_enabled', true,
    'governorate_code', v_code
  );
end;
$$;

create or replace function public.preview_checkout_totals(
  p_items jsonb,
  p_coupon_code text default null,
  p_governorate_code text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_coupon public.coupons;
  v_coupon_result jsonb;
  v_shipping_result jsonb;
  v_discount numeric(12, 2) := 0;
  v_subtotal numeric(12, 2) := 0;
  v_shipping_cost numeric(12, 2) := 0;
  v_total numeric(12, 2) := 0;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('ok', false, 'error', 'Cart is empty.', 'subtotal', 0, 'discount_amount', 0, 'shipping_cost', 0, 'total', 0);
  end if;

  select coalesce(round(sum(item.line_total), 2), 0)
    into v_subtotal
  from public.build_checkout_items(p_items) item;

  if p_coupon_code is not null and btrim(p_coupon_code) <> '' then
    select *
      into v_coupon
    from public.coupons
    where upper(btrim(code)) = upper(regexp_replace(btrim(p_coupon_code), '\s+', '', 'g'))
    limit 1;

    v_coupon_result := public.calculate_checkout_coupon_discount(v_coupon, p_items, auth.uid());

    if coalesce((v_coupon_result->>'ok')::boolean, false) = false then
      return v_coupon_result || jsonb_build_object('shipping_cost', 0);
    end if;

    v_discount := (v_coupon_result->>'discount_amount')::numeric;
  end if;

  v_shipping_result := public.calculate_checkout_shipping(v_subtotal, v_discount, p_governorate_code);

  if coalesce((v_shipping_result->>'ok')::boolean, false) = false then
    return v_shipping_result || jsonb_build_object(
      'subtotal', v_subtotal,
      'discount_amount', v_discount,
      'total', round(greatest(v_subtotal - v_discount, 0), 2)
    );
  end if;

  v_shipping_cost := (v_shipping_result->>'shipping_cost')::numeric;
  v_total := round(greatest(v_subtotal - v_discount, 0) + v_shipping_cost, 2);

  return jsonb_build_object(
    'ok', true,
    'error', '',
    'coupon_id', v_coupon.id,
    'code', v_coupon.code,
    'subtotal', v_subtotal,
    'discount_amount', v_discount,
    'shipping_cost', v_shipping_cost,
    'total', v_total,
    'free_shipping_applied', coalesce((v_shipping_result->>'free_shipping_applied')::boolean, false),
    'shipping_required', coalesce((v_shipping_result->>'shipping_required')::boolean, true),
    'shipping_enabled', true,
    'governorate_code', nullif(v_shipping_result->>'governorate_code', '')
  );
end;
$$;

drop function if exists public.create_checkout_order(uuid, jsonb, jsonb, text);

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
  v_requested_guest boolean := coalesce((p_customer->>'is_guest')::boolean, true);
  v_is_guest boolean := true;
  v_coupon public.coupons;
  v_coupon_result jsonb;
  v_shipping_result jsonb;
  v_discount numeric(12, 2) := 0;
  v_subtotal numeric(12, 2) := 0;
  v_shipping_cost numeric(12, 2) := 0;
  v_total numeric(12, 2) := 0;
  v_item_count integer := 0;
  v_product_id bigint;
  v_governorate_code text := nullif(btrim(p_customer->>'governorate_code'), '');
  v_validated_governorate_code text;
  v_locked_item record;
  v_available_stock integer := 0;
begin
  if p_order_id is null then
    raise exception 'Order id is required.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty.';
  end if;

  if p_customer is null or jsonb_typeof(p_customer) <> 'object' then
    raise exception 'Customer details are required.';
  end if;

  if nullif(btrim(p_customer->>'full_name'), '') is null then
    raise exception 'Customer name is required.';
  end if;

  if nullif(btrim(p_customer->>'phone'), '') is null then
    raise exception 'Phone is required.';
  end if;

  if nullif(btrim(p_customer->>'city'), '') is null then
    raise exception 'City is required.';
  end if;

  if nullif(btrim(p_customer->>'address'), '') is null then
    raise exception 'Address is required.';
  end if;

  if v_user_id is not null then
    v_is_guest := false;
  elsif v_requested_guest = false then
    raise exception 'Please login first.';
  else
    v_is_guest := true;
  end if;

  for v_product_id in
    select distinct (item->>'id')::bigint as product_id
    from jsonb_array_elements(p_items) item
    where nullif(item->>'id', '') is not null
    order by product_id
  loop
    perform 1
    from public.products
    where id = v_product_id
    for update;

    if not found then
      raise exception 'One or more cart products or variants could not be found.';
    end if;
  end loop;

  for v_locked_item in
    select
      variant_input.variant_id,
      sum(variant_input.quantity)::integer as requested_quantity
    from (
      select
        nullif(item->>'variant_id', '')::bigint as variant_id,
        greatest(coalesce((item->>'quantity')::integer, 0), 0) as quantity
      from jsonb_array_elements(p_items) item
      where nullif(item->>'variant_id', '') is not null
    ) variant_input
    group by variant_input.variant_id
    order by variant_id
  loop
    select stock_quantity
      into v_available_stock
    from public.product_variants
    where id = v_locked_item.variant_id
      and is_active = true
    for update;

    if not found then
      raise exception 'Selected product option is no longer available.';
    end if;

    if v_available_stock < v_locked_item.requested_quantity then
      raise exception 'Not enough stock for selected product option.';
    end if;
  end loop;

  select count(*), coalesce(round(sum(item.line_total), 2), 0)
    into v_item_count, v_subtotal
  from public.build_checkout_items(p_items) item;

  if v_item_count <> jsonb_array_length(p_items) then
    raise exception 'One or more cart products or variants could not be found.';
  end if;

  if v_subtotal <= 0 then
    raise exception 'Cart total must be greater than zero.';
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

  v_shipping_result := public.calculate_checkout_shipping(v_subtotal, v_discount, v_governorate_code);

  if coalesce((v_shipping_result->>'ok')::boolean, false) = false then
    raise exception '%', coalesce(v_shipping_result->>'error', 'Shipping rate unavailable for this governorate.');
  end if;

  v_shipping_cost := (v_shipping_result->>'shipping_cost')::numeric;
  v_validated_governorate_code := nullif(v_shipping_result->>'governorate_code', '');
  v_total := round(greatest(v_subtotal - v_discount, 0) + v_shipping_cost, 2);

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
    governorate_code,
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
    v_shipping_cost,
    v_validated_governorate_code,
    v_discount,
    'unpaid'
  );

  insert into public.order_items (
    order_id,
    product_id,
    variant_id,
    product_name,
    product_image,
    product_price,
    color,
    size,
    quantity
  )
  select
    p_order_id,
    item.product_id::text,
    item.variant_id,
    item.product_name,
    item.product_image,
    item.product_price,
    item.color,
    item.size,
    item.quantity
  from public.build_checkout_items(p_items) item;

  for v_locked_item in
    select
      item.variant_id,
      sum(item.quantity)::integer as requested_quantity
    from public.build_checkout_items(p_items) item
    where item.variant_id is not null
    group by item.variant_id
    order by variant_id
  loop
    update public.product_variants
    set stock_quantity = stock_quantity - v_locked_item.requested_quantity
    where id = v_locked_item.variant_id;
  end loop;

  insert into public.variant_inventory_movements (
    variant_id,
    order_id,
    order_item_id,
    quantity_delta,
    reason
  )
  select
    item.variant_id,
    p_order_id,
    item.id,
    -item.quantity,
    'order_created'
  from public.order_items item
  where item.order_id = p_order_id
    and item.variant_id is not null
  on conflict (order_item_id, reason) do nothing;

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
    'shipping_cost', v_shipping_cost,
    'governorate_code', v_validated_governorate_code,
    'payment_status', 'unpaid',
    'status', 'pending',
    'coupon_id', v_coupon.id
  );
end;
$$;

create or replace function public.save_admin_shipping_settings(
  p_settings jsonb,
  p_governorates jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  item jsonb;
  v_code text;
  v_fee numeric(12, 2);
  v_enabled boolean;
  v_shipping_enabled boolean := coalesce((p_settings->>'shipping_enabled')::boolean, true);
  v_free_all boolean := coalesce((p_settings->>'free_shipping_all_orders')::boolean, true);
  v_threshold_enabled boolean := coalesce((p_settings->>'free_shipping_threshold_enabled')::boolean, false);
  v_threshold numeric(12, 2) := nullif(p_settings->>'free_shipping_threshold', '')::numeric;
  v_default_fee numeric(12, 2) := nullif(p_settings->>'default_shipping_fee', '')::numeric;
  v_missing_rates integer := 0;
begin
  if public.is_admin() is not true then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  if p_settings is null or jsonb_typeof(p_settings) <> 'object' then
    raise exception 'Shipping settings are required.';
  end if;

  if p_governorates is null or jsonb_typeof(p_governorates) <> 'array' then
    raise exception 'Governorate rates are required.';
  end if;

  if v_default_fee is not null and v_default_fee < 0 then
    raise exception 'Default shipping fee cannot be negative.';
  end if;

  if v_threshold_enabled and (v_threshold is null or v_threshold <= 0) then
    raise exception 'Free shipping threshold must be greater than zero.';
  end if;

  update public.shipping_settings
  set shipping_enabled = v_shipping_enabled,
      free_shipping_all_orders = v_free_all,
      free_shipping_threshold_enabled = v_threshold_enabled,
      free_shipping_threshold = v_threshold,
      default_shipping_fee = v_default_fee,
      updated_at = now()
  where id = true;

  for item in select * from jsonb_array_elements(p_governorates)
  loop
    v_code := nullif(btrim(item->>'code'), '');
    v_fee := nullif(item->>'shipping_fee', '')::numeric;
    v_enabled := coalesce((item->>'is_enabled')::boolean, true);

    if v_code is null then
      raise exception 'Governorate code is required.';
    end if;

    if v_fee is not null and v_fee < 0 then
      raise exception 'Shipping fee cannot be negative.';
    end if;

    update public.shipping_governorates
    set shipping_fee = v_fee,
        is_enabled = v_enabled,
        updated_at = now()
    where code = v_code;

    if not found then
      raise exception 'Unknown governorate code.';
    end if;
  end loop;

  if v_shipping_enabled and v_free_all = false and v_default_fee is null then
    select count(*)
      into v_missing_rates
    from public.shipping_governorates
    where is_enabled = true
      and shipping_fee is null;

    if v_missing_rates > 0 then
      raise exception 'Enabled governorates need a shipping fee or default fee.';
    end if;
  end if;

  return jsonb_build_object('ok', true, 'updated_at', now());
end;
$$;

revoke all on function public.calculate_checkout_shipping(numeric, numeric, text) from public;
revoke all on function public.preview_checkout_totals(jsonb, text, text) from public;
revoke all on function public.create_checkout_order(uuid, jsonb, jsonb, text) from public;
revoke all on function public.save_admin_shipping_settings(jsonb, jsonb) from public;

revoke execute on function public.calculate_checkout_shipping(numeric, numeric, text) from anon, authenticated;
revoke execute on function public.save_admin_shipping_settings(jsonb, jsonb) from anon;

grant execute on function public.preview_checkout_totals(jsonb, text, text) to anon, authenticated;
grant execute on function public.create_checkout_order(uuid, jsonb, jsonb, text) to anon, authenticated;
grant execute on function public.save_admin_shipping_settings(jsonb, jsonb) to authenticated;
