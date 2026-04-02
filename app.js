const header = document.querySelector("[data-header]");
const floatingButton = document.querySelector(".chat-float");
const chatPanel = document.querySelector("[data-chat-panel]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector(".nav-links");
const chatOpenButtons = Array.from(document.querySelectorAll("[data-chat-open]"));
const chatCloseButtons = Array.from(document.querySelectorAll("[data-chat-close]"));
const scrollButtons = Array.from(document.querySelectorAll("[data-scroll-target]"));
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const heroVideoPlayer = document.querySelector("#hero-video-player");
const HERO_VIDEO_START = 33;

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

function initHeroVideoLoop() {
  if (!heroVideoPlayer) return;

  const setupPlayer = () => {
    if (!window.YT?.Player) return;

    const player = new window.YT.Player(heroVideoPlayer, {
      events: {
        onReady: ({ target }) => {
          target.mute();
          target.seekTo(HERO_VIDEO_START, true);
          target.playVideo();
        },
        onStateChange: ({ data, target }) => {
          if (data !== window.YT.PlayerState.ENDED) return;
          target.seekTo(HERO_VIDEO_START, true);
          target.playVideo();
        },
      },
    });

    return player;
  };

  if (window.YT?.Player) {
    setupPlayer();
    return;
  }

  const previousReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    if (typeof previousReady === "function") previousReady();
    setupPlayer();
  };

  if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.append(script);
  }
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

revealItems.forEach((item) => revealObserver.observe(item));

initHeroVideoLoop();
handleScrollState();
window.addEventListener("scroll", handleScrollState, { passive: true });
