create or replace function increment_orders_count(service_id uuid)
returns void as $$
  update services set orders_count = orders_count + 1 where id = service_id;
$$ language sql security definer;

