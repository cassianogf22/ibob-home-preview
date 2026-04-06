const header = document.querySelector("[data-header]");
const floatingButton = document.querySelector(".chat-float");
const chatPanel = document.querySelector("[data-chat-panel]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector(".nav-links");
const chatOpenButtons = Array.from(document.querySelectorAll("[data-chat-open]"));
const chatCloseButtons = Array.from(document.querySelectorAll("[data-chat-close]"));
const scrollButtons = Array.from(document.querySelectorAll("[data-scroll-target]"));
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const storeSearchForms = Array.from(document.querySelectorAll("[data-store-search-form]"));

function buildStoreSearchUrl(query) {
  const params = new URLSearchParams({
    loja: "1035972",
    palavra_busca: query,
  });

  return `https://loja.ibob.com.br/loja/busca.php?${params.toString()}`;
}

function isStaticSearchMode() {
  const host = window.location.hostname.toLowerCase();
  return host.endsWith("github.io") || window.location.protocol === "file:";
}

function setChatState(isOpen) {
  if (!chatPanel) return;
  chatPanel.classList.toggle("is-open", isOpen);
  chatPanel.setAttribute("aria-hidden", String(!isOpen));
}

function scrollToTarget(targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setMenuState(isOpen) {
  if (!menuToggle || !navLinks) return;
  navLinks.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
}

function handleScrollState() {
  const scrolled = window.scrollY > 24;
  header?.classList.toggle("is-scrolled", scrolled);
  floatingButton?.classList.toggle("is-visible", window.scrollY > 320);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.16 });

chatOpenButtons.forEach((button) => {
  button.addEventListener("click", () => setChatState(true));
});

chatCloseButtons.forEach((button) => {
  button.addEventListener("click", () => setChatState(false));
});

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetSelector = button.getAttribute("data-scroll-target");
    if (!targetSelector) return;
    setChatState(false);
    scrollToTarget(targetSelector);
  });
});

menuToggle?.addEventListener("click", () => {
  const isOpen = navLinks?.classList.contains("is-open");
  setMenuState(!isOpen);
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (!chatPanel?.classList.contains("is-open")) return;
  if (target.closest("[data-chat-panel]") || target.closest("[data-chat-open]")) return;
  setChatState(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setChatState(false);
    setMenuState(false);
  }
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

storeSearchForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    const queryInput = form.querySelector('input[name="q"]');
    const query = queryInput instanceof HTMLInputElement ? queryInput.value.trim() : "";
    if (!query) {
      event.preventDefault();
      queryInput?.focus();
      return;
    }

    if (!isStaticSearchMode()) return;

    event.preventDefault();
    window.location.assign(buildStoreSearchUrl(query));
  });
});

revealItems.forEach((item) => revealObserver.observe(item));

handleScrollState();
window.addEventListener("scroll", handleScrollState, { passive: true });
