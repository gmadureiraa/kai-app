CREATE OR REPLACE FUNCTION public.encrypt_social_tokens_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Columns have been consolidated to encrypted-only variants.
  -- The trigger is kept for backward compatibility but plaintext columns
  -- no longer exist. Encryption now happens at the application/edge function level.
  RETURN NEW;
END;
$function$;