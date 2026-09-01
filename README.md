# Routeboard

A browser operations dashboard for manually managing deliveries, stock, production, and wholesale orders.

## Included

- Driver view with tap-to-complete delivery and pickup stops
- Dispatcher view with route completion progress
- Last completed stop shown to dispatch
- CSV import for delivery lists
- Shared Supabase route data for driver and dispatcher devices
- Overview dashboard with Owner, Driver, and Wholesaler workspace selector
- Manual inventory, production batch, and wholesale order records saved in the browser

## Run

1. Open `supabase-setup.sql` in the Supabase SQL Editor and run it once.
2. Open `index.html` directly in a browser.

Wix integration is intentionally paused. Orders can be entered manually or loaded through the CSV workflow.

CSV files should include `customer`, `address`, and `tubs` columns. Optional `id`, `phone`, and `area` columns are also supported. Phone links call the number, and Directions opens Google Maps for the delivery address. Example: `customer,address,phone,tubs,area`. The Supabase publishable key is stored in `supabase-config.js`; it is intended for browser use, while secret and service-role keys must never be placed there.

Pickups are stored in the Supabase `pickup_deliveries` table and fall back to `routeboard-pickups` in the browser when the database is unavailable. Existing locally stored pickups are uploaded automatically when the shared pickup table is empty.
