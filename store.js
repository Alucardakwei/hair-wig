/* ===================== CONFIG ===================== */
// Change this to the admin's real WhatsApp number, country code first, no + or spaces.
// Example: "15551234567" for a US number, "2348012345678" for a Nigerian number.
const ADMIN_WHATSAPP_NUMBER = "15551234567";
const STORE_NAME = "Vela Wigs";

/* ===================== PRODUCT DATA ===================== */
const PRODUCTS = [
  { id: "p1", name: "Aurora Lace Front", type: "100% Human Hair - Lace Front", price: 289, oldPrice: 340, seed: "aurora-lace-front-wig-blonde" },
  { id: "p2", name: "Noir Bob", type: "Synthetic - Chin Length Bob", price: 129, oldPrice: null, seed: "noir-bob-wig-black-short" },
  { id: "p3", name: "Golden Hour Waves", type: "100% Human Hair - Body Wave", price: 319, oldPrice: null, seed: "golden-hour-waves-wig-honey" },
  { id: "p4", name: "Silk Press Bob", type: "Human Hair Blend - Straight Bob", price: 179, oldPrice: 210, seed: "silk-press-bob-wig-dark" },
  { id: "p5", name: "Honey Balayage Unit", type: "100% Human Hair - Full Lace", price: 349, oldPrice: null, seed: "honey-balayage-wig-unit" },
  { id: "p6", name: "Midnight Curl Crown", type: "Synthetic - Deep Curl", price: 149, oldPrice: null, seed: "midnight-curl-crown-wig-black" },
  { id: "p7", name: "Ivory Blonde Bob", type: "100% Human Hair - Lace Front Bob", price: 259, oldPrice: null, seed: "ivory-blonde-bob-wig-platinum" },
  { id: "p8", name: "Chestnut Glow", type: "Human Hair Blend - Layered Long", price: 229, oldPrice: 265, seed: "chestnut-glow-wig-long-brown" },
];

function imgUrl(seed, w, h){ return `https://picsum.photos/seed/${seed}/${w}/${h}`; }
function money(n){ return `$${n.toFixed(2)}`; }

/* ===================== CART STATE ===================== */
function getCart(){
  try{ return JSON.parse(localStorage.getItem("vela_cart")) || []; }catch(e){ return []; }
}
function saveCart(cart){ localStorage.setItem("vela_cart", JSON.stringify(cart)); renderCartCount(); }

function addToCart(productId){
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if(existing){ existing.qty += 1; } else { cart.push({ id: productId, qty: 1 }); }
  saveCart(cart);
  showToast("Added to cart");
}

function updateQty(productId, delta){
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){ cart = cart.filter(i => i.id !== productId); }
  saveCart(cart);
  renderDrawer();
}

function removeFromCart(productId){
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
  renderDrawer();
}

function cartTotal(cart){
  return cart.reduce((sum, i) => {
    const p = PRODUCTS.find(p => p.id === i.id);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
}

function renderCartCount(){
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

/* ===================== TOAST ===================== */
let toastTimer;
function showToast(msg){
  const el = document.getElementById("toast");
  if(!el) return;
  el.querySelector("span").textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.classList.remove("show"), 2200);
}

/* ===================== RENDER: PRODUCT GRID ===================== */
function renderProducts(){
  const grid = document.getElementById("productGrid");
  if(!grid) return;
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="card">
      <div class="card-media">
        <img src="${imgUrl(p.seed, 500, 640)}" alt="${p.name}" loading="lazy">
        ${p.oldPrice ? `<span class="card-tag">Sale</span>` : ""}
      </div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <div class="card-meta">${p.type}</div>
        <div class="card-footer">
          <div class="price">${p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span>` : ""}${money(p.price)}</div>
          <button class="add-btn" onclick="addToCart('${p.id}')" aria-label="Add ${p.name} to cart">
            <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M224,56H180.92l-38.51-55.6a8,8,0,0,0-13.82,0L90.08,56H48a8,8,0,0,0-7.93,9.14l16.72,120.13A16,16,0,0,0,72.65,199h110.7a16,16,0,0,0,15.86-13.73L216.07,65.14A8,8,0,0,0,224,56ZM128,32.66,153,56H103ZM183.35,183H72.65L58.14,72H197.86Z"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

/* ===================== RENDER: CART DRAWER ===================== */
function renderDrawer(){
  const body = document.getElementById("drawerBody");
  const foot = document.getElementById("drawerFoot");
  if(!body) return;
  const cart = getCart();
  if(cart.length === 0){
    body.innerHTML = `<div class="empty-cart">Your cart is empty.<br>Add a few wigs to get started.</div>`;
    foot.style.display = "none";
    return;
  }
  foot.style.display = "block";
  body.innerHTML = cart.map(i => {
    const p = PRODUCTS.find(p => p.id === i.id);
    if(!p) return "";
    return `
      <div class="cart-item">
        <img src="${imgUrl(p.seed, 120, 150)}" alt="${p.name}">
        <div class="cart-item-info">
          <h4>${p.name}</h4>
          <div class="meta">${money(p.price)} each</div>
          <div class="qty-control">
            <button onclick="updateQty('${p.id}', -1)">-</button>
            <span>${i.qty}</span>
            <button onclick="updateQty('${p.id}', 1)">+</button>
            <a class="remove-link" onclick="removeFromCart('${p.id}')">Remove</a>
          </div>
        </div>
        <div class="cart-item-price">${money(p.price * i.qty)}</div>
      </div>
    `;
  }).join("");
  document.getElementById("subtotalAmount").textContent = money(cartTotal(cart));
}

/* ===================== DRAWER OPEN / CLOSE ===================== */
function openDrawer(){
  renderDrawer();
  document.getElementById("cartOverlay").classList.add("open");
  document.getElementById("cartDrawer").classList.add("open");
}
function closeDrawer(){
  document.getElementById("cartOverlay").classList.remove("open");
  document.getElementById("cartDrawer").classList.remove("open");
}

/* ===================== CHECKOUT MODAL ===================== */
function openCheckout(){
  const cart = getCart();
  if(cart.length === 0){ showToast("Your cart is empty"); return; }
  closeDrawer();
  renderCheckoutSummary();
  document.getElementById("checkoutOverlay").classList.add("open");
}
function closeCheckout(){
  document.getElementById("checkoutOverlay").classList.remove("open");
}
function renderCheckoutSummary(){
  const cart = getCart();
  const el = document.getElementById("checkoutSummary");
  const rows = cart.map(i => {
    const p = PRODUCTS.find(p => p.id === i.id);
    return `<div class="order-summary-row"><span>${p.name} x${i.qty}</span><span>${money(p.price * i.qty)}</span></div>`;
  }).join("");
  el.innerHTML = rows + `<div class="order-summary-row total"><span>Total</span><span>${money(cartTotal(cart))}</span></div>`;
}

function submitOrder(e){
  e.preventDefault();
  const cart = getCart();
  if(cart.length === 0) return;

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const city = document.getElementById("custCity").value.trim();
  const note = document.getElementById("custNote").value.trim();

  if(!name || !phone || !address || !city){
    showToast("Please fill in all required fields");
    return;
  }

  const orderId = "VEL-" + Date.now().toString().slice(-6);
  const total = cartTotal(cart);
  const lineItems = cart.map(i => {
    const p = PRODUCTS.find(p => p.id === i.id);
    return { id: p.id, name: p.name, qty: i.qty, price: p.price };
  });

  const order = {
    id: orderId,
    date: new Date().toISOString(),
    customer: { name, phone, address, city, note },
    items: lineItems,
    total,
    status: "Pending",
  };

  // Save order so the admin dashboard can display it
  const orders = JSON.parse(localStorage.getItem("vela_orders") || "[]");
  orders.unshift(order);
  localStorage.setItem("vela_orders", JSON.stringify(orders));

  // Build the WhatsApp message
  let msg = `New order from ${STORE_NAME}\n\n`;
  msg += `Order ID: ${orderId}\n`;
  msg += `Customer: ${name}\n`;
  msg += `Phone: ${phone}\n`;
  msg += `Address: ${address}, ${city}\n`;
  if(note) msg += `Note: ${note}\n`;
  msg += `\nItems:\n`;
  lineItems.forEach(li => { msg += `- ${li.qty} x ${li.name} (${money(li.price)} each)\n`; });
  msg += `\nTotal: ${money(total)}`;

  const waUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

  // Clear cart, close modal, confirm to the customer
  saveCart([]);
  closeCheckout();
  document.getElementById("checkoutForm").reset();
  showOrderConfirmation(orderId, waUrl);
}

function showOrderConfirmation(orderId, waUrl){
  const overlay = document.getElementById("confirmOverlay");
  document.getElementById("confirmOrderId").textContent = orderId;
  document.getElementById("confirmWaLink").href = waUrl;
  overlay.classList.add("open");
  // auto-open WhatsApp for the customer
  window.open(waUrl, "_blank");
}
function closeConfirm(){
  document.getElementById("confirmOverlay").classList.remove("open");
}

/* ===================== INIT ===================== */
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderCartCount();
  renderDrawer();

  document.getElementById("year").textContent = new Date().getFullYear();
});
