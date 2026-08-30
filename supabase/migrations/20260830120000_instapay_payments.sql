create extension if not exists pgcrypto;

alter table public.orders
  add column if not exists payment_expires_at timestamptz;

alter table public.orders
  add column if not exists payment_access_token_hash text;

alter table public.orders
  add column if not exists payment_rejection_reason text;

alter table public.orders
  add column if not exists instapay_account_name text;

alter table public.orders
  add column if not exists instapay_id text;

alter table public.orders
  add column if not exists instapay_payment_link text;

alter table public.orders
  add column if not exists instapay_qr_path text;

alter table public.orders
  drop constraint if exists orders_payment_method_check,
  add constraint orders_payment_method_check
    check (payment_method is null or payment_method in ('cash', 'instapay'));

alter table public.orders
  drop constraint if exists orders_payment_status_check,
  add constraint orders_payment_status_check
    check (payment_status is null or payment_status in ('pending', 'unpaid', 'awaiting_payment', 'proof_submitted', 'paid', 'rejected', 'expired'));

create table if not exists public.payment_settings (
  id boolean primary key default true,
  cod_enabled boolean not null default true,
  instapay_enabled boolean not null default false,
  instapay_account_name text,
  instapay_id text,
  instapay_payment_link text,
  instapay_qr_path text,
  instapay_timeout_minutes integer not null default 30,
  whatsapp_number text,
  updated_at timestamptz not null default now(),
  constraint payment_settings_singleton check (id),
  constraint payment_settings_timeout_range check (instapay_timeout_minutes between 5 and 120),
  constraint payment_settings_at_least_one_method check (cod_enabled or instapay_enabled),
  constraint payment_settings_instapay_destination_required check (
    instapay_enabled = false
    or nullif(btrim(coalesce(instapay_id, '')), '') is not null
    or nullif(btrim(coalesce(instapay_payment_link, '')), '') is not null
    or nullif(btrim(coalesce(instapay_qr_path, '')), '') is not null
  ),
  constraint payment_settings_instapay_link_format check (
    instapay_payment_link is null
    or instapay_payment_link = ''
    or instapay_payment_link ~* '^https?://'
  ),
  constraint payment_settings_whatsapp_digits check (
    whatsapp_number is null
    or whatsapp_number = ''
    or whatsapp_number ~ '^[0-9]{8,15}$'
  )
);

insert into public.payment_settings (id)
values (true)
on conflict (id) do nothing;

create table if not exists public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  storage_path text not null,
  status text not null default 'submitted',
  transaction_reference text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  rejection_reason text,
  constraint payment_proofs_status_check check (status in ('submitted', 'accepted', 'rejected')),
  constraint payment_proofs_storage_path_required check (nullif(btrim(storage_path), '') is not null),
  constraint payment_proofs_transaction_reference_length check (transaction_reference is null or length(transaction_reference) <= 120)
);

create index if not exists payment_proofs_order_id_submitted_at_idx
  on public.payment_proofs (order_id, submitted_at desc);

create unique index if not exists payment_proofs_one_active_submitted_idx
  on public.payment_proofs (order_id)
  where status = 'submitted';

alter table public.payment_settings enable row level security;
alter table public.payment_proofs enable row level security;

drop policy if exists "Anyone can read payment settings" on public.payment_settings;
create policy "Anyone can read payment settings"
  on public.payment_settings
  for select
  using (true);

drop policy if exists "Admins can read payment proofs" on public.payment_proofs;
create policy "Admins can read payment proofs"
  on public.payment_proofs
  for select
  using (public.is_admin() is true);

revoke all on public.payment_settings from anon, authenticated;
revoke all on public.payment_proofs from anon, authenticated;
grant select on public.payment_settings to anon, authenticated;
grant select on public.payment_proofs to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('payment-assets', 'payment-assets', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('payment-proofs', 'payment-proofs', false, 4194304, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can read payment assets" on storage.objects;
create policy "Anyone can read payment assets"
  on storage.objects
  for select
  using (bucket_id = 'payment-assets');

drop policy if exists "Admins can manage payment assets" on storage.objects;
create policy "Admins can manage payment assets"
  on storage.objects
  for all
  using (bucket_id = 'payment-assets' and public.is_admin() is true)
  with check (bucket_id = 'payment-assets' and public.is_admin() is true);

create or replace function public.save_admin_payment_settings(p_settings jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_cod_enabled boolean := coalesce((p_settings->>'cod_enabled')::boolean, true);
  v_instapay_enabled boolean := coalesce((p_settings->>'instapay_enabled')::boolean, false);
  v_account_name text := nullif(btrim(p_settings->>'instapay_account_name'), '');
  v_instapay_id text := nullif(btrim(p_settings->>'instapay_id'), '');
  v_payment_link text := nullif(btrim(p_settings->>'instapay_payment_link'), '');
  v_qr_path text := nullif(btrim(p_settings->>'instapay_qr_path'), '');
  v_timeout integer := coalesce(nullif(p_settings->>'instapay_timeout_minutes', '')::integer, 30);
  v_whatsapp text := regexp_replace(coalesce(p_settings->>'whatsapp_number', ''), '[^0-9]+', '', 'g');
begin
  if public.is_admin() is not true then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  if p_settings is null or jsonb_typeof(p_settings) <> 'object' then
    raise exception 'Payment settings are required.';
  end if;

  if v_cod_enabled = false and v_instapay_enabled = false then
    raise exception 'At least one payment method must be enabled.';
  end if;

  if v_timeout < 5 or v_timeout > 120 then
    raise exception 'Payment timeout must be between 5 and 120 minutes.';
  end if;

  if v_instapay_enabled and v_instapay_id is null and v_payment_link is null and v_qr_path is null then
    raise exception 'InstaPay payment details are required.';
  end if;

  if v_payment_link is not null and v_payment_link !~* '^https?://' then
    raise exception 'Payment link must be a valid URL.';
  end if;

  if v_whatsapp = '' then
    v_whatsapp := null;
  elsif length(v_whatsapp) < 8 or length(v_whatsapp) > 15 then
    raise exception 'WhatsApp number must be 8 to 15 digits.';
  end if;

  update public.payment_settings
  set cod_enabled = v_cod_enabled,
      instapay_enabled = v_instapay_enabled,
      instapay_account_name = v_account_name,
      instapay_id = v_instapay_id,
      instapay_payment_link = v_payment_link,
      instapay_qr_path = v_qr_path,
      instapay_timeout_minutes = v_timeout,
      whatsapp_number = v_whatsapp,
      updated_at = now()
  where id = true;

  return jsonb_build_object('ok', true, 'updated_at', now());
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
  settings public.payment_settings;
  v_payment_method text := lower(coalesce(nullif(btrim(p_customer->>'payment_method'), ''), 'cash'));
  v_payment_status text := 'unpaid';
  v_payment_expires_at timestamptz;
  v_payment_access_token text;
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

  select *
    into settings
  from public.payment_settings
  where id = true;

  if not found then
    raise exception 'Payment settings are unavailable.';
  end if;

  if v_payment_method not in ('cash', 'instapay') then
    raise exception 'Payment method is invalid.';
  end if;

  if v_payment_method = 'cash' and settings.cod_enabled = false then
    raise exception 'Cash on delivery is unavailable.';
  end if;

  if v_payment_method = 'instapay' and settings.instapay_enabled = false then
    raise exception 'InstaPay is unavailable.';
  end if;

  if v_payment_method = 'instapay'
    and nullif(btrim(coalesce(settings.instapay_id, '')), '') is null
    and nullif(btrim(coalesce(settings.instapay_payment_link, '')), '') is null
    and nullif(btrim(coalesce(settings.instapay_qr_path, '')), '') is null
  then
    raise exception 'InstaPay payment details are unavailable.';
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
  v_payment_status := case when v_payment_method = 'instapay' then 'awaiting_payment' else 'unpaid' end;
  v_payment_expires_at := case when v_payment_method = 'instapay' then now() + make_interval(mins => settings.instapay_timeout_minutes) else null end;

  if v_payment_method = 'instapay' then
    v_payment_access_token := encode(gen_random_bytes(32), 'hex');
  end if;

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
    payment_status,
    payment_expires_at,
    payment_access_token_hash,
    instapay_account_name,
    instapay_id,
    instapay_payment_link,
    instapay_qr_path
  )
  values (
    p_order_id,
    case when v_is_guest then null else v_user_id end,
    v_total,
    'pending',
    v_payment_method,
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
    v_payment_status,
    v_payment_expires_at,
    case when v_payment_access_token is null then null else encode(digest(v_payment_access_token, 'sha256'), 'hex') end,
    case when v_payment_method = 'instapay' then settings.instapay_account_name else null end,
    case when v_payment_method = 'instapay' then settings.instapay_id else null end,
    case when v_payment_method = 'instapay' then settings.instapay_payment_link else null end,
    case when v_payment_method = 'instapay' then settings.instapay_qr_path else null end
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
    'payment_method', v_payment_method,
    'payment_status', v_payment_status,
    'payment_expires_at', v_payment_expires_at,
    'payment_access_token', v_payment_access_token,
    'status', 'pending',
    'coupon_id', v_coupon.id
  );
end;
$$;

create or replace function public.get_instapay_payment_order(
  p_order_id uuid,
  p_access_token text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_token_hash text := case when nullif(btrim(coalesce(p_access_token, '')), '') is null then null else encode(digest(p_access_token, 'sha256'), 'hex') end;
  v_items jsonb;
  v_proofs jsonb;
  settings public.payment_settings;
  v_settings jsonb;
begin
  select *
    into v_order
  from public.orders
  where id = p_order_id
    and payment_method = 'instapay'
    and (
      (auth.uid() is not null and user_id = auth.uid())
      or (payment_access_token_hash is not null and payment_access_token_hash = v_token_hash)
    )
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Payment access is invalid.');
  end if;

  select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', item.id,
          'product_id', item.product_id,
          'variant_id', item.variant_id,
          'product_name', item.product_name,
          'product_image', item.product_image,
          'product_price', item.product_price,
          'color', item.color,
          'size', item.size,
          'quantity', item.quantity
        )
        order by item.created_at, item.id
      ),
      '[]'::jsonb
    )
    into v_items
  from public.order_items item
  where item.order_id = p_order_id;

  select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', proof.id,
          'status', proof.status,
          'transaction_reference', proof.transaction_reference,
          'submitted_at', proof.submitted_at,
          'reviewed_at', proof.reviewed_at,
          'rejection_reason', proof.rejection_reason
        )
        order by proof.submitted_at desc
      ),
      '[]'::jsonb
    )
    into v_proofs
  from public.payment_proofs proof
  where proof.order_id = p_order_id;

  select *
    into settings
  from public.payment_settings
  where id = true;

  select jsonb_build_object(
      'instapay_account_name', v_order.instapay_account_name,
      'instapay_id', v_order.instapay_id,
      'instapay_payment_link', v_order.instapay_payment_link,
      'instapay_qr_path', v_order.instapay_qr_path,
      'whatsapp_number', settings.whatsapp_number,
      'instapay_timeout_minutes', settings.instapay_timeout_minutes
    )
    into v_settings
  ;

  return jsonb_build_object(
    'ok', true,
    'order', jsonb_build_object(
      'id', v_order.id,
      'order_number', v_order.order_number,
      'total_price', v_order.total_price,
      'status', v_order.status,
      'payment_method', v_order.payment_method,
      'payment_status', v_order.payment_status,
      'payment_expires_at', v_order.payment_expires_at,
      'payment_rejection_reason', v_order.payment_rejection_reason,
      'created_at', v_order.created_at
    ),
    'items', v_items,
    'proofs', v_proofs,
    'settings', v_settings
  );
end;
$$;

drop function if exists public.register_instapay_payment_proof(uuid, text, text, text);
drop function if exists public.register_instapay_payment_proof(uuid, text, text, text, uuid);

create or replace function public.register_instapay_payment_proof(
  p_order_id uuid,
  p_access_token text,
  p_storage_path text,
  p_transaction_reference text default null,
  p_authenticated_user_id uuid default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_proof_id uuid;
  v_token_hash text := case when nullif(btrim(coalesce(p_access_token, '')), '') is null then null else encode(digest(p_access_token, 'sha256'), 'hex') end;
begin
  if p_order_id is null then
    raise exception 'Payment access is invalid.' using errcode = '42501';
  end if;

  if nullif(btrim(coalesce(p_storage_path, '')), '') is null
    or nullif(split_part(p_storage_path, '/', 3), '') is null
    or p_storage_path <> 'orders/' || p_order_id::text || '/' || split_part(p_storage_path, '/', 3)
  then
    raise exception 'Payment proof is invalid.';
  end if;

  select *
    into v_order
  from public.orders
  where id = p_order_id
    and (
      (p_authenticated_user_id is not null and user_id = p_authenticated_user_id)
      or (payment_access_token_hash is not null and payment_access_token_hash = v_token_hash)
    )
  for update;

  if not found then
    raise exception 'Payment access is invalid.' using errcode = '42501';
  end if;

  if v_order.payment_method <> 'instapay' then
    raise exception 'Payment proof is only available for InstaPay orders.';
  end if;

  if v_order.status = 'cancelled' then
    raise exception 'Cancelled orders cannot receive payment proof.';
  end if;

  if v_order.payment_status not in ('awaiting_payment', 'rejected') then
    raise exception 'Payment proof cannot be submitted for this order state.';
  end if;

  if v_order.payment_expires_at is null or v_order.payment_expires_at <= now() then
    raise exception 'Payment window has expired.';
  end if;

  insert into public.payment_proofs (
    order_id,
    storage_path,
    status,
    transaction_reference
  )
  values (
    p_order_id,
    p_storage_path,
    'submitted',
    left(nullif(btrim(p_transaction_reference), ''), 120)
  )
  returning id into v_proof_id;

  update public.orders
  set payment_status = 'proof_submitted',
      payment_rejection_reason = null
  where id = p_order_id;

  return jsonb_build_object('ok', true, 'proof_id', v_proof_id, 'payment_status', 'proof_submitted');
end;
$$;

create or replace function public.admin_review_instapay_payment(
  p_order_id uuid,
  p_proof_id uuid,
  p_action text,
  p_rejection_reason text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_admin_id uuid := auth.uid();
  settings public.payment_settings;
begin
  if public.is_admin() is not true then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  select *
    into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if v_order.payment_method <> 'instapay' then
    raise exception 'This order is not an InstaPay order.';
  end if;

  if v_order.status = 'cancelled' then
    raise exception 'Cancelled orders cannot be reviewed for payment.';
  end if;

  if p_action = 'confirm' and v_order.payment_status = 'expired' then
    raise exception 'Expired payments cannot be confirmed.';
  end if;

  if v_order.payment_status <> 'proof_submitted' then
    raise exception 'This order is not awaiting payment review.';
  end if;

  perform 1
  from public.payment_proofs
  where id = p_proof_id
    and order_id = p_order_id
    and status = 'submitted'
  for update;

  if not found then
    raise exception 'Submitted payment proof not found.';
  end if;

  if p_action = 'confirm' then
    update public.payment_proofs
    set status = 'accepted',
        reviewed_at = now(),
        reviewed_by = v_admin_id,
        rejection_reason = null
    where id = p_proof_id;

    update public.orders
    set payment_status = 'paid',
        payment_rejection_reason = null
    where id = p_order_id;

    return jsonb_build_object('ok', true, 'payment_status', 'paid');
  elsif p_action = 'reject' then
    if nullif(btrim(coalesce(p_rejection_reason, '')), '') is null then
      raise exception 'Rejection reason is required.';
    end if;

    select *
      into settings
    from public.payment_settings
    where id = true;

    update public.payment_proofs
    set status = 'rejected',
        reviewed_at = now(),
        reviewed_by = v_admin_id,
        rejection_reason = nullif(btrim(p_rejection_reason), '')
    where id = p_proof_id;

    update public.orders
    set payment_status = 'rejected',
        payment_rejection_reason = nullif(btrim(p_rejection_reason), ''),
        payment_expires_at = now() + make_interval(mins => coalesce(settings.instapay_timeout_minutes, 30))
    where id = p_order_id;

    return jsonb_build_object('ok', true, 'payment_status', 'rejected');
  end if;

  raise exception 'Payment review action is invalid.';
end;
$$;

create or replace function public.restock_order_variants_for_cancellation(
  p_order_id uuid
)
returns integer
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_item record;
  v_movement_id bigint;
  v_restocked_count integer := 0;
begin
  if p_order_id is null then
    return 0;
  end if;

  for v_item in
    select id, variant_id, quantity
    from public.order_items
    where order_id = p_order_id
      and variant_id is not null
    order by variant_id
    for update
  loop
    insert into public.variant_inventory_movements (
      variant_id,
      order_id,
      order_item_id,
      quantity_delta,
      reason
    )
    values (
      v_item.variant_id,
      p_order_id,
      v_item.id,
      v_item.quantity,
      'cancelled'
    )
    on conflict (order_item_id, reason) do nothing
    returning id into v_movement_id;

    if v_movement_id is not null then
      update public.product_variants
      set stock_quantity = stock_quantity + v_item.quantity
      where id = v_item.variant_id;

      v_restocked_count := v_restocked_count + 1;
    end if;

    v_movement_id := null;
  end loop;

  return v_restocked_count;
end;
$$;

create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_status text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_previous_status text;
begin
  if public.is_admin() is not true then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  if p_order_id is null then
    raise exception 'Order id is required.';
  end if;

  if p_status not in ('pending', 'processing', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Invalid order status.';
  end if;

  select status
    into v_previous_status
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if v_previous_status = 'cancelled' and p_status <> 'cancelled' then
    raise exception 'Cancelled orders cannot be reopened.';
  end if;

  update public.orders
  set status = p_status
  where id = p_order_id;

  if p_status = 'cancelled' and coalesce(v_previous_status, '') <> 'cancelled' then
    perform public.restock_order_variants_for_cancellation(p_order_id);
  end if;

  return jsonb_build_object(
    'id', p_order_id,
    'status', p_status,
    'previous_status', v_previous_status
  );
end;
$$;

create or replace function public.expire_pending_instapay_orders(p_limit integer default 50)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_order record;
  v_expired_count integer := 0;
begin
  for v_order in
    select id
    from public.orders
    where payment_method = 'instapay'
      and payment_status in ('awaiting_payment', 'rejected')
      and payment_expires_at <= now()
      and coalesce(status, '') <> 'cancelled'
    order by payment_expires_at, id
    limit greatest(coalesce(p_limit, 50), 1)
    for update skip locked
  loop
    update public.orders
    set payment_status = 'expired',
        status = 'cancelled'
    where id = v_order.id;

    perform public.restock_order_variants_for_cancellation(v_order.id);

    delete from public.coupon_redemptions
    where order_id = v_order.id;

    v_expired_count := v_expired_count + 1;
  end loop;

  return jsonb_build_object('ok', true, 'expired_count', v_expired_count);
end;
$$;

revoke all on function public.save_admin_payment_settings(jsonb) from public;
revoke all on function public.get_instapay_payment_order(uuid, text) from public;
revoke all on function public.register_instapay_payment_proof(uuid, text, text, text, uuid) from public;
revoke all on function public.admin_review_instapay_payment(uuid, uuid, text, text) from public;
revoke all on function public.restock_order_variants_for_cancellation(uuid) from public;
revoke all on function public.admin_update_order_status(uuid, text) from public;
revoke all on function public.expire_pending_instapay_orders(integer) from public;
revoke all on function public.create_checkout_order(uuid, jsonb, jsonb, text) from public;

revoke execute on function public.save_admin_payment_settings(jsonb) from anon;
revoke execute on function public.register_instapay_payment_proof(uuid, text, text, text, uuid) from anon, authenticated;
revoke execute on function public.admin_review_instapay_payment(uuid, uuid, text, text) from anon;
revoke execute on function public.restock_order_variants_for_cancellation(uuid) from anon, authenticated;
revoke execute on function public.admin_update_order_status(uuid, text) from anon;
revoke execute on function public.expire_pending_instapay_orders(integer) from anon, authenticated;

grant execute on function public.save_admin_payment_settings(jsonb) to authenticated;
grant execute on function public.get_instapay_payment_order(uuid, text) to anon, authenticated;
grant execute on function public.register_instapay_payment_proof(uuid, text, text, text, uuid) to service_role;
grant execute on function public.admin_review_instapay_payment(uuid, uuid, text, text) to authenticated;
grant execute on function public.admin_update_order_status(uuid, text) to authenticated;
grant execute on function public.create_checkout_order(uuid, jsonb, jsonb, text) to anon, authenticated;
