alter function public.create_checkout_order(uuid, jsonb, jsonb, text)
set search_path = public, extensions;

alter function public.get_instapay_payment_order(uuid, text)
set search_path = public, extensions;

alter function public.register_instapay_payment_proof(uuid, text, text, text, uuid)
set search_path = public, extensions;
