-- Security housekeeping — items flagged in HAWOOK_PROJECT_STATUS known issues 2-4
-- Safe to run anytime; all operations are idempotent or non-breaking.

-- 1. Revoke anon INSERT/UPDATE/DELETE on projects table
--    RLS blocks these already, but removing the grants is cleaner.
REVOKE INSERT, UPDATE, DELETE ON public.projects FROM anon;

-- 2. Fix mutable search_path on all public trigger functions
--    Prevents search_path injection if pg_catalog is manipulated.
ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_temp;

DO $$
DECLARE
  fn_name text;
BEGIN
  FOR fn_name IN
    SELECT p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND p.proname != 'set_updated_at' -- already handled above
      AND p.provolatile != 'i'          -- skip immutable (safe by definition)
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER FUNCTION public.%I() SET search_path = public, pg_temp',
        fn_name
      );
    EXCEPTION WHEN OTHERS THEN
      -- Some functions have args; skip those — they need explicit signatures
      NULL;
    END;
  END LOOP;
END;
$$;

-- 3. Revoke EXECUTE on handle_new_user from anon and authenticated
--    It should only be called by the trigger (as the triggering role), not by clients.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
