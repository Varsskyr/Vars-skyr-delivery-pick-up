/// <reference types="https://esm.sh/@supabase/functions-js/edge-runtime.d.ts" />

const wixToken = Deno.env.get('WIX_API_TOKEN');
const wixSiteId = Deno.env.get('WIX_SITE_ID');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('ROUTEBOARD_SERVICE_ROLE_KEY');

if (!wixToken || !wixSiteId || !supabaseUrl || !serviceRoleKey) throw new Error('Missing Wix or Supabase function secrets.');

const wixOrdersUrl = 'https://www.wixapis.com/ecom/v1/orders/query';
const deliveriesUrl = `${supabaseUrl}/rest/v1/deliveries`;
const supabaseHeaders = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json' };

function textFromOrder(order: unknown) { return JSON.stringify(order).toLowerCase(); }
function isShippingOrder(order: any) { const text = textFromOrder(order); return text.includes('shipping') && !text.includes('pick up') && !text.includes('pickup'); }
function getValue(order: any, paths: string[]) { for (const path of paths) { const value = path.split('.').reduce((current, key) => current?.[key], order); if (value !== undefined && value !== null && value !== '') return value; } return ''; }
function getItems(order: any) { return getValue(order, ['lineItems', 'lineItems.items', 'items', 'order.lineItems']) || []; }
function getQuantity(order: any) { return (Array.isArray(getItems(order)) ? getItems(order) : []).reduce((total: number, item: any) => total + Number(getValue(item, ['quantity', 'physicalProperties.quantity']) || 0), 0); }
function getAddress(order: any) { const address = getValue(order, ['billingAddress', 'shippingInfo.shippingAddress', 'shippingAddress', 'recipientInfo.address']) || {}; return [address.addressLine, address.addressLine1, address.addressLine2, address.city, address.postalCode, address.country].filter(Boolean).join(', '); }
function getPhone(order: any) { return getValue(order, ['billingInfo.contactDetails.phone', 'shippingInfo.contactDetails.phone', 'buyerInfo.phone', 'phone']); }
function getCustomer(order: any) { return getValue(order, ['billingInfo.contactDetails.firstName', 'buyerInfo.firstName']) + ' ' + getValue(order, ['billingInfo.contactDetails.lastName', 'buyerInfo.lastName']); }

async function queryWixOrders() {
  const authorization = wixToken.startsWith('IST.') || wixToken.startsWith('Bearer ') ? (wixToken.startsWith('Bearer ') ? wixToken : `Bearer ${wixToken}`) : wixToken;
  const response = await fetch(wixOrdersUrl, { method: 'POST', headers: { Authorization: authorization, 'wix-site-id': wixSiteId, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: { paging: { limit: 100 } } }) });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Wix orders request failed (${response.status}): ${detail.slice(0, 500)}`);
  }
  const payload = await response.json();
  return Array.isArray(payload.orders) ? payload.orders : payload.orders?.items || [];
}

Deno.serve(async (request: Request) => {
  if (request.method !== 'POST' && request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
  try {
    const orders = await queryWixOrders();
    const shippingOrders = orders.filter(isShippingOrder).map((order: any, index: number) => ({
      id: `WIX-${getValue(order, ['id', 'order.id'])}`,
      customer: getCustomer(order).trim() || 'Wix customer',
      address: getAddress(order) || 'Address unavailable',
      phone: getPhone(order),
      area: 'Wix shipping',
      tubs: getQuantity(order),
      stop_order: index,
      completed: false
    })).filter((delivery: any) => delivery.id !== 'WIX-' && delivery.tubs > 0);
    const response = await fetch(`${deliveriesUrl}?on_conflict=id`, { method: 'POST', headers: { ...supabaseHeaders, Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(shippingOrders) });
    if (!response.ok) throw new Error(`Routeboard save failed (${response.status})`);
    return Response.json({ imported: shippingOrders.length, ignored: orders.length - shippingOrders.length });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Import failed' }, { status: 500 });
  }
});
