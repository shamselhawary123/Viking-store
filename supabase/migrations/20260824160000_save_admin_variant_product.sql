create or replace function public.save_admin_variant_product(
  p_product jsonb,
  p_colors jsonb default '[]'::jsonb,
  p_variants jsonb default '[]'::jsonb
)
returns bigint
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_product_id bigint;
  v_existing_model text;
  v_variant jsonb;
  v_color jsonb;
  v_image text;
  v_color_key text;
  v_color_id bigint;
  v_color_ids jsonb := '{}'::jsonb;
  v_color_keys text[] := array[]::text[];
  v_size_label text;
  v_existing_size_label text;
  v_size_key text;
  v_size_id bigint;
  v_size_ids jsonb := '{}'::jsonb;
  v_variant_id bigint;
  v_target_variant_id bigint;
  v_price numeric;
  v_stock integer;
  v_is_active boolean;
  v_active_count integer := 0;
  v_min_active_price numeric;
  v_mode text;
  v_variant_mode text;
  v_combo_key text;
  v_combo_keys text[] := array[]::text[];
  v_saved_variant_ids bigint[] := array[]::bigint[];
begin
  if public.is_admin() is not true then
    raise exception 'Only admins can save variant products.' using errcode = '42501';
  end if;

  if p_product is null or jsonb_typeof(p_product) <> 'object' then
    raise exception 'Product payload is required.' using errcode = '22023';
  end if;

  if p_colors is null or jsonb_typeof(p_colors) <> 'array' then
    raise exception 'Colors payload must be an array.' using errcode = '22023';
  end if;

  if p_variants is null or jsonb_typeof(p_variants) <> 'array' or jsonb_array_length(p_variants) = 0 then
    raise exception 'At least one variant is required.' using errcode = '22023';
  end if;

  for v_color in select value from jsonb_array_elements(p_colors)
  loop
    v_color_key := nullif(btrim(coalesce(v_color->>'key', '')), '');

    if v_color_key is null then
      raise exception 'Color key is required.' using errcode = '22023';
    end if;

    if v_color_key = any(v_color_keys) then
      raise exception 'Duplicate color key.' using errcode = '23505';
    end if;

    v_color_keys := array_append(v_color_keys, v_color_key);
  end loop;

  for v_variant in select value from jsonb_array_elements(p_variants)
  loop
    v_price := (v_variant->>'price')::numeric;
    v_stock := (v_variant->>'stock_quantity')::integer;
    v_is_active := coalesce((v_variant->>'is_active')::boolean, true);

    if v_price < 0 then
      raise exception 'Variant price must be zero or more.' using errcode = '23514';
    end if;

    if v_stock < 0 then
      raise exception 'Variant stock must be zero or more.' using errcode = '23514';
    end if;

    v_color_key := nullif(btrim(coalesce(v_variant->>'color_key', '')), '');
    if v_color_key is not null
      and nullif(btrim(coalesce(v_variant->>'color_id', '')), '') is null
      and not (v_color_key = any(v_color_keys))
    then
      raise exception 'Submitted color key could not be resolved.' using errcode = '23503';
    end if;

    if v_is_active then
      v_active_count := v_active_count + 1;
      v_min_active_price := least(coalesce(v_min_active_price, v_price), v_price);
    end if;
  end loop;

  if v_active_count <= 0 then
    raise exception 'At least one active variant is required.' using errcode = '22023';
  end if;

  v_product_id := nullif(btrim(coalesce(p_product->>'id', '')), '')::bigint;

  if v_product_id is null then
    insert into public.products (
      title,
      slug,
      description,
      badge,
      old_price,
      category_id,
      cover_image,
      price,
      inventory_model
    )
    values (
      nullif(btrim(p_product->>'title'), ''),
      nullif(btrim(p_product->>'slug'), ''),
      coalesce(p_product->>'description', ''),
      nullif(btrim(coalesce(p_product->>'badge', '')), ''),
      nullif(btrim(coalesce(p_product->>'old_price', '')), '')::numeric,
      (p_product->>'category_id')::bigint,
      coalesce(p_product->>'cover_image', ''),
      v_min_active_price,
      'variants'
    )
    returning id into v_product_id;
  else
    select inventory_model
      into v_existing_model
    from public.products
    where id = v_product_id
    for update;

    if not found then
      raise exception 'Product not found.' using errcode = 'P0002';
    end if;

    if v_existing_model <> 'variants' then
      raise exception 'Legacy products cannot be saved through the variant editor.' using errcode = '23514';
    end if;

    update public.products
    set
      title = nullif(btrim(p_product->>'title'), ''),
      slug = nullif(btrim(p_product->>'slug'), ''),
      description = coalesce(p_product->>'description', ''),
      badge = nullif(btrim(coalesce(p_product->>'badge', '')), ''),
      old_price = nullif(btrim(coalesce(p_product->>'old_price', '')), '')::numeric,
      category_id = (p_product->>'category_id')::bigint,
      cover_image = coalesce(p_product->>'cover_image', ''),
      inventory_model = 'variants'
    where id = v_product_id;
  end if;

  for v_color in select value from jsonb_array_elements(p_colors)
  loop
    v_color_key := nullif(btrim(coalesce(v_color->>'key', '')), '');
    v_color_id := nullif(btrim(coalesce(v_color->>'id', '')), '')::bigint;

    if v_color_id is null then
      insert into public.product_colors (product_id, name, value)
      values (
        v_product_id,
        nullif(btrim(v_color->>'name'), ''),
        coalesce(nullif(btrim(v_color->>'value'), ''), '#000000')
      )
      returning id into v_color_id;
    else
      update public.product_colors
      set
        name = nullif(btrim(v_color->>'name'), ''),
        value = coalesce(nullif(btrim(v_color->>'value'), ''), '#000000')
      where id = v_color_id
        and product_id = v_product_id;

      if not found then
        raise exception 'Color does not belong to this product.' using errcode = '23503';
      end if;
    end if;

    delete from public.product_images
    where color_id = v_color_id;

    for v_image in select value from jsonb_array_elements_text(coalesce(v_color->'images', '[]'::jsonb))
    loop
      if nullif(btrim(v_image), '') is not null then
        insert into public.product_images (color_id, image_url)
        values (v_color_id, v_image);
      end if;
    end loop;

    v_color_ids := jsonb_set(v_color_ids, array[v_color_key], to_jsonb(v_color_id::text), true);
  end loop;

  for v_variant in select value from jsonb_array_elements(p_variants)
  loop
    v_size_label := nullif(btrim(coalesce(v_variant->>'size', '')), '');
    if v_size_label is not null then
      v_size_key := lower(v_size_label);
      if v_size_ids ? v_size_key then
        continue;
      end if;

      v_size_id := nullif(btrim(coalesce(v_variant->>'size_id', '')), '')::bigint;

      if v_size_id is not null then
        select size
          into v_existing_size_label
        from public.product_sizes
        where id = v_size_id
          and product_id = v_product_id;

        if not found then
          raise exception 'Size does not belong to this product.' using errcode = '23503';
        end if;

        if lower(v_existing_size_label) <> v_size_key then
          raise exception 'Submitted size_id label does not match the submitted size.' using errcode = '23514';
        end if;
      else
        select id
          into v_size_id
        from public.product_sizes
        where product_id = v_product_id
          and lower(size) = v_size_key
        limit 1;

        if v_size_id is null then
          insert into public.product_sizes (product_id, size, in_stock)
          values (v_product_id, v_size_label, true)
          returning id into v_size_id;
        end if;
      end if;

      v_size_ids := jsonb_set(v_size_ids, array[v_size_key], to_jsonb(v_size_id::text), true);
    end if;
  end loop;

  v_combo_keys := array[]::text[];

  for v_variant in select value from jsonb_array_elements(p_variants)
  loop
    v_variant_id := nullif(btrim(coalesce(v_variant->>'id', '')), '')::bigint;
    v_color_key := nullif(btrim(coalesce(v_variant->>'color_key', '')), '');
    v_size_label := nullif(btrim(coalesce(v_variant->>'size', '')), '');
    v_price := (v_variant->>'price')::numeric;
    v_stock := (v_variant->>'stock_quantity')::integer;
    v_is_active := coalesce((v_variant->>'is_active')::boolean, true);
    v_color_id := nullif(btrim(coalesce(v_variant->>'color_id', '')), '')::bigint;
    v_size_id := nullif(btrim(coalesce(v_variant->>'size_id', '')), '')::bigint;

    if v_color_id is null and v_color_key is not null then
      if not (v_color_ids ? v_color_key) then
        raise exception 'Submitted color key could not be resolved.' using errcode = '23503';
      end if;

      v_color_id := (v_color_ids->>v_color_key)::bigint;
    end if;

    if v_color_id is not null then
      perform 1
      from public.product_colors
      where id = v_color_id
        and product_id = v_product_id;

      if not found then
        raise exception 'Variant color does not belong to this product.' using errcode = '23503';
      end if;
    end if;

    if v_size_id is null and v_size_label is not null then
      v_size_id := (v_size_ids->>lower(v_size_label))::bigint;
    end if;

    if v_size_id is not null then
      perform 1
      from public.product_sizes
      where id = v_size_id
        and product_id = v_product_id;

      if not found then
        raise exception 'Variant size does not belong to this product.' using errcode = '23503';
      end if;
    end if;

    if v_color_id is not null and v_size_id is not null then
      v_variant_mode := 'color_size';
    elsif v_color_id is not null then
      v_variant_mode := 'color_only';
    elsif v_size_id is not null then
      v_variant_mode := 'size_only';
    else
      v_variant_mode := 'simple';
    end if;

    if v_variant_mode = 'simple' and jsonb_array_length(p_variants) <> 1 then
      raise exception 'Simple variant mode must contain exactly one variant.' using errcode = '23514';
    end if;

    if v_mode is null then
      v_mode := v_variant_mode;
    elsif v_mode <> v_variant_mode then
      raise exception 'Variant products must use one consistent variant mode.' using errcode = '23514';
    end if;

    v_combo_key := coalesce(v_color_id::text, '') || '::' || coalesce(v_size_id::text, '');
    if v_combo_key = any(v_combo_keys) then
      raise exception 'Duplicate variant combination.' using errcode = '23505';
    end if;
    v_combo_keys := array_append(v_combo_keys, v_combo_key);

    if v_variant_id is not null then
      perform 1
      from public.product_variants
      where id = v_variant_id
        and product_id = v_product_id
      for update;

      if not found then
        raise exception 'Variant does not belong to this product.' using errcode = '23503';
      end if;
    end if;

    v_target_variant_id := null;

    select id
      into v_target_variant_id
    from public.product_variants
    where product_id = v_product_id
      and color_id is not distinct from v_color_id
      and size_id is not distinct from v_size_id
    limit 1
    for update;

    if v_target_variant_id is not null and (v_variant_id is null or v_target_variant_id <> v_variant_id) then
      update public.product_variants
      set
        price = v_price,
        stock_quantity = v_stock,
        is_active = v_is_active
      where id = v_target_variant_id
        and product_id = v_product_id;

      v_variant_id := v_target_variant_id;
    elsif v_variant_id is null then
      insert into public.product_variants (
        product_id,
        color_id,
        size_id,
        price,
        stock_quantity,
        is_active
      )
      values (
        v_product_id,
        v_color_id,
        v_size_id,
        v_price,
        v_stock,
        v_is_active
      )
      returning id into v_variant_id;
    else
      update public.product_variants
      set
        color_id = v_color_id,
        size_id = v_size_id,
        price = v_price,
        stock_quantity = v_stock,
        is_active = v_is_active
      where id = v_variant_id
        and product_id = v_product_id;

      if not found then
        raise exception 'Variant does not belong to this product.' using errcode = '23503';
      end if;
    end if;

    v_saved_variant_ids := array_append(v_saved_variant_ids, v_variant_id);
  end loop;

  update public.product_variants
  set is_active = false
  where product_id = v_product_id
    and not (id = any(v_saved_variant_ids));

  perform public.sync_product_variant_parent_price(v_product_id);

  return v_product_id;
end;
$$;

revoke all on function public.save_admin_variant_product(jsonb, jsonb, jsonb) from public;
revoke execute on function public.save_admin_variant_product(jsonb, jsonb, jsonb) from anon;
grant execute on function public.save_admin_variant_product(jsonb, jsonb, jsonb) to authenticated;
