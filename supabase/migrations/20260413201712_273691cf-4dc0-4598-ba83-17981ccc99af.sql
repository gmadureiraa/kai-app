-- Recreate view with SECURITY INVOKER to fix linter warning
DROP VIEW IF EXISTS public.client_social_credentials_decrypted;

CREATE VIEW public.client_social_credentials_decrypted
WITH (security_invoker = true)
AS
SELECT 
  id,
  client_id,
  platform,
  api_key_encrypted AS api_key,
  api_secret_encrypted AS api_secret,
  access_token_encrypted AS access_token,
  access_token_secret_encrypted AS access_token_secret,
  oauth_access_token_encrypted AS oauth_access_token,
  oauth_refresh_token_encrypted AS oauth_refresh_token,
  expires_at,
  is_valid,
  last_validated_at,
  validation_error,
  account_name,
  account_id,
  metadata,
  created_at,
  updated_at
FROM client_social_credentials;