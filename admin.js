// NOTE: this is a lightweight, client-side passcode gate meant for a small single-admin
// setup. It is NOT secure authentication — anyone who reads this file can see the code.
// For real production use, replace this with a proper backend login.
const ADMIN_PASSCODE = "vela2026";

function money(n){ return `$${n.toFixed(2)}`; }

function getOrders(){
  try{ return JSON.parse(localStorage.getItem("vela_orders")) || []; }catch(e){ return []; }
}
function saveOrders(orders){ localStorage.setItem("vela_orders", JSON.stringify(orders)); }

let currentFilter = "All";

function checkGate(e){
  e.preventDefault();
  const val = document.getElementById("gatePasscode").value;
  if(val === ADMIN_PASSCODE){
    sessionStorage.setItem("vela_admin_ok", "1");
    document.getElementById("adminGate").style.display = "none";
    document.getElementById("adminApp").style.display = "block";
    renderAll();
  } else {
    document.getElementById("gateError").style.display = "block";
  }
}

function logout(){
  sessionStorage.removeItem("vela_admin_ok");
  location.reload();
}

function renderStats(){
  const orders = getOrders();
  const total = orders.length;
  const revenue = orders.reduce((s,o) => s + o.total, 0);
  const pending = orders.filter(o => o.status === "Pending").length;
  const completed = orders.filter(o => o.status === "Completed").length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statRevenue").textContent = money(revenue);
  document.getElementById("statPending").textContent = pending;
  document.getElementById("statCompleted").textContent = completed;
}

function setFilter(f){
  currentFilter = f;
  document.querySelectorAll(".filter-pill").forEach(p => p.classList.toggle("active", p.dataset.filter === f));
  renderOrders();
}

function statusBadgeClass(status){
  return {
    "Pending":"badge-pending",
    "Shipped":"badge-shipped",
    "Completed":"badge-completed",
    "Cancelled":"badge-cancelled",
  }[status] || "badge-pending";
}

function renderOrders(){
  const tbody = document.getElementById("ordersBody");
  const empty = document.getElementById("ordersEmpty");
  let orders = getOrders();
  if(currentFilter !== "All"){
    orders = orders.filter(o => o.status === currentFilter);
  }

  if(orders.length === 0){
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  tbody.innerHTML = orders.map(o => {
    const itemsStr = o.items.map(i => `${i.qty}x ${i.name}`).join("<br>");
    const waNumber = ""; // left blank: this simply re-opens a chat with the customer's number if provided
    const dateStr = new Date(o.date).toLocaleString();
    return `
      <tr>
        <td>
          <div class="order-id">${o.id}</div>
          <div class="order-date">${dateStr}</div>
        </td>
        <td>
          <div>${o.customer.name}</div>
          <div class="order-date">${o.customer.phone}</div>
        </td>
        <td class="order-items">${itemsStr}</td>
        <td>${o.customer.address}, ${o.customer.city}</td>
        <td><strong>${money(o.total)}</strong></td>
        <td>
          <select class="status-select" onchange="updateStatus('${o.id}', this.value)">
            ${["Pending","Shipped","Completed","Cancelled"].map(s => `<option value="${s}" ${o.status===s?"selected":""}>${s}</option>`).join("")}
          </select>
        </td>
      </tr>
    `;
  }).join("");
}

function updateStatus(orderId, status){
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if(order){ order.status = status; saveOrders(orders); }
  renderStats();
  renderOrders();
}

function renderAll(){
  renderStats();
  renderOrders();
}

document.addEventListener("DOMContentLoaded", () => {
  if(sessionStorage.getItem("vela_admin_ok") === "1"){
    document.getElementById("adminGate").style.display = "none";
    document.getElementById("adminApp").style.display = "block";
    renderAll();
  }
});
