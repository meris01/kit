import { config,dodo,sign,session,json,type Product,type Checkout } from '../../../lib/payment';
export async function POST(request:Request){
 try{
  const c=config(); const origin=request.headers.get('origin');const requestUrl=new URL(request.url);
  const allowed=new Set([new URL(c.site).origin]);if(process.env.NODE_ENV!=='production'){allowed.add('http://localhost:5173');allowed.add('http://127.0.0.1:5173');}
  if(!origin||!allowed.has(origin)||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Please start checkout from the kit page.'},403);
  const recent=await session(request);if(recent&&Date.now()-recent.issued<15000)return json({error:'Please wait a few seconds before reopening checkout.'},429,{'Retry-After':'15'});
  // Never accept a product, quantity, price or redirect URL from the browser.
  const product=await dodo<Product>('/products/'+encodeURIComponent(c.product));
  if(product.price?.price!==49900||product.price?.currency!=='INR'||product.is_recurring||product.digital_product_delivery?.external_url!==c.delivery)throw new Error('Product is not ready');
  const checkout=await dodo<Checkout>('/checkouts','POST',{product_cart:[{product_id:c.product,quantity:1}],return_url:c.site+'/thank-you',cancel_url:c.site+'/#get-kit',feature_flags:{allow_currency_selection:false,allow_discount_code:false},metadata:{source:'ai-income-starter-kit-landing'},customization:{show_order_details:true}});
  const url=new URL(checkout.checkout_url);if(url.protocol!=='https:'||!(url.hostname==='checkout.dodopayments.com'||url.hostname.endsWith('.dodopayments.com')))throw new Error('Unexpected checkout URL');
  const value=checkout.session_id+'.'+Date.now();const cookie=value+'.'+await sign(value);const secure=requestUrl.protocol==='https:'?'; Secure':'';
  return json({url:url.toString()},200,{'Set-Cookie':`kit_checkout=${cookie}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${secure}`});
 }catch(error){console.error('Checkout could not be created:',error instanceof Error?error.message:'Unknown error');return json({error:'Checkout is temporarily unavailable. Please try again shortly.'},503);}
}
