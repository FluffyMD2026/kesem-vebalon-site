const galleryLinks = Array.from(document.querySelectorAll(".gallery-card"));
const modal = document.querySelector("[data-modal]");
const modalImage = document.querySelector("[data-modal-image]");
const modalClose = document.querySelector("[data-modal-close]");
const modalPrev = document.querySelector("[data-modal-prev]");
const modalNext = document.querySelector("[data-modal-next]");
const legalModal = document.querySelector("[data-legal-modal]");
const legalBody = document.querySelector("[data-legal-body]");
const legalTitle = document.querySelector("#legal-modal-title");
const legalEyebrow = document.querySelector("#legal-modal-eyebrow");
const legalClose = document.querySelector("[data-legal-close]");
const legalTriggers = Array.from(document.querySelectorAll("[data-legal-open]"));
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

if (legalModal && legalBody && legalTitle && legalEyebrow && legalClose && legalTriggers.length) {
  const legalContent = {
    accessibility: {
      title: "הצהרת נגישות",
      eyebrow: "מידע משפטי",
      body: `
        <p>האתר נבנה כדי להיות נוח לקריאה ולניווט, עם טקסט ברור, מבנה עקבי וניגודיות טובה.</p>
        <h3>מה נעשה</h3>
        <ul>
          <li>שימוש במקלדת בלי תלות בעכבר.</li>
          <li>טקסטים חלופיים לתמונות ותוויות ברורות לקישורים.</li>
          <li>כפתורים וקישורים גדולים יחסית ונוחים ללחיצה.</li>
        </ul>
        <h3>המסגרת</h3>
        <p>האתר מכוון לעקרונות WCAG 2.2 ברמת AA, בהתאם לשימוש המעשי באתר ובשירותי הבלונים.</p>
        <p>אם נתקלתם בקושי להשתמש באתר, אפשר להתקשר או לשלוח הודעה ואנחנו נטפל בזה ישירות.</p>
      `,
    },
    terms: {
      title: "תקנון",
      eyebrow: "תנאי שימוש",
      body: `
        <p>זהו נוסח קצר ופשוט. הוא מסביר איך עובדים עם האתר ועם ההזמנות, ולא מחליף ייעוץ משפטי.</p>
        <h3>הזמנות</h3>
        <p>הזמנה נסגרת לאחר אישור סופי ב-WhatsApp או בטלפון, כולל תאריך, שעה, מיקום וסוג העיצוב.</p>
        <h3>מחירים ותשלום</h3>
        <p>המחיר הסופי נקבע לפי סוג העבודה, גודל ההקמה, כמות החומרים והמרחק לכתובת.</p>
        <h3>שינויים וביטולים</h3>
        <p>שינויים או ביטולים מתואמים ישירות מולנו מוקדם ככל האפשר כדי שנוכל לעדכן את ההכנות.</p>
      `,
    },
    privacy: {
      title: "מדיניות פרטיות",
      eyebrow: "שימוש בפרטים",
      body: `
        <p>אנחנו אוספים רק את הפרטים שנדרשים כדי לחזור אליכם, לתאם את ההזמנה ולתת הצעת מחיר.</p>
        <h3>אילו פרטים</h3>
        <ul>
          <li>שם, מספר טלפון ותוכן ההודעה.</li>
          <li>תאריך, מיקום, סוג אירוע והעדפות עיצוב.</li>
        </ul>
        <h3>מה עושים איתם</h3>
        <p>הפרטים משמשים רק כדי לספק שירות, לתאם הגעה ולשמור על רצף תקשורת.</p>
        <p>לא נמסור את המידע לצד שלישי אלא אם זה נדרש לביצוע ההזמנה או לפי דין.</p>
      `,
    },
  };

  function openLegal(section) {
    const content = legalContent[section];
    if (!content) return;
    legalTitle.textContent = content.title;
    legalEyebrow.textContent = content.eyebrow;
    legalBody.innerHTML = content.body;
    legalModal.classList.add("is-open");
    legalModal.setAttribute("aria-hidden", "false");
  }

  function closeLegal() {
    legalModal.classList.remove("is-open");
    legalModal.setAttribute("aria-hidden", "true");
  }

  legalTriggers.forEach(button => {
    button.addEventListener("click", () => openLegal(button.dataset.legalOpen));
  });

  legalClose.addEventListener("click", closeLegal);

  legalModal.addEventListener("click", event => {
    if (event.target === legalModal) closeLegal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeLegal();
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
