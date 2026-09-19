import { config, json } from "../../../../lib/payment";

function bytesToBase64(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

async function verify(rawBody: string, request: Request) {
  const key = config().webhookKey;
  const id = request.headers.get("webhook-id");
  const timestamp = request.headers.get("webhook-timestamp");
  const signatures = request.headers.get("webhook-signature")?.split(" ") ?? [];
  if (!key || !id || !timestamp || signatures.length === 0) return false;
  const secret = key.startsWith("whsec_") ? key.slice(6) : key;
  let secretBytes: Uint8Array;
  try { secretBytes = Uint8Array.from(atob(secret), (char) => char.charCodeAt(0)); } catch { return false; }
  const cryptoKey = await crypto.subtle.importKey("raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(`${id}.${timestamp}.${rawBody}`));
  const expected = bytesToBase64(signed);
  return signatures.some((value) => value === `v1,${expected}`);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!(await verify(rawBody, request))) return json({ error: "Invalid webhook signature" }, 401);
  let payload: { type?: string; data?: { product_id?: string; payment_id?: string; status?: string } };
  try { payload = JSON.parse(rawBody); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (payload.data?.product_id && payload.data.product_id !== config().product) return json({ error: "Unknown product" }, 400);
  console.info("Dodo webhook received", payload.type, payload.data?.payment_id, payload.data?.status);
  return json({ received: true });
}

export async function GET() { return json({ ok: true, endpoint: "dodo" }); }
