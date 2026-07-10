const galleryLinks = Array.from(document.querySelectorAll(".gallery-card"));
const modal = document.querySelector("[data-modal]");
const modalImage = document.querySelector("[data-modal-image]");
const modalClose = document.querySelector("[data-modal-close]");
const modalPrev = document.querySelector("[data-modal-prev]");
const modalNext = document.querySelector("[data-modal-next]");
const isHomePage = document.body.classList.contains("home-page");
let activeIndex = 0;

if (galleryLinks.length && modal && modalImage && modalClose && modalPrev && modalNext) {
  function showImage(index) {
    activeIndex = (index + galleryLinks.length) % galleryLinks.length;
    modalImage.src = galleryLinks[activeIndex].href;
    modalImage.alt = galleryLinks[activeIndex].querySelector("img").alt;
  }

  galleryLinks.forEach((link, index) => {
    link.addEventListener("click", event => {
      event.preventDefault();
      showImage(index);
      modal.classList.add("is-open");
    });
  });

  modalClose.addEventListener("click", () => modal.classList.remove("is-open"));
  modalPrev.addEventListener("click", () => showImage(activeIndex - 1));
  modalNext.addEventListener("click", () => showImage(activeIndex + 1));

  modal.addEventListener("click", event => {
    if (event.target === modal) modal.classList.remove("is-open");
  });

  document.addEventListener("keydown", event => {
    if (!modal.classList.contains("is-open")) return;
    if (event.key === "Escape") modal.classList.remove("is-open");
    if (event.key === "ArrowLeft") showImage(activeIndex + 1);
    if (event.key === "ArrowRight") showImage(activeIndex - 1);
  });
}

if (isHomePage && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const layer = document.createElement("div");
  layer.className = "balloons-layer";
  document.body.prepend(layer);

  const colors = [340, 198, 32, 150, 260];
  const count = 8;

  for (let i = 0; i < count; i += 1) {
    const balloon = document.createElement("span");
    const left = Math.random() * 92 + 4;
    const size = 32 + Math.random() * 28;
    const duration = 8.5 + Math.random() * 4;
    const delay = Math.random() * 1.2;
    const drift = (Math.random() * 160 - 80).toFixed(1) + "px";
    const spin = (Math.random() * 20 - 10).toFixed(1) + "deg";
    const stringTilt = (Math.random() * 8 - 4).toFixed(1) + "deg";
    const hue = colors[i % colors.length];

    balloon.className = "balloon";
    balloon.style.setProperty("--left", `${left.toFixed(1)}vw`);
    balloon.style.setProperty("--size", `${size.toFixed(1)}px`);
    balloon.style.setProperty("--duration", `${duration.toFixed(2)}s`);
    balloon.style.setProperty("--delay", `${delay.toFixed(2)}s`);
    balloon.style.setProperty("--drift", drift);
    balloon.style.setProperty("--spin", spin);
    balloon.style.setProperty("--string-tilt", stringTilt);
    balloon.style.setProperty("--hue", hue);

    layer.appendChild(balloon);
  }
}
