-- Require a signed-in Supabase user before an order can be created.
REVOKE EXECUTE ON FUNCTION public.place_order(text,text,text,text,text,text,text,text,jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.place_order(text,text,text,text,text,text,text,text,jsonb) TO authenticated;

NOTIFY pgrst, 'reload schema';
