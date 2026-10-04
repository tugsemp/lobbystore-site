// İletişim bilgileri — doldurulduğunda form bu kanala gider ve footer'da görünür.
// whatsapp: ülke koduyla, sadece rakam (örn. "905321234567")
const CONTACT = {
  whatsapp: "",
  email: "",
  phoneLabel: "",
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// nav
const nav = $("#nav");
const stickyCta = $("#stickyCta");
const contactSection = $("#iletisim");
const onScroll = () => {
  nav.classList.toggle("is-stuck", window.scrollY > 24);
  const nearForm = contactSection.getBoundingClientRect().top < window.innerHeight;
  stickyCta.classList.toggle("is-on", window.scrollY > 600 && !nearForm);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const burger = $("#burger");
const links = $("#navLinks");
const setMenu = (open) => {
  links.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", String(open));
  if (open) nav.classList.add("is-stuck");
  else onScroll();
};
burger.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
links.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));

// reveal
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-in");
    io.unobserve(e.target);
  }),
  { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
);
$$(".reveal").forEach((el) => io.observe(el));

// showcase
const tabs = $$(".show__tabs button");
const showImg = $("#showImg");
const pad = (n) => String(n).padStart(2, "0");
let showTimer;
const selectTab = (tab) => {
  if (tab.classList.contains("is-on")) return;
  tabs.forEach((t) => {
    const on = t === tab;
    t.classList.toggle("is-on", on);
    t.setAttribute("aria-selected", String(on));
  });
  showImg.classList.add("is-out");
  clearTimeout(showTimer);
  showTimer = setTimeout(() => {
    showImg.src = tab.dataset.img;
    showImg.alt = tab.dataset.title;
    $("#showTitle").textContent = tab.dataset.title;
    $("#showText").textContent = tab.dataset.text;
    $("#showNo").textContent = `${pad(tabs.indexOf(tab) + 1)} / ${pad(tabs.length)}`;
    const done = () => showImg.classList.remove("is-out");
    if (showImg.complete) done();
    else showImg.addEventListener("load", done, { once: true });
  }, 280);
};
tabs.forEach((t) => t.addEventListener("click", () => selectTab(t)));

// calculator
const tl = (n) => "₺ " + n.toLocaleString("tr-TR");
const rStaff = $("#rStaff");
const rCost = $("#rCost");
const fill = (r) => r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min)) * 100 + "%");
const calc = () => {
  const staff = +rStaff.value;
  const cost = +rCost.value;
  $("#oStaff").textContent = `${staff} kişi`;
  $("#oCost").textContent = tl(cost);
  $("#oYear").textContent = tl(staff * cost * 12);
  fill(rStaff);
  fill(rCost);
};
[rStaff, rCost].forEach((r) => r.addEventListener("input", calc));
calc();

// model buttons preselect the form
$$("[data-model]").forEach((b) =>
  b.addEventListener("click", () => ($("#fModel").value = b.dataset.model))
);

// lead form
const form = $("#leadForm");
const msg = $("#formMsg");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const required = $$("[required]", form);
  required.forEach((f) => f.classList.toggle("is-bad", !f.value.trim()));
  const bad = required.find((f) => !f.value.trim());
  if (bad) {
    msg.textContent = "Lütfen adınızı ve telefon numaranızı yazın.";
    msg.classList.add("is-err");
    bad.focus();
    return;
  }
  const d = Object.fromEntries(new FormData(form));
  const text = [
    "Lobby Store teklif talebi",
    `Ad Soyad: ${d.name}`,
    `Telefon: ${d.phone}`,
    d.company && `Firma / Proje: ${d.company}`,
    d.city && `Şehir: ${d.city}`,
    `Mekân tipi: ${d.venue}`,
    `Model: ${d.model}`,
    d.note && `Not: ${d.note}`,
  ].filter(Boolean).join("\n");

  msg.classList.remove("is-err");
  if (CONTACT.whatsapp) {
    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    msg.textContent = "WhatsApp açılıyor — mesajı göndermeniz yeterli.";
  } else {
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Lobby Store teklif talebi")}&body=${encodeURIComponent(text)}`;
    msg.textContent = "E-posta uygulamanız açılıyor — mesajı göndermeniz yeterli.";
  }
});
form.addEventListener("input", (e) => e.target.classList.remove("is-bad"));

// footer contact + year
const fc = $("#footContact");
const addLink = (href, label) => {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = label;
  fc.append(a);
};
if (CONTACT.whatsapp) addLink(`https://wa.me/${CONTACT.whatsapp}`, CONTACT.phoneLabel || "WhatsApp");
if (CONTACT.email) addLink(`mailto:${CONTACT.email}`, CONTACT.email);
$("#year").textContent = new Date().getFullYear();
