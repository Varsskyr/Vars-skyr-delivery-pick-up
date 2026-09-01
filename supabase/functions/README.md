# Wix import function

Deploy `wix-import` as a Supabase Edge Function.

Required Edge Function secrets:

- `WIX_API_TOKEN`
- `WIX_SITE_ID`
- `ROUTEBOARD_SERVICE_ROLE_KEY`
- `SUPABASE_URL` (normally provided automatically by Supabase)

The function imports Wix orders whose response contains `Shipping`, ignores `Pick up`, and maps the sum of product quantities to tubs.

Schedule it in Supabase Cron for 09:00 South Africa time on Monday, Wednesday, and Friday. South Africa uses UTC+2, so the UTC cron time is `07:00`, with cron expression `0 7 * * 1,3,5`.
