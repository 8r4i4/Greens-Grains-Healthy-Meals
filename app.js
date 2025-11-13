// Configuration: set your WhatsApp phone number here
const WHATSAPP_NUMBER = "+15551234567"; // Change to your number

function makeWhatsAppLink(message = "Hi! I'd like to order healthy meals.") {
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function bindWhatsAppButtons() {
  const orderCtas = [
    document.getElementById("orderWhatsApp"),
    document.getElementById("ctaWhatsApp"),
    document.getElementById("whatsappFab"),
  ].filter(Boolean);

  orderCtas.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(makeWhatsAppLink(), "_blank");
    });
  });

  document.querySelectorAll("[data-item]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const item = btn.getAttribute("data-item");
      const href = btn.getAttribute("href");
      if (!href || href === "#" || href === "") {
        e.preventDefault();
        window.location.href = `item.html?item=${encodeURIComponent(item)}`;
      }
    });
  });

  document.querySelectorAll("[data-plan]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const plan = btn.getAttribute("data-plan");
      window.open(
        makeWhatsAppLink(`Hi! I'm interested in the ${plan} weekly plan.`),
        "_blank"
      );
    });
  });
}

function smoothScrollNav() {
  document.querySelectorAll("header .nav a").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

function mobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
}

function setYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
}

function initTheme() {
  try {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    applyTheme(theme);
    const sw = document.getElementById("checkbox");
    if (sw) {
      // theme, checked here means its light mode
      sw.checked = theme === "light";
      sw.addEventListener("change", () => {
        const t = sw.checked ? "light" : "dark";
        applyTheme(t);
        localStorage.setItem("theme", t);
      });
    }
  } catch (e) { /* no-op */ }
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setYear();
  bindWhatsAppButtons();
  smoothScrollNav();
  mobileNav();
  initItemPage();
});

// ----- Item details page logic -----
const ITEMS = {
  "Quinoa Power Bowl": {
    price: 1400,
    calories: 520,
    carbs: 65,
    protein: 24,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Food-salad-healthy-colorful_(24242433051).jpg",
    desc: "Roasted veggies, chickpeas, tahini."
  },
  "Chicken Protein Plate": {
    price: 1600,
    calories: 610,
    carbs: 55,
    protein: 38,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chicken%20Fillet%20Salad.JPG",
    desc: "Grilled chicken, brown rice, greens."
  },
  "Mediterranean Salad": {
    price: 1200,
    calories: 430,
    carbs: 40,
    protein: 16,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/GreekSalad2.JPG",
    desc: "Feta, olives, cucumbers, lemon vinaigrette."
  },
  "Green Smoothie": {
    price: 600,
    calories: 290,
    carbs: 35,
    protein: 8,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Pr%C3%A9paration%20de%20green%20smoothie%20crudivore%20v%C3%A9g%C3%A9tal%20avec%20bol%20mixeur%20et%20pissenlis.jpg",
    desc: "Spinach, banana, almond milk, chia."
  },
  "Salmon Buddha Bowl": {
    price: 2200,
    calories: 650,
    carbs: 50,
    protein: 36,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Salmon%20salad.jpeg",
    desc: "Wild salmon, quinoa, avocado, sesame."
  },
  "Vegan Lentil Bowl": {
    price: 1300,
    calories: 540,
    carbs: 60,
    protein: 22,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Healthy%20Lentil%20Salad%20(Unsplash).jpg",
    desc: "Spiced lentils, roasted carrots, herbs."
  }
};

function fmt(n) { return `DZD ${Math.round(n)}`; }
function getParam(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

function calcTotal(base, qty, coupon) {
  let subtotal = base * qty;
  const code = (coupon || "").trim().toUpperCase();
  if (!code) return { total: subtotal, applied: null };
  const percentCodes = { SAVE10: 10, FIT15: 15 };
  const fixedCodes = { WELCOME5: 5 };
  if (percentCodes[code]) {
    subtotal = subtotal * (1 - percentCodes[code] / 100);
    return { total: Math.max(0, subtotal), applied: code };
  }
  if (fixedCodes[code]) {
    subtotal = subtotal - fixedCodes[code];
    return { total: Math.max(0, subtotal), applied: code };
  }
  return { total: subtotal, applied: null };
}

function initItemPage() {
  // Detect presence of item page elements
  const titleEl = document.getElementById("itemTitle");
  if (!titleEl) return;

  const itemName = decodeURIComponent(getParam("item") || "");
  const item = ITEMS[itemName] || null;

  const imgEl = document.getElementById("itemImage");
  const descEl = document.getElementById("itemDesc");
  const priceEl = document.getElementById("itemPrice");
  const kcalEl = document.getElementById("itemCalories");
  const carbsEl = document.getElementById("itemCarbs");
  const proteinEl = document.getElementById("itemProtein");
  const qtyEl = document.getElementById("qty");
  const couponEl = document.getElementById("coupon");
  const totalEl = document.getElementById("totalPrice");
  const applyBtn = document.getElementById("applyCoupon");
  const orderBtn = document.getElementById("orderBtn");

  // Fallback if unknown item
  const name = item ? itemName : "Healthy Bowl";
  const base = item ? item.price : 1500;
  const img = item ? item.image : "assets/hero-healthy.svg";
  const desc = item ? item.desc : "Balanced bowl, fresh ingredients.";
  const calories = item ? item.calories : 520;
  const carbs = item ? item.carbs : 55;
  const protein = item ? item.protein : 25;

  titleEl.textContent = name;
  descEl.textContent = desc;
  if (imgEl) {
    imgEl.src = img;
    // Ensure external images load without referrer issues and have a safe fallback
    imgEl.referrerPolicy = "no-referrer";
    imgEl.onerror = function() { this.onerror = null; this.src = "assets/hero-healthy.svg"; };
  }
  priceEl.textContent = fmt(base);
  kcalEl.textContent = `${calories} kcal`;
  if (carbsEl) carbsEl.textContent = `Carbs ${carbs} g`;
  if (proteinEl) proteinEl.textContent = `Protein ${protein} g`;

  const updateTotal = () => {
    const qty = Math.max(1, Math.min(10, Number(qtyEl.value || 1)));
    qtyEl.value = qty;
    const coupon = couponEl.value || "";
    const { total } = calcTotal(base, qty, coupon);
    totalEl.textContent = fmt(total);
  };

  qtyEl.addEventListener("input", updateTotal);
  applyBtn.addEventListener("click", (e) => { e.preventDefault(); updateTotal(); });
  updateTotal();

  orderBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const qty = Math.max(1, Math.min(10, Number(qtyEl.value || 1)));
    const coupon = (couponEl.value || "").trim();
    const { total, applied } = calcTotal(base, qty, coupon);
    const parts = [
      `Hi! I'd like to order: ${name}`,
      `Qty: ${qty}`,
      `Base: ${fmt(base)} each`,
      applied ? `Coupon: ${applied}` : null,
      `Total: ${fmt(total)}`,
    ].filter(Boolean);
    window.open(makeWhatsAppLink(parts.join(" | ")), "_blank");
  });
}