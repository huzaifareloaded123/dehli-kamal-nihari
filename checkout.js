"use strict";
const MENU = [{"id": 1, "name": "Single Nihari", "price": 750, "image": ""}, {"id": 2, "name": "Single Nali Nihari", "price": 1120, "image": ""}, {"id": 3, "name": "Double Nali Nihari", "price": 2240, "image": ""}, {"id": 4, "name": "Maghaz Nihari", "price": 1080, "image": ""}, {"id": 5, "name": "Single Special Nihari", "price": 1570, "image": ""}, {"id": 6, "name": "Chicken Biryani", "price": 315, "image": ""}, {"id": 7, "name": "Paye", "price": 630, "image": ""}, {"id": 8, "name": "Beef Haleem", "price": 252, "image": ""}, {"id": 9, "name": "Chicken Karahi", "price": 360, "image": ""}, {"id": 10, "name": "Beef Qorma", "price": 360, "image": ""}, {"id": 11, "name": "Murgh Chanaa", "price": 360, "image": ""}, {"id": 12, "name": "Saada Chana", "price": 216, "image": ""}, {"id": 13, "name": "Daal", "price": 216, "image": ""}, {"id": 14, "name": "Sabzi", "price": 216, "image": ""}, {"id": 15, "name": "Curry Pakora", "price": 198, "image": ""}, {"id": 16, "name": "Sheermal", "price": 120, "image": ""}, {"id": 17, "name": "Taftan", "price": 108, "image": ""}, {"id": 18, "name": "Kulcha", "price": 90, "image": ""}, {"id": 19, "name": "Tandoori Roti", "price": 37, "image": ""}, {"id": 20, "name": "Farmaishi Chapati", "price": 22, "image": ""}];
const CART_KEY = "dehliKamalCheckoutCart";
const $ = id => document.getElementById(id);
const money = value => "Rs. " + value.toLocaleString("en-PK");
let cart = [];
try { const data = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); if(Array.isArray(data)) cart = data.filter(([id,q])=>MENU.some(p=>p.id===Number(id)) && Number.isInteger(q) && q>0 && q<=99).map(([id,q])=>[Number(id),q]); } catch(_){}
let preference = null;
try { preference = JSON.parse(localStorage.getItem("dehliKamalOrderPreference") || "null"); } catch(_){}
const pickup = preference?.type === "pickup";
const deliveryFee = pickup ? 0 : 350;
$("orderMode").firstChild.textContent = pickup ? "🏪   Pickup Order" : "🛵   Delivery Order";
$("paymentChoice").querySelector("strong").textContent = pickup ? "Cash on Pickup" : "Cash on Delivery";
if (pickup) { $("addressGroup").querySelector("label").innerHTML = "Pickup Notes (Optional)"; $("address").placeholder = "Optional pickup instructions"; $("instructions").placeholder = "Any special instructions?"; }
if (!pickup && preference) { const area = preference.area || preference.location || preference.address || preference.selectedArea || ""; if(typeof area === "string") $("selectedArea").textContent = area; }
const rows = cart.map(([id,quantity])=>({product:MENU.find(p=>p.id===id),quantity})).filter(r=>r.product);
const subtotal = rows.reduce((sum,r)=>sum+r.product.price*r.quantity,0);
const fee = rows.length ? deliveryFee : 0;
$("count").textContent = `${rows.reduce((s,r)=>s+r.quantity,0)} item(s)`;
$("subtotal").textContent = money(subtotal);
$("fee").textContent = money(fee);
$("grand").textContent = money(subtotal+fee);
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
$("items").innerHTML = rows.length ? rows.map(({product:p,quantity:q})=>`<div class="item"><div class="photo photo-fallback">✦</div><div class="item-body"><div class="item-name">${q} × ${escapeHtml(p.name)}</div><div class="item-meta">Rs. ${p.price.toLocaleString('en-PK')} each</div><div class="item-price">${money(p.price*q)}</div></div></div>`).join("") : '<p>Your cart is empty. <a href="index.html#menu">Browse the menu</a>.</p>';
for(const id of ["phone","alternatePhone"]) $(id).addEventListener("input",e=>e.target.value=e.target.value.replace(/\D/g,"").slice(0,11));
function message(text){$("message").textContent=text;$("mobileMessage").textContent=text;}
$("orderForm").addEventListener("submit",e=>{
 e.preventDefault(); message("");
 if(!rows.length){message("Your cart is empty. Please add items first.");return;}
 if(!/^\d{11}$/.test($("phone").value)){message("Please Enter a valid phone number");$("phone").focus();return;}
 const alt=$("alternatePhone").value;
 if(alt && !/^\d{11}$/.test(alt)){message("Please enter a valid alternate phone number");$("alternatePhone").focus();return;}
 if(!$("fullName").value.trim()){message("Please enter your full name.");$("fullName").focus();return;}
 if(!pickup && !$("address").value.trim()){message("Please enter your delivery address.");$("address").focus();return;}
 if($("email").value && !$("email").checkValidity()){message("Please enter a valid email address.");$("email").focus();return;}
 const lines = [
  "*DEHLI KAMAL NIHARI — NEW ORDER*",
  `Order type: ${pickup ? "Pickup" : "Delivery"}`,
  `Name: ${$("title").value} ${$("fullName").value.trim()}`,
  `Phone: ${$("phone").value}`,
  ...(alt ? [`Alternate phone: ${alt}`] : []),
  ...(!pickup ? [`Delivery address: ${$("address").value.trim()}`, `Area: ${$("selectedArea").textContent.trim()}`] : []),
  ...($("landmark").value.trim() ? [`Landmark: ${$("landmark").value.trim()}`] : []),
  "", "*ORDER ITEMS*",
  ...rows.map(({product,quantity})=>`${quantity} x ${product.name} — ${money(product.price*quantity)}`),
  "", `Subtotal: ${money(subtotal)}`, `Delivery fee: ${money(fee)}`,
  `*TOTAL: ${money(subtotal+fee)}*`,
  `Payment: ${pickup ? "Cash on Pickup" : "Cash on Delivery"}`,
  ...($("instructions").value.trim() ? [`Instructions: ${$("instructions").value.trim()}`] : []),
 ];
 const url = "https://wa.me/923001052625?text=" + encodeURIComponent(lines.join("\n"));
 message("WhatsApp khul raha hai. Order bhejne ke liye WhatsApp mein Send dabayein.");
 const link = document.createElement("a"); link.href=url; link.target="_blank"; link.rel="noopener noreferrer";
 link.textContent="WhatsApp par order bhejein"; link.className="whatsapp-fallback";
 const box=$("message"); box.replaceChildren(document.createTextNode("WhatsApp mein Send press karne ke baad hi order restaurant ko milega. "),link);
 $("mobileMessage").textContent="WhatsApp mein Send press karein; order automatically nahi bheja gaya.";
 window.open(url,"_blank","noopener,noreferrer");
});