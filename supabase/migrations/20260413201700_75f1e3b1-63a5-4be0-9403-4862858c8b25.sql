-- Drop the dependent view first
DROP VIEW IF EXISTS public.client_social_credentials_decrypted;

-- Drop plaintext credential columns
ALTER TABLE public.client_social_credentials
  DROP COLUMN IF EXISTS api_key,
  DROP COLUMN IF EXISTS api_secret,
  DROP COLUMN IF EXISTS access_token,
  DROP COLUMN IF EXISTS access_token_secret,
  DROP COLUMN IF EXISTS oauth_access_token,
  DROP COLUMN IF EXISTS oauth_refresh_token;

-- Recreate view using only encrypted columns
CREATE OR REPLACE VIEW public.client_social_credentials_decrypted AS
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