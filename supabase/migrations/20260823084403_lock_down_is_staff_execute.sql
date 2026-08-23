-- Postgres grants EXECUTE on new functions to PUBLIC by default, which made
-- is_staff() callable directly via /rest/v1/rpc/is_staff by anon and any
-- authenticated user. It only needs to be callable from within RLS policy
-- checks (which run as the querying role), so restrict direct EXECUTE to
-- what policies require and nothing public-facing.

revoke execute on function public.is_staff() from public;
revoke execute on function public.is_staff() from anon;
grant execute on function public.is_staff() to authenticated;
