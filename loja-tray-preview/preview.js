const drawer = document.getElementById("mobileDrawer");
const backdrop = document.getElementById("drawerBackdrop");
const openButtons = [
  document.getElementById("openMobileNav"),
  document.getElementById("openMobileNavSecondary"),
].filter(Boolean);
const closeButton = document.getElementById("closeMobileNav");

function setDrawer(open) {
  drawer.classList.toggle("is-open", open);
  backdrop.classList.toggle("is-open", open);
  drawer.setAttribute("aria-hidden", open ? "false" : "true");
  document.body.classList.toggle("drawer-open", open);
}

openButtons.forEach((button) => {
  button.addEventListener("click", () => setDrawer(true));
});

closeButton?.addEventListener("click", () => setDrawer(false));
backdrop?.addEventListener("click", () => setDrawer(false));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setDrawer(false);
  }
});
