# AI Income Starter Kit — website setup

The application reads its server-only settings from `.env.local` in local development and from encrypted Sites runtime settings when hosted. `.env.local` is ignored by Git. `.env.example` contains the same keys without values.

| Setting | Purpose |
| --- | --- |
| DODO_PAYMENTS_API_KEY | Dodo API access; never expose in browser code. |
| DODO_PRODUCT_ID | The existing kit product in Dodo. |
| DODO_ENVIRONMENT | `live_mode` for this configured account. |
| SITE_URL | The canonical website origin, without a trailing slash. |
| CHECKOUT_SESSION_SECRET | A separate randomly generated secret for signing the browser’s checkout cookie. |
| KIT_DELIVERY_URL | The Google Drive folder to return only after confirmed payment. |

## Buyer flow

The buy button calls the server. The server verifies the fixed INR 499 product and its delivery URL, creates a Dodo checkout, and saves a signed, HttpOnly checkout cookie. Dodo returns to `/thank-you`. The page asks `/api/order-status` to verify that checkout directly with Dodo. Only `payment_status: succeeded` returns the Google Drive URL. The browser then redirects automatically, with an “Open my kit” fallback link.

No webhook secret is required by this flow: status is fetched directly from Dodo, and Dodo handles its own delivery email. Do not invent or add a webhook secret unless implementing and registering a webhook endpoint.

The server does not trust payment query parameters, browser-supplied prices, products, or redirect destinations. A lost cookie cannot prove payment in this browser; the buyer can still use the Dodo purchase email. API key rotation does not invalidate checkout cookies because the session secret is separate.

## Delivery and launch notes

The Drive folder was accessible to a signed-out browser and contained 21 PDF/Excel files when checked on 19 September 2026. A shared Drive link can be forwarded by a buyer; this is link-based delivery rather than individual file access control.

Live checkout opening and the INR 499 total were verified without submitting a charge. Success, pending, failure, tampering, expiry and cross-origin cases were tested with simulated provider responses. A real paid order and its email delivery have not been completed during QA.

Before sending customer traffic, confirm the seller name, support contact and purchase policies in Dodo. Its checkout currently displays the business name “Business.” Site access must be public for customers; Sites defaults to a private owner preview.

For local preview, install dependencies with `npm run install:ci`, then run `npm run dev`. Build with `npm run build`. Keep the env file out of uploads, screenshots and version control. After changing environment values locally, restart the preview. Hosted values must also be updated separately before redeployment.
