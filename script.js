"use strict";

const RAZORPAY_KEY_ID = "rzp_live_T1YDJqR5ANikn2";
const CART_STORAGE_KEY = "jersey-unmatched-cart-v1";

let products = [];
let cart = loadCart();
let checkoutStepVisible = false;

const formatCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const policies = {
  terms: {
    eyebrow: "Legal",
    title: "Terms and Conditions",
    intro: "These terms govern your use of jerseyunmatched.online and any purchase made through this website.",
    sections: [
      ["Orders and acceptance", "An order is considered accepted after successful payment and confirmation. We may cancel and refund an order if an item is unavailable, pricing is incorrect, or fulfilment is not possible."],
      ["Product information", "We aim to display product colours, sizing, descriptions, and prices accurately. Screen settings and manufacturing batches may cause minor visual differences."],
      ["Customer responsibilities", "Customers must provide a valid phone number and complete delivery address. Additional delivery charges caused by incorrect or incomplete information may be payable by the customer."],
      ["Website use", "Content on this website may not be copied, resold, or used commercially without written permission. Misuse of the website or payment process may result in order cancellation."]
    ]
  },
  shipping: {
    eyebrow: "Delivery",
    title: "Shipping and Delivery",
    intro: "We ship eligible orders across India using trackable delivery partners.",
    sections: [
      ["Processing time", "Orders are normally checked, packed, and dispatched within 1–3 business days after payment confirmation. Weekends and public holidays may extend processing time."],
      ["Estimated delivery", "Most orders arrive within 4–9 business days after dispatch, depending on the destination PIN code and courier conditions."],
      ["Tracking", "When available, tracking information is shared using the contact details supplied during checkout. Tracking may take up to 24 hours to activate after dispatch."],
      ["Delays and failed delivery", "Weather, regional restrictions, courier disruptions, and incorrect addresses may cause delays. Please contact support if an order is significantly overdue."]
    ]
  },
  privacy: {
    eyebrow: "Your Data",
    title: "Privacy Policy",
    intro: "We collect only the information needed to process orders, provide support, and improve the shopping experience.",
    sections: [
      ["Information collected", "During checkout we collect your name, phone number, shipping address, order contents, and payment reference. Contact messages may also include your name and email address."],
      ["How information is used", "Information is used to fulfil orders, provide delivery updates, prevent fraud, respond to support requests, and meet legal obligations."],
      ["Payments", "Payments are processed by Razorpay. We do not collect or store card, UPI PIN, or banking credentials on this website."],
      ["Retention and rights", "Order records may be retained for accounting and legal purposes. You may contact us to request correction of inaccurate personal information, subject to applicable law."]
    ]
  },
  refund: {
    eyebrow: "Returns",
    title: "Cancellation and Refund",
    intro: "Please review sizing and delivery information carefully before placing an order.",
    sections: [
      ["Cancellation window", "Cancellation requests should be made within 3 hours of payment. A request cannot be guaranteed once packing or dispatch has begun."],
      ["Damaged or incorrect items", "Contact support within 48 hours of delivery with your transaction ID and clear unboxing photographs if an item arrives damaged, defective, or different from the confirmed order."],
      ["Size exchanges", "Unused items with original tags may be eligible for a size exchange, subject to stock availability. Return shipping charges may apply unless the wrong size was sent."],
      ["Refund timing", "Approved refunds are initiated to the original payment method. Banks and payment providers may take 5–10 business days to reflect the credit."]
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  renderPolicies();
  renderCart();
  loadProducts();
  document.getElementById("current-year").textContent = new Date().getFullYear();
});

function bindEvents() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  document.getElementById("mobile-menu-button").addEventListener("click", toggleMobileMenu);
  document.getElementById("cart-button").addEventListener("click", openCart);
  document.getElementById("close-cart").addEventListener("click", closeCart);
  document.getElementById("checkout-button").addEventListener("click", proceedToCheckout);
  document.getElementById("success-close").addEventListener("click", closeSuccessModal);

  document.getElementById("cart-drawer").addEventListener("click", (event) => {
    if (event.target.id === "cart-drawer") closeCart();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeCart();
    closeSuccessModal();
  });

  document.getElementById("contact-form").addEventListener("submit", handleContactForm);
}

async function loadProducts() {
  const status = document.getElementById("product-status");
  const grid = document.getElementById("product-grid");

  try {
    const response = await fetch("products.json");
    if (!response.ok) throw new Error(`Product request failed with status ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Product data must be an array.");

    products = data;
    renderProducts();
    status.classList.add("hidden");
    grid.classList.remove("hidden");
    grid.classList.add("grid");
  } catch (error) {
    console.error("Could not load products:", error);
    status.innerHTML = `
      <p class="font-bold text-red-300">The collection could not be loaded.</p>
      <p class="mt-2 text-sm">Open this site through a web server (including GitHub Pages), rather than directly from the file system.</p>
    `;
  }
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  grid.replaceChildren();

  products.forEach((product) => {
    const article = document.createElement("article");
    article.className = "group overflow-hidden rounded-3xl border border-white/10 bg-panel transition duration-300 hover:-translate-y-1 hover:border-gold/50";

    const imageWrap = document.createElement("div");
imageWrap.className =
  "flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto bg-white/5";

const productImages =
  Array.isArray(product.images) && product.images.length
    ? product.images
    : [product.image_url];

productImages.forEach((imagePath, imageIndex) => {
  const imageSlide = document.createElement("div");
  imageSlide.className = "h-full min-w-full snap-center";

  const image = document.createElement("img");
  image.src = imagePath;
  image.alt = `${product.name} image ${imageIndex + 1}`;
  image.loading = "lazy";
  image.className = "h-full w-full object-cover";

  imageSlide.append(image);
  imageWrap.append(imageSlide);
});

    const content = document.createElement("div");
    content.className = "p-5";

    const price = document.createElement("p");
    price.className = "text-sm font-extrabold text-gold";
    price.textContent = formatCurrency.format(product.price);

    const title = document.createElement("h3");
    title.className = "mt-2 text-xl font-bold";
    title.textContent = product.name;

    const description = document.createElement("p");
    description.className = "mt-2 min-h-12 text-sm leading-6 text-white/45";
    description.textContent = product.description;

    const controls = document.createElement("div");
    controls.className = "mt-5 flex gap-2";

    const sizeSelect = document.createElement("select");
    sizeSelect.id = `size-${product.id}`;
    sizeSelect.setAttribute("aria-label", `Select size for ${product.name}`);
    sizeSelect.className = "rounded-xl border border-white/10 bg-ink px-3 py-3 text-sm outline-none focus:border-gold";
    product.sizes.forEach((size) => {
      const option = document.createElement("option");
      option.value = size;
      option.textContent = size;
      sizeSelect.append(option);
    });

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "flex-1 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-ink transition hover:bg-gold";
    addButton.textContent = "Add to bag";
    addButton.addEventListener("click", () => addToCart(product.id, sizeSelect.value));

    controls.append(sizeSelect, addButton);
    content.append(price, title, description, controls);
    article.append(imageWrap, content);
    grid.append(article);
  });
}

function switchTab(tabId) {
  const target = document.getElementById(tabId);
  if (!target || !target.classList.contains("page-panel")) return;

  document.querySelectorAll(".page-panel").forEach((panel) => panel.classList.remove("active"));
  target.classList.add("active");

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.tab === tabId);
  });

  closeMobileMenu();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  const button = document.getElementById("mobile-menu-button");
  const isOpening = menu.classList.contains("hidden");
  menu.classList.toggle("hidden");
  button.setAttribute("aria-expanded", String(isOpening));
}

function closeMobileMenu() {
  document.getElementById("mobile-menu").classList.add("hidden");
  document.getElementById("mobile-menu-button").setAttribute("aria-expanded", "false");
}

function addToCart(productId, size) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId && item.size === size);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  openCart();
}

function changeQuantity(index, change) {
  if (!cart[index]) return;
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart();
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = getCartTotal();

  document.getElementById("cart-count").textContent = count;
  document.getElementById("cart-total").textContent = formatCurrency.format(total);
  document.getElementById("checkout-button").disabled = cart.length === 0;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="flex h-full flex-col items-center justify-center text-center">
        <div class="rounded-full border border-white/10 p-5 text-white/20">
          <svg class="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/>
          </svg>
        </div>
        <p class="mt-5 font-bold">Your bag is empty</p>
        <p class="mt-2 text-sm text-white/35">Your next match-day jersey belongs here.</p>
      </div>
    `;
    resetCheckoutStep();
    return;
  }

  container.replaceChildren();
  cart.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "mb-4 grid grid-cols-[72px_1fr_auto] gap-3 rounded-2xl border border-white/10 bg-panel p-3";

    const image = document.createElement("img");
    image.src = item.image_url;
    image.alt = "";
    image.className = "h-20 w-[72px] rounded-xl object-cover";

    const details = document.createElement("div");
    details.className = "min-w-0";

    const title = document.createElement("p");
    title.className = "truncate text-sm font-bold";
    title.textContent = item.name;

    const meta = document.createElement("p");
    meta.className = "mt-1 text-xs text-gold";
    meta.textContent = `Size ${item.size} · ${formatCurrency.format(item.price)}`;

    const quantity = document.createElement("div");
    quantity.className = "mt-3 flex w-fit items-center rounded-lg border border-white/10";

    const decrease = makeQuantityButton("−", `Decrease quantity of ${item.name}`, () => changeQuantity(index, -1));
    const value = document.createElement("span");
    value.className = "min-w-8 text-center text-xs font-bold";
    value.textContent = item.quantity;
    const increase = makeQuantityButton("+", `Increase quantity of ${item.name}`, () => changeQuantity(index, 1));
    quantity.append(decrease, value, increase);
    details.append(title, meta, quantity);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "self-start p-1 text-lg text-white/30 hover:text-red-300";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${item.name}`);
    remove.addEventListener("click", () => removeFromCart(index));

    row.append(image, details, remove);
    container.append(row);
  });
}

function makeQuantityButton(label, ariaLabel, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "h-8 w-8 text-sm text-white/60 hover:text-gold";
  button.textContent = label;
  button.setAttribute("aria-label", ariaLabel);
  button.addEventListener("click", handler);
  return button;
}

function openCart() {
  const drawer = document.getElementById("cart-drawer");
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
  document.getElementById("close-cart").focus();
}

function closeCart() {
  const drawer = document.getElementById("cart-drawer");
  if (!drawer.classList.contains("is-open")) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
}

function proceedToCheckout() {
  if (!cart.length) return;

  const form = document.getElementById("checkout-form");
  const button = document.getElementById("checkout-button");

  if (!checkoutStepVisible) {
    checkoutStepVisible = true;
    form.classList.remove("hidden");
    button.textContent = "Pay now with Razorpay";
    document.getElementById("customer-name").focus();
    return;
  }

  if (!form.reportValidity()) return;
  startRazorpayCheckout();
}

function startRazorpayCheckout() {
  if (RAZORPAY_KEY_ID === "rzp_test_T1SowsNwXzKTUE") {
    alert("Add your Razorpay Key ID to script.js before accepting live payments.");
    return;
  }

  if (typeof window.Razorpay !== "function") {
    alert("Razorpay Checkout could not be loaded. Check your connection and try again.");
    return;
  }

  const customer = {
    name: document.getElementById("customer-name").value.trim(),
    phone: document.getElementById("customer-phone").value.trim(),
    address: document.getElementById("customer-address").value.trim()
  };


  const totalAmount = getCartTotal();
  const itemSummary = cart
    .map((item) => `${item.name} [${item.size}] x${item.quantity}`)
    .join("; ")
    .slice(0, 2000);

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: totalAmount * 100,
    currency: "INR",
    name: "Jersey Unmatched",
    description: `${cart.reduce((sum, item) => sum + item.quantity, 0)} jersey item(s)`,
    handler(response) {
      const orderData = {
  customerName: customer.name,
  phone: customer.phone,
  address: customer.address,
  paymentId: response.razorpay_payment_id,
  cart: cart
};

saveOrderToGoogleSheets(orderData);
      processSuccessfulOrder({
        paymentId: response.razorpay_payment_id,
        customer,
        items: cart.map((item) => ({ ...item })),
        amount: totalAmount
      });
    },
    prefill: {
      name: customer.name,
      contact: customer.phone
    },
    notes: {
      Shipping_Details: customer.address.slice(0, 500),
      Items_Ordered: itemSummary
    },
    theme: { color: "#f4b942" },
    modal: { escape: true }
  };

  const checkout = new window.Razorpay(options);
  checkout.on("payment.failed", (response) => {
    console.error("Razorpay payment failed:", response.error);
    alert("Payment was not completed. No order has been placed.");
  });
  checkout.open();
}

/**
 * Handles the browser-side success response.
 *
 * The merchant can find the payment ID, notes, customer contact, and amount in
 * Razorpay Dashboard > Transactions > Payments. For a production store, do not
 * fulfil an order based only on this client callback. Create a Razorpay Order
 * on a trusted server/serverless function, verify razorpay_signature there,
 * and persist the verified order or send it to the store owner's order system.
 */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzzHKffOtb49YbL-I1GD1VKIGo5QTNyEQMDFlG5zCw3cHMMWWrhhWU6dkiPFnX4yV6i/exec";

async function saveOrderToGoogleSheets(orderData) {

  try {

    await fetch(GOOGLE_SCRIPT_URL, {

      method: "POST",

      mode: "no-cors",

      headers: {

        "Content-Type": "application/json"

      },

      body: JSON.stringify(orderData)

    });

  }

  catch(error) {

    console.error(error);

  }

}
function processSuccessfulOrder(orderData) {
  console.info("Successful checkout received:", orderData);

  cart = [];
  saveCart();
  renderCart();
  closeCart();

  document.getElementById("success-name").textContent = orderData.customer.name;
  document.getElementById("success-payment-id").textContent = orderData.paymentId;

  const modal = document.getElementById("success-modal");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("success-close").focus();
}

function closeSuccessModal() {
  const modal = document.getElementById("success-modal");
  if (!modal.classList.contains("is-open")) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  switchTab("products");
}

function resetCheckoutStep() {
  checkoutStepVisible = false;
  document.getElementById("checkout-form").classList.add("hidden");
  document.getElementById("checkout-form").reset();
  document.getElementById("checkout-button").textContent = "Proceed to delivery details";
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function renderPolicies() {
  Object.entries(policies).forEach(([id, policy]) => {
    const section = document.getElementById(id);
    section.innerHTML = `
      <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <p class="text-xs font-bold uppercase tracking-[0.28em] text-gold">${policy.eyebrow}</p>
        <h2 class="mt-4 font-display text-4xl uppercase sm:text-5xl">${policy.title}</h2>
        <p class="mt-5 max-w-2xl text-lg leading-8 text-white/55">${policy.intro}</p>
        <div class="mt-10 divide-y divide-white/10 border-y border-white/10">
          ${policy.sections.map(([heading, body]) => `
            <article class="py-7">
              <h3 class="font-bold">${heading}</h3>
              <p class="mt-2 text-sm leading-7 text-white/50">${body}</p>
            </article>
          `).join("")}
        </div>
        <p class="mt-6 text-xs text-white/30">Last updated: June 14, 2026. Replace this sample policy text with terms reviewed for your business before launch.</p>
      </div>
    `;
  });
}

function handleContactForm(event) {
  event.preventDefault();
  const status = document.getElementById("contact-status");
  status.textContent = "Thanks — your message is ready. Connect this form to a form service to receive submissions.";
  status.classList.remove("hidden");
  event.currentTarget.reset();
}
