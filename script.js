const galleryLinks = Array.from(document.querySelectorAll(".gallery-card"));
const modal = document.querySelector("[data-modal]");
const modalImage = document.querySelector("[data-modal-image]");
const modalClose = document.querySelector("[data-modal-close]");
const modalPrev = document.querySelector("[data-modal-prev]");
const modalNext = document.querySelector("[data-modal-next]");
let activeIndex = 0;

function showImage(index) {
  if (!galleryLinks.length) return;
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
