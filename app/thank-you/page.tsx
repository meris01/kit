"use client";
import {useEffect,useState} from 'react';
export default function ThankYou(){
 const [status,setStatus]=useState('checking');const [attempt,setAttempt]=useState(0);const [url,setUrl]=useState('');
 useEffect(()=>{let active=true;let timer:ReturnType<typeof setTimeout>;let checks=0;
  async function check(){try{const res=await fetch('/api/order-status',{cache:'no-store'});const d=await res.json() as {status:string;redirectUrl?:string};if(!active)return;setStatus(d.status);if(d.status==='succeeded'&&d.redirectUrl){setUrl(d.redirectUrl);window.location.replace(d.redirectUrl);return;}if(['pending','processing','requires_confirmation'].includes(d.status)&&++checks<8)timer=setTimeout(check,3000);}catch{if(active)setStatus('unavailable');}}
  check();return()=>{active=false;clearTimeout(timer)};
 },[attempt]);
 const paid=status==='succeeded';const failed=status==='failed'||status==='cancelled';
 return <main className="status-card"><p className="eyebrow">AI INCOME STARTER KIT</p><h1>{paid?'Your kit is ready.':failed?'Your payment wasn’t completed.':status==='checking'?'Checking your payment…':'Let’s confirm your access.'}</h1><p>{paid?'Payment confirmed. Opening your Google Drive folder now…':failed?'You can return to the kit and try again when you’re ready.':"We haven’t confirmed a completed payment in this browser yet. If your payment is still processing, this page will check again. You can also use the access link in your Dodo purchase email."}</p>{paid&&url&&<a className="button" href={url}>Open my kit ↗</a>}{!paid&&!failed&&<button className="button" onClick={()=>{setStatus('checking');setAttempt(x=>x+1)}} disabled={status==='checking'}>Check payment status</button>}<p><a className="text-link" href="/">Back to the kit ↗</a></p></main>
}
