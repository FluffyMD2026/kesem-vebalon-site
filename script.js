const galleryData = Array.isArray(window.galleryData) ? window.galleryData : [];
const galleryCategoriesRoot = document.querySelector("[data-gallery-categories]");
const galleryHomeCategoriesRoot = document.querySelector("[data-gallery-home-categories]");
const galleryHomeGrid = document.querySelector("[data-gallery-home-grid]");

const galleryAltText = Object.freeze({
  "/Images/Gallery/bar-bat-mitzvah/WhatsApp Image 2025-05-05 at 22.12.25 (1).jpeg": "עיצוב בר מצווה בכחול וכסף עם הספרות 13, בסיסי בלונים וזר בלוני הליום",
  "/Images/Gallery/bar-bat-mitzvah/WhatsApp Image 2025-05-05 at 22.13.11.jpeg": "כניסה לבת מצווה עם שטיח אדום, עמודי בלונים ורודים וכסופים והספרות 12",
  "/Images/Gallery/bar-bat-mitzvah/WhatsApp Image 2025-05-05 at 22.14.00 (2).jpeg": "עמודי בלונים כחולים ולבנים עם הספרות 13 וקישוטי פרחים כסופים",
  "/Images/Gallery/bar-bat-mitzvah/WhatsApp Image 2025-05-05 at 22.14.00 (5).jpeg": "עיצוב בת מצווה ורוד וכסוף עם הספרות 12 ושלושה בלוני הליום",
  "/Images/Gallery/bar-bat-mitzvah/WhatsApp Image 2025-05-05 at 22.14.00.jpeg": "שני עמודי בלונים כחולים ולבנים הנושאים את הספרות 13",
  "/Images/Gallery/weddings/WhatsApp Image 2025-05-05 at 22.13.13 (1).jpeg": "דמות כלה מבלונים המחזיקה זר פרחים צבעוני ובלון לב אדום",
  "/Images/Gallery/weddings/WhatsApp Image 2025-05-05 at 22.13.13.jpeg": "עיצוב אמנותי של דמות כלה מבלונים עם זר פרחים ובלון לב",
  "/Images/Gallery/weddings/WhatsApp Image 2025-05-05 at 22.14.00 (4).jpeg": "שולחן אירוע חגיגי בחוץ עם בלוני בועה שקופים וסידורי פרחים סגולים",
  "/Images/Gallery/organic/WhatsApp Image 2025-05-05 at 22.12.25.jpeg": "עיצוב יום הולדת 80 בזהב ולבן עם בלון כתר ובסיס בלונים אורגני",
  "/Images/Gallery/organic/WhatsApp Image 2025-05-05 at 22.13.12.jpeg": "סידור בלונים אורגני א-סימטרי בכחול בהיר, לבן וכסף",
  "/Images/Gallery/arches/WhatsApp Image 2025-05-05 at 22.14.40.jpeg": "קשת בלונים שחורה המעוטרת בפרחי בלון כסופים גדולים",
  "/Images/Gallery/business-events/WhatsApp Image 2025-05-05 at 22.14.00 (1).jpeg": "בלון בועה שקוף ממותג עם כיתוב, בלונים כחולים וכסופים ובסיס שולחני",
  "/Images/Gallery/business-events/WhatsApp Image 2025-05-05 at 22.14.00 (3).jpeg": "עיצוב בלון בועה ממותג בכחול וכסף בחלל משרדי",
});

function getGalleryImageAlt(category, source, index) {
  return galleryAltText[source] || `עיצוב בלונים בקטגוריית ${category.title}, תמונה ${index + 1}`;
}

const focusableElementsSelector = [
  "a[href]:not([tabindex='-1'])",
  "button:not([disabled]):not([tabindex='-1'])",
  "input:not([disabled]):not([tabindex='-1'])",
  "select:not([disabled]):not([tabindex='-1'])",
  "textarea:not([disabled]):not([tabindex='-1'])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");
const modalInertState = new WeakMap();

function trapFocus(container, event) {
  if (event.key !== "Tab") return;
  const focusableElements = Array.from(container.querySelectorAll(focusableElementsSelector))
    .filter(element => element.getClientRects().length > 0);
  if (!focusableElements.length) return;

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function setPageInert(activeModal, inert) {
  if (inert) {
    const state = [];
    Array.from(document.body.children).forEach(element => {
      if (element === activeModal || element.tagName === "SCRIPT") return;
      state.push({ element, wasInert: element.hasAttribute("inert") });
      element.setAttribute("inert", "");
    });
    modalInertState.set(activeModal, state);
    document.body.classList.add("modal-open");
    return;
  }

  (modalInertState.get(activeModal) || []).forEach(({ element, wasInert }) => {
    if (!wasInert) element.removeAttribute("inert");
  });
  modalInertState.delete(activeModal);

  if (!document.querySelector(".gallery-viewer.is-open, .legal-modal.is-open")) {
    document.body.classList.remove("modal-open");
  }
}

function createCategoryWreath(category, { linked = false, compact = false, button = false } = {}) {
  const wreath = document.createElement(button ? "button" : linked ? "a" : "div");
  wreath.className = `category-wreath${compact ? " category-wreath--compact" : ""}`;

  if (linked) {
    wreath.href = `/gallery/#${category.slug}`;
    wreath.setAttribute("aria-label", `לגלריית ${category.title}`);
  }

  if (button) {
    wreath.type = "button";
  }

  const image = document.createElement("img");
  image.src = "/Images/logo-primary-v6.jpg";
  image.alt = "";
  image.width = compact ? 190 : 240;
  image.height = compact ? 190 : 240;

  const center = document.createElement("span");
  center.className = "category-wreath__center";
  center.textContent = category.title;

  wreath.append(image, center);
  return wreath;
}

if (galleryCategoriesRoot && galleryData.length) {
  galleryCategoriesRoot.setAttribute("role", "list");
  galleryData.forEach((category, categoryIndex) => {
    const choice = document.createElement("div");
    choice.className = "gallery-category-choice";
    choice.setAttribute("role", "listitem");

    const button = createCategoryWreath(category, { button: true });
    button.id = category.slug;
    button.dataset.galleryCategory = String(categoryIndex);
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-controls", "gallery-viewer");
    button.setAttribute("aria-label", category.images.length
      ? `פתיחת גלריית ${category.title}, ${category.images.length} תמונות`
      : `גלריית ${category.title}, תמונות יתווספו בקרוב`);
    button.disabled = !category.images.length;

    choice.appendChild(button);
    galleryCategoriesRoot.appendChild(choice);
  });
}

if (galleryHomeCategoriesRoot && galleryData.length) {
  galleryData.forEach(category => {
    galleryHomeCategoriesRoot.appendChild(createCategoryWreath(category, { linked: true, compact: true }));
  });
}

if (galleryHomeGrid && galleryData.length) {
  galleryData.forEach(category => {
    const source = category.images[0];
    if (!source) return;

    const link = document.createElement("a");
    link.className = "gallery-preview-card";
    link.href = `/gallery/#${category.slug}`;
    link.setAttribute("aria-label", `לגלריית ${category.title}`);

    const image = document.createElement("img");
    image.src = source;
    image.alt = getGalleryImageAlt(category, source, 0);
    image.loading = "lazy";
    image.decoding = "async";

    const label = document.createElement("span");
    label.textContent = category.title;

    link.append(image, label);
    galleryHomeGrid.appendChild(link);
  });
}

if (["localhost", "127.0.0.1"].includes(window.location.hostname) && galleryData.length) {
  let galleryIndexModified = null;

  async function watchGalleryFolders() {
    try {
      const response = await fetch(`/gallery-data.js?watch=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
      });
      const modified = response.headers.get("Last-Modified");

      if (galleryIndexModified && modified && modified !== galleryIndexModified) {
        window.location.reload();
        return;
      }

      galleryIndexModified = modified;
    } catch (error) {
      // The preview keeps working if the temporary local watcher is unavailable.
    }
  }

  watchGalleryFolders();
  window.setInterval(watchGalleryFolders, 2500);
}

const galleryCategoryButtons = Array.from(document.querySelectorAll("[data-gallery-category]"));
const galleryViewer = document.querySelector("[data-gallery-viewer]");
const galleryViewerPanel = document.querySelector("[data-gallery-viewer-panel]");
const galleryViewerImage = document.querySelector("[data-gallery-viewer-image]");
const galleryViewerCaption = document.querySelector("[data-gallery-viewer-caption]");
const galleryViewerClose = document.querySelector("[data-gallery-viewer-close]");
const galleryViewerPrev = document.querySelector("[data-gallery-viewer-prev]");
const galleryViewerNext = document.querySelector("[data-gallery-viewer-next]");
const galleryViewerTitle = document.querySelector("[data-gallery-viewer-title]");
const galleryViewerStatus = document.querySelector("[data-gallery-viewer-status]");
const galleryViewerBadgeTitle = document.querySelector("[data-gallery-viewer-badge-title]");
const galleryViewerRail = document.querySelector("[data-gallery-viewer-rail]");
const galleryViewerStage = document.querySelector("[data-gallery-viewer-stage]");
const legalModal = document.querySelector("[data-legal-modal]");
const legalPanel = document.querySelector(".legal-modal__panel");
const legalBody = document.querySelector("[data-legal-body]");
const legalTitle = document.querySelector("#legal-modal-title");
const legalEyebrow = document.querySelector("#legal-modal-eyebrow");
const legalClose = document.querySelector("[data-legal-close]");
const legalTriggers = Array.from(document.querySelectorAll("[data-legal-open]"));
const isHomePage = document.body.classList.contains("home-page");
let activeIndex = 0;
let activeGalleryCategoryIndex = 0;
let galleryReturnFocus = null;

document.querySelectorAll(".text-brand").forEach(brand => {
  brand.innerHTML = '<img class="header-brand-mark" src="/Images/logo-icon-v6.jpg" alt="" width="58" height="58">';
});

const heroContent = document.querySelector(".home-page .hero-content");

if (heroContent) {
  const heroLogo = document.createElement("img");
  heroLogo.className = "hero-brand-mark";
  heroLogo.src = "/Images/logo-primary-v6.jpg";
  heroLogo.alt = "";
  heroLogo.width = 184;
  heroLogo.height = 184;
  heroContent.prepend(heroLogo);
}

const siteFooter = document.querySelector(".site-footer");

if (siteFooter) {
  const footerLogo = document.createElement("img");
  footerLogo.className = "footer-brand-mark";
  footerLogo.src = "/Images/logo-icon-v6.jpg";
  footerLogo.alt = "";
  footerLogo.width = 46;
  footerLogo.height = 46;
  siteFooter.prepend(footerLogo);

  const footerAccessibilityLink = document.createElement("a");
  footerAccessibilityLink.className = "footer-accessibility accessibility-statement-link";
  footerAccessibilityLink.href = "/?accessibility=1";
  footerAccessibilityLink.textContent = "הצהרת נגישות";
  siteFooter.appendChild(footerAccessibilityLink);
}

const headerActions = document.querySelector(".header-actions");

if (headerActions) {
  const socialLinks = [
    {
      className: "instagram-action",
      href: "https://www.instagram.com/balloonvkesem?igsh=MXNnMGxtdjhnMWxsYw==",
      label: "אינסטגרם",
      icon: `
        <img src="/Images/instagram-logo.png" alt="" width="32" height="32">
      `,
    },
    {
      className: "facebook-action",
      href: "https://www.facebook.com/share/1BWvEZ1FSj/?mibextid=wwXIfr",
      label: "פייסבוק",
      icon: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M13.5 22v-8.7h2.92l.44-3.4H13.5V7.72c0-.98.27-1.66 1.68-1.66h1.8V3.02c-.31-.04-1.38-.13-2.62-.13-2.59 0-4.36 1.58-4.36 4.49V9.9H7.07v3.4H10V22h3.5Z"></path>
        </svg>
      `,
    },
  ];

  socialLinks.forEach(({ className, href, label, icon }) => {
    const link = document.createElement("a");
    link.className = `social-action ${className}`;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", label);
    link.innerHTML = `<span class="social-icon" aria-hidden="true">${icon}</span>`;
    headerActions.appendChild(link);
  });
}

document.querySelectorAll(".whatsapp-action").forEach(link => {
  if (link.textContent.trim() === "שליחת הודעה") {
    link.setAttribute("aria-label", "שליחת הודעת WhatsApp לקסם ובלון");
  }
});

document.querySelectorAll('a[target="_blank"]').forEach(link => {
  const existingLabel = link.getAttribute("aria-label");
  if (existingLabel) {
    link.setAttribute("aria-label", `${existingLabel} (נפתח בחלון חדש)`);
    return;
  }

  const note = document.createElement("span");
  note.className = "sr-only";
  note.textContent = " (נפתח בחלון חדש)";
  link.appendChild(note);
});

const floatingWhatsapp = document.createElement("a");
floatingWhatsapp.className = "floating-whatsapp";
floatingWhatsapp.href = "https://wa.me/972512252288";
floatingWhatsapp.target = "_blank";
floatingWhatsapp.rel = "noopener noreferrer";
floatingWhatsapp.setAttribute("aria-label", "כתבו לנו ישירות לווצאפ להצעת מחיר (נפתח בחלון חדש)");
floatingWhatsapp.innerHTML = `
  <img class="floating-whatsapp__icon" src="/Images/whatsapp-logo.svg" alt="" width="36" height="36">
  <span>כתבו לנו ישירות לווצאפ להצעת מחיר</span>
`;
document.body.appendChild(floatingWhatsapp);

const accessibilityDefaults = {
  fontScale: 1,
  highContrast: false,
  grayscale: false,
  highlightLinks: false,
  readableFont: false,
  reduceMotion: false,
};
const accessibilityStorageKey = "kesemAccessibilityPreferences";
let accessibilityState = { ...accessibilityDefaults };

try {
  const savedAccessibilityState = JSON.parse(localStorage.getItem(accessibilityStorageKey));
  if (savedAccessibilityState && typeof savedAccessibilityState === "object") {
    accessibilityState = { ...accessibilityDefaults, ...savedAccessibilityState };
  }
} catch (error) {
  accessibilityState = { ...accessibilityDefaults };
}

accessibilityState.fontScale = Math.min(2, Math.max(1, Number(accessibilityState.fontScale) || 1));

const accessibilityWidget = document.createElement("aside");
accessibilityWidget.className = "accessibility-widget";
accessibilityWidget.setAttribute("aria-label", "כלי נגישות");
accessibilityWidget.innerHTML = `
  <div class="accessibility-panel" id="accessibility-panel" aria-hidden="true" inert>
    <div class="accessibility-panel__heading">
      <span class="accessibility-panel__symbol" aria-hidden="true">♿</span>
      <div>
        <p class="accessibility-panel__eyebrow">התאמת תצוגה</p>
        <h2>כלי נגישות</h2>
      </div>
    </div>
    <p class="accessibility-panel__intro">בחרו את ההתאמות שנוחות לכם. הבחירות יישמרו במכשיר הזה.</p>
    <div class="accessibility-controls">
      <button type="button" data-a11y-action="increase"><strong aria-hidden="true">A+</strong><span>הגדלת טקסט</span></button>
      <button type="button" data-a11y-action="decrease"><strong aria-hidden="true">A−</strong><span>הקטנת טקסט</span></button>
      <button type="button" data-a11y-toggle="highContrast" aria-pressed="false"><strong aria-hidden="true">◐</strong><span>ניגודיות גבוהה</span></button>
      <button type="button" data-a11y-toggle="grayscale" aria-pressed="false"><strong aria-hidden="true">◑</strong><span>גווני אפור</span></button>
      <button type="button" data-a11y-toggle="highlightLinks" aria-pressed="false"><strong aria-hidden="true">↗</strong><span>הדגשת קישורים</span></button>
      <button type="button" data-a11y-toggle="readableFont" aria-pressed="false"><strong aria-hidden="true">א</strong><span>גופן קריא</span></button>
      <button type="button" data-a11y-toggle="reduceMotion" aria-pressed="false"><strong aria-hidden="true">Ⅱ</strong><span>עצירת אנימציות</span></button>
    </div>
    <p class="accessibility-scale" aria-live="polite">גודל טקסט: <output data-a11y-scale>100%</output></p>
    <div class="accessibility-panel__footer">
      <button class="accessibility-reset" type="button" data-a11y-action="reset">איפוס התאמות</button>
      <a class="accessibility-statement-link" href="/?accessibility=1">הצהרת נגישות</a>
    </div>
  </div>
  <button class="accessibility-tab" type="button" aria-expanded="false" aria-controls="accessibility-panel">
    <span class="accessibility-tab__symbol" aria-hidden="true">♿</span>
    <span>כלי<br>נגישות</span>
  </button>
`;
document.body.appendChild(accessibilityWidget);

const accessibilityPanel = accessibilityWidget.querySelector(".accessibility-panel");
const accessibilityTab = accessibilityWidget.querySelector(".accessibility-tab");
const accessibilityScale = accessibilityWidget.querySelector("[data-a11y-scale]");
const accessibilityToggleButtons = Array.from(accessibilityWidget.querySelectorAll("[data-a11y-toggle]"));
const accessibilityIncreaseButton = accessibilityWidget.querySelector("[data-a11y-action='increase']");
const accessibilityDecreaseButton = accessibilityWidget.querySelector("[data-a11y-action='decrease']");

function saveAccessibilityState() {
  try {
    localStorage.setItem(accessibilityStorageKey, JSON.stringify(accessibilityState));
  } catch (error) {
    // The controls still work when private browsing blocks local storage.
  }
}

function applyAccessibilityState({ persist = true } = {}) {
  const root = document.documentElement;
  const classMap = {
    highContrast: "a11y-high-contrast",
    grayscale: "a11y-grayscale",
    highlightLinks: "a11y-highlight-links",
    readableFont: "a11y-readable-font",
    reduceMotion: "a11y-reduce-motion",
  };

  root.style.fontSize = accessibilityState.fontScale === 1 ? "" : `${Math.round(accessibilityState.fontScale * 100)}%`;

  Object.entries(classMap).forEach(([stateKey, className]) => {
    root.classList.toggle(className, Boolean(accessibilityState[stateKey]));
  });

  accessibilityToggleButtons.forEach(button => {
    button.setAttribute("aria-pressed", String(Boolean(accessibilityState[button.dataset.a11yToggle])));
  });

  accessibilityScale.textContent = `${Math.round(accessibilityState.fontScale * 100)}%`;
  accessibilityIncreaseButton.disabled = accessibilityState.fontScale >= 2;
  accessibilityDecreaseButton.disabled = accessibilityState.fontScale <= 1;

  if (accessibilityState.reduceMotion) {
    document.querySelector(".balloons-layer")?.remove();
  }

  if (persist) saveAccessibilityState();
}

function setAccessibilityPanel(open) {
  accessibilityWidget.classList.toggle("is-open", open);
  accessibilityTab.setAttribute("aria-expanded", String(open));
  accessibilityPanel.setAttribute("aria-hidden", String(!open));

  if (open) {
    accessibilityPanel.removeAttribute("inert");
  } else {
    if (accessibilityPanel.contains(document.activeElement)) accessibilityTab.focus();
    accessibilityPanel.setAttribute("inert", "");
  }
}

applyAccessibilityState({ persist: false });

accessibilityTab.addEventListener("click", () => {
  const willOpen = accessibilityTab.getAttribute("aria-expanded") !== "true";
  setAccessibilityPanel(willOpen);
  if (willOpen) accessibilityPanel.querySelector("button")?.focus();
});

accessibilityWidget.addEventListener("click", event => {
  const actionButton = event.target.closest("[data-a11y-action]");
  const toggleButton = event.target.closest("[data-a11y-toggle]");

  if (actionButton) {
    if (actionButton.dataset.a11yAction === "increase") {
      accessibilityState.fontScale = Math.min(2, Number((accessibilityState.fontScale + 0.1).toFixed(1)));
    }

    if (actionButton.dataset.a11yAction === "decrease") {
      accessibilityState.fontScale = Math.max(1, Number((accessibilityState.fontScale - 0.1).toFixed(1)));
    }

    if (actionButton.dataset.a11yAction === "reset") {
      accessibilityState = { ...accessibilityDefaults };
    }

    applyAccessibilityState();
  }

  if (toggleButton) {
    const stateKey = toggleButton.dataset.a11yToggle;
    accessibilityState[stateKey] = !accessibilityState[stateKey];
    applyAccessibilityState();
  }
});

document.addEventListener("click", event => {
  if (!accessibilityWidget.classList.contains("is-open") || accessibilityWidget.contains(event.target)) return;
  setAccessibilityPanel(false);
});

document.addEventListener("keydown", event => {
  if (event.key !== "Escape" || !accessibilityWidget.classList.contains("is-open")) return;
  setAccessibilityPanel(false);
  accessibilityTab.focus();
});

if (
  galleryCategoryButtons.length &&
  galleryViewer &&
  galleryViewerPanel &&
  galleryViewerImage &&
  galleryViewerCaption &&
  galleryViewerClose &&
  galleryViewerPrev &&
  galleryViewerNext &&
  galleryViewerTitle &&
  galleryViewerStatus &&
  galleryViewerBadgeTitle &&
  galleryViewerRail &&
  galleryViewerStage
) {
  let touchStartX = null;

  function renderGalleryRail(category) {
    galleryViewerRail.replaceChildren();

    category.images.forEach((source, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-viewer__thumbnail";
      button.dataset.galleryImage = String(index);
      button.setAttribute("aria-label", `הצגת תמונה ${index + 1} מתוך ${category.images.length}`);

      const image = document.createElement("img");
      image.src = source;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      button.appendChild(image);
      galleryViewerRail.appendChild(button);
    });
  }

  function showGalleryImage(index, { focusThumbnail = false } = {}) {
    const category = galleryData[activeGalleryCategoryIndex];
    if (!category?.images.length) return;

    activeIndex = (index + category.images.length) % category.images.length;
    const source = category.images[activeIndex];
    const alt = getGalleryImageAlt(category, source, activeIndex);

    galleryViewerImage.setAttribute("aria-busy", "true");
    galleryViewerImage.src = source;
    galleryViewerImage.alt = alt;
    galleryViewerCaption.textContent = alt;
    galleryViewerTitle.textContent = category.title;
    galleryViewerBadgeTitle.textContent = category.title;
    galleryViewerStatus.textContent = `תמונה ${activeIndex + 1} מתוך ${category.images.length}`;
    galleryViewerPrev.disabled = category.images.length < 2;
    galleryViewerNext.disabled = category.images.length < 2;

    Array.from(galleryViewerRail.children).forEach((button, buttonIndex) => {
      const active = buttonIndex === activeIndex;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-current", active ? "true" : "false");
      if (active && focusThumbnail) button.focus();
    });
  }

  function openGalleryViewer(categoryIndex, trigger) {
    const category = galleryData[categoryIndex];
    if (!category?.images.length) return;

    activeGalleryCategoryIndex = categoryIndex;
    activeIndex = 0;
    galleryReturnFocus = trigger;
    renderGalleryRail(category);
    showGalleryImage(0);
    galleryViewer.removeAttribute("inert");
    galleryViewer.classList.add("is-open");
    galleryViewer.setAttribute("aria-hidden", "false");
    setPageInert(galleryViewer, true);
    galleryViewerClose.focus();
    window.history.replaceState(null, "", `#${category.slug}`);
  }

  function closeGalleryViewer() {
    if (!galleryViewer.classList.contains("is-open")) return;
    const category = galleryData[activeGalleryCategoryIndex];
    galleryViewer.classList.remove("is-open");
    galleryViewer.setAttribute("aria-hidden", "true");
    galleryViewerImage.removeAttribute("src");
    galleryViewerImage.alt = "";
    setPageInert(galleryViewer, false);
    galleryViewer.setAttribute("inert", "");

    if (window.location.hash === `#${category?.slug}`) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }

    galleryReturnFocus?.focus();
  }

  galleryCategoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      openGalleryViewer(Number(button.dataset.galleryCategory), button);
    });
  });

  galleryViewerClose.addEventListener("click", closeGalleryViewer);
  galleryViewerPrev.addEventListener("click", () => showGalleryImage(activeIndex - 1));
  galleryViewerNext.addEventListener("click", () => showGalleryImage(activeIndex + 1));
  galleryViewerRail.addEventListener("click", event => {
    const button = event.target.closest("[data-gallery-image]");
    if (!button) return;
    showGalleryImage(Number(button.dataset.galleryImage), { focusThumbnail: true });
  });

  galleryViewer.addEventListener("click", event => {
    if (event.target === galleryViewer) closeGalleryViewer();
  });

  galleryViewerImage.addEventListener("load", () => {
    galleryViewerImage.removeAttribute("aria-busy");
  });

  galleryViewerImage.addEventListener("error", () => {
    galleryViewerImage.removeAttribute("aria-busy");
    galleryViewerStatus.textContent = "לא ניתן לטעון את התמונה. אפשר לעבור לתמונה הבאה.";
  });

  galleryViewerStage.addEventListener("touchstart", event => {
    touchStartX = event.touches[0]?.clientX ?? null;
  }, { passive: true });

  galleryViewerStage.addEventListener("touchend", event => {
    if (touchStartX === null) return;
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const distance = touchEndX - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) < 50) return;
    showGalleryImage(distance > 0 ? activeIndex - 1 : activeIndex + 1);
  }, { passive: true });

  document.addEventListener("keydown", event => {
    if (!galleryViewer.classList.contains("is-open")) return;
    trapFocus(galleryViewerPanel, event);
    if (event.key === "Escape") closeGalleryViewer();
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) event.preventDefault();
    if (event.key === "ArrowLeft") showGalleryImage(activeIndex + 1);
    if (event.key === "ArrowRight") showGalleryImage(activeIndex - 1);
    if (event.key === "Home") showGalleryImage(0);
    if (event.key === "End") showGalleryImage(galleryData[activeGalleryCategoryIndex].images.length - 1);
  });

  let requestedCategory = window.location.hash.slice(1);
  try {
    requestedCategory = decodeURIComponent(requestedCategory);
  } catch (error) {
    requestedCategory = "";
  }
  const requestedIndex = galleryData.findIndex(category => category.slug === requestedCategory);
  if (requestedIndex >= 0) {
    openGalleryViewer(requestedIndex, galleryCategoryButtons[requestedIndex]);
  }
}

if (legalModal && legalPanel && legalBody && legalTitle && legalEyebrow && legalClose && legalTriggers.length) {
  let legalReturnFocus = null;
  const legalContent = {
    accessibility: {
      title: "הצהרת נגישות",
      eyebrow: "מידע משפטי",
      body: `
        <p><strong>עודכן לאחרונה: 12 ביולי 2026.</strong> קסם ובלון פועלת למתן שירות שוויוני, מכבד ונגיש לאנשים עם מוגבלות.</p>
        <h3>תקן ורמת נגישות</h3>
        <p>האתר עבר בדיקה טכנית פנימית והותאם לדרישות ת״י 5568 חלק 1, מהדורת ספטמבר 2023, המבוסס על WCAG 2.0 ברמה AA. הבדיקה הפנימית אינה אישור או הסמכה מטעם מורשה נגישות.</p>
        <h3>התאמות באתר</h3>
        <ul>
          <li>קישור לדילוג ישיר לתוכן הראשי ומבנה סמנטי של כותרות ואזורים.</li>
          <li>תפעול מלא במקלדת, סימון מיקוד ברור וסדר מעבר עקבי.</li>
          <li>חלונות גלריה ומידע הכוללים לכידת מיקוד, סגירה ב־Escape והחזרת המיקוד למקום שממנו נפתחו.</li>
          <li>טקסטים חלופיים לתמונות, שמות נגישים לכפתורים ועדכון קולי של מיקום התמונה בגלריה.</li>
          <li>ניגודיות צבעים ברמת AA, תמיכה בהגדלת טקסט עד 200% והתאמה למסכים צרים.</li>
          <li>כיבוד הגדרת הפחתת תנועה של המכשיר וכלי לעצירת אנימציות.</li>
        </ul>
        <h3>שימוש במקלדת</h3>
        <p>Tab ו־Shift+Tab עוברים בין הקישורים והכפתורים, Enter או רווח מפעילים כפתור, Escape סוגר חלון, ובגלריה אפשר להשתמש גם במקשי החצים, Home ו־End.</p>
        <h3>כלי התאמת תצוגה</h3>
        <p>לשונית "כלי נגישות" מאפשרת הגדלת טקסט, ניגודיות גבוהה, גווני אפור, הדגשת קישורים, גופן קריא ועצירת אנימציות. ההעדפות נשמרות במכשיר. הכלי משלים את הנגישות המובנית באתר ואינו מחליף טכנולוגיה מסייעת.</p>
        <h3>התאמות בשירות</h3>
        <p>השירות ניתן בתיאום ובמיקום הלקוח או האירוע. אם נדרשת התאמת שירות, דרך תקשורת חלופית או סיוע בתהליך ההזמנה, אפשר לבקש זאת מראש וננסה לתת מענה מתאים.</p>
        <h3>פנייה בנושא נגישות</h3>
        <p>אחראי לפניות נגישות: צוות קסם ובלון. אם נתקלתם במחסום, ציינו מה ניסיתם לעשות, באיזה עמוד ובאיזה מכשיר או דפדפן. אפשר <a href="tel:0512252288">להתקשר למספר 051-225-2288</a> או <a href="https://wa.me/972512252288">לשלוח הודעת WhatsApp</a>, ואנחנו נטפל בפנייה בהקדם.</p>
      `,
    },
    terms: {
      title: "תקנון",
      eyebrow: "תנאי שימוש",
      body: `
        <p><strong>עודכן לאחרונה: יולי 2026.</strong> התקנון מסדיר את השימוש באתר ואת ההזמנות מול קסם ובלון. האתר מציג מידע וגלריה; ההזמנה עצמה מתבצעת ומאושרת מולנו.</p>
        <h3>הצעת מחיר ואישור הזמנה</h3>
        <p>הצעת המחיר נקבעת לפי סוג העיצוב, הכמות, המיקום, זמני ההקמה והפירוק ודרישות מיוחדות. הזמנה נחשבת מאושרת רק לאחר סיכום כתוב הכולל לפחות תאריך, כתובת, חלון הגעה, תכולה ומחיר, ולאחר תשלום מקדמה או תשלום כפי שסוכם.</p>
        <p>תמונות השראה והדמיות נועדו להמחשה. ייתכנו הבדלים סבירים בגוון, בגודל, בסידור ובפרטי חומר בהתאם למסך, למלאי ולאופי העבודה הידנית, תוך שמירה על הקונספט שסוכם.</p>
        <h3>תשלום ושינויים</h3>
        <p>אמצעי התשלום, גובה המקדמה ומועד היתרה יופיעו בסיכום ההזמנה. שינוי צבעים, כיתוב, כמות, מיקום או שעה כפוף לזמינות ועלול לשנות את המחיר. שינוי יחייב אישור כתוב של שני הצדדים.</p>
        <h3>גישה למקום והקמה</h3>
        <p>באחריות הלקוח למסור מראש מידע מדויק על חניה ופריקה, מדרגות או מעלית, שעות כניסה, אישורי אולם, נקודת ההקמה ומגבלות בטיחות. עיכוב או עבודה נוספת עקב מידע שלא נמסר עשויים לחייב התאמה בתיאום עם הלקוח.</p>
        <h3>תנאי חוץ ומשך חיי הבלונים</h3>
        <p>חום, שמש ישירה, רוח, גשם, מיזוג ומגע במשטחים חדים משפיעים על בלונים. בעיצוב חוץ לא ניתן להבטיח שהעיצוב יישאר ללא שינוי לכל אורך האירוע. במקרה של מזג אוויר שאינו מאפשר הקמה בטוחה, ננסה לתאם חלופה מעשית.</p>
        <h3>בטיחות</h3>
        <ul>
          <li>בלונים וחלקיהם אינם צעצוע ללא השגחה; יש להרחיק משברי בלון מילדים קטנים ומבעלי חיים.</li>
          <li>אין לשאוף הליום ואין להצמיד בלונים למקור חום, אש או חשמל.</li>
          <li>על הלקוח לעדכן מראש על רגישות ללטקס או על מגבלת חומר במקום האירוע.</li>
        </ul>
        <h3>ביטול ודחיית הזמנה</h3>
        <p>בקשת ביטול או דחייה תימסר בכתב ב-WhatsApp מוקדם ככל האפשר. זכויות הביטול וההחזר יחולו בהתאם לחוק הגנת הצרכן ולתקנות החלות על העסקה. בעבודה שהוכנה במיוחד לפי דרישות הלקוח, או לאחר שהוחל בייצור או במתן השירות, עשויות לחול מגבלות והפחתות המותרות לפי דין. במקרה של סתירה, הוראות הדין גוברות על התקנון.</p>
        <h3>ציוד, נזק ופירוק</h3>
        <p>מעמדים, משקולות, מסגרות וציוד שנמסרו בהשאלה נשארים בבעלות קסם ובלון ויוחזרו במועד שסוכם. הלקוח אחראי לשמור עליהם משעת המסירה ועד האיסוף; חיוב בגין אובדן או נזק ייקבע לפי העלות הסבירה של תיקון או החלפה.</p>
        <h3>צילום ופרסום</h3>
        <p>צילום העיצוב לצורכי תיק עבודות או פרסום ייעשה תוך כיבוד פרטיות המשתתפים. תמונות שבהן אנשים מזוהים יפורסמו רק לאחר קבלת הסכמה מתאימה. אפשר לבקש מראש שלא לצלם את האירוע.</p>
        <h3>אחריות וכוח עליון</h3>
        <p>נעשה מאמץ לספק את ההזמנה במועד ובאיכות שסוכמו. במקרה של אירוע שאינו בשליטת הצדדים, לרבות מצב ביטחוני, הוראת רשות, מזג אוויר קיצוני או חסימת גישה, נפעל בתום לב למציאת מועד או פתרון חלופי. אין בתקנון כדי לגרוע מאחריות או מזכות שלא ניתן להגביל לפי דין.</p>
        <h3>יצירת קשר</h3>
        <p>לשאלות, שינויים, ביטולים או תלונה: קסם ובלון, בטלפון או ב-WhatsApp במספר 051-225-2288. מומלץ לשמור את סיכום ההזמנה וההתכתבויות.</p>
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
    legalReturnFocus = document.activeElement;
    setAccessibilityPanel(false);
    legalModal.removeAttribute("inert");
    legalModal.classList.add("is-open");
    legalModal.setAttribute("aria-hidden", "false");
    setPageInert(legalModal, true);
    legalClose.focus();
  }

  function closeLegal() {
    if (!legalModal.classList.contains("is-open")) return;
    legalModal.classList.remove("is-open");
    legalModal.setAttribute("aria-hidden", "true");
    setPageInert(legalModal, false);
    legalModal.setAttribute("inert", "");
    if (legalReturnFocus instanceof HTMLElement) legalReturnFocus.focus();
  }

  legalTriggers.forEach(button => {
    button.addEventListener("click", () => openLegal(button.dataset.legalOpen));
  });

  const accessibilityStatementLinks = Array.from(document.querySelectorAll(".accessibility-statement-link"));
  accessibilityStatementLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      setAccessibilityPanel(false);
      openLegal("accessibility");
    });
  });

  legalClose.addEventListener("click", closeLegal);

  legalModal.addEventListener("click", event => {
    if (event.target === legalModal) closeLegal();
  });

  document.addEventListener("keydown", event => {
    if (!legalModal.classList.contains("is-open")) return;
    trapFocus(legalPanel, event);
    if (event.key === "Escape") closeLegal();
  });

  if (new URLSearchParams(window.location.search).get("accessibility") === "1") {
    openLegal("accessibility");
  }
}

if (
  isHomePage &&
  !document.documentElement.classList.contains("a11y-reduce-motion") &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const metallicColors = [
    { light: "var(--brand-blue-light)", mid: "var(--brand-blue)", dark: "var(--brand-blue-dark)", deep: "var(--brand-blue-deep)" },
    { light: "var(--brand-pink-light)", mid: "var(--brand-pink)", dark: "var(--brand-pink-dark)", deep: "var(--brand-pink-deep)" },
    { light: "var(--brand-silver-light)", mid: "var(--brand-silver)", dark: "var(--brand-silver-dark)", deep: "var(--brand-silver-deep)" },
    { light: "var(--brand-ivory-light)", mid: "var(--brand-ivory)", dark: "var(--brand-ivory-dark)", deep: "var(--brand-silver-dark)" },
  ];
  const layer = document.createElement("div");
  layer.className = "balloons-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.prepend(layer);

  const isSmallScreen = window.matchMedia("(max-width: 640px)").matches;
  const count = isSmallScreen ? 8 : 12;
  const startIndex = Math.floor(Math.random() * metallicColors.length);
  let completedBalloons = 0;

  layer.addEventListener("animationend", event => {
    if (!event.target.classList.contains("balloon")) return;
    completedBalloons += 1;
    event.target.remove();
    if (completedBalloons === count) layer.remove();
  });

  for (let i = 0; i < count; i += 1) {
    const color = metallicColors[(i + startIndex) % metallicColors.length];
    const balloon = document.createElement("span");
    const left = Math.random() * 94 + 2;
    const size = (isSmallScreen ? 40 : 46) + Math.random() * (isSmallScreen ? 24 : 30);
    const duration = 6.8 + Math.random() * 1.8;
    const delay = i * 0.08 + Math.random() * 0.35;
    const driftValue = Math.random() * 150 - 75;
    const midDriftValue = driftValue * -0.38 + (Math.random() * 42 - 21);
    const spinValue = Math.random() * 14 - 7;
    const midSpinValue = spinValue * -0.6;
    const stringTilt = Math.random() * 8 - 4;

    balloon.className = "balloon";
    balloon.style.setProperty("--left", `${left.toFixed(1)}vw`);
    balloon.style.setProperty("--size", `${size.toFixed(1)}px`);
    balloon.style.setProperty("--duration", `${duration.toFixed(2)}s`);
    balloon.style.setProperty("--delay", `${delay.toFixed(2)}s`);
    balloon.style.setProperty("--drift", `${driftValue.toFixed(1)}px`);
    balloon.style.setProperty("--mid-drift", `${midDriftValue.toFixed(1)}px`);
    balloon.style.setProperty("--spin", `${spinValue.toFixed(1)}deg`);
    balloon.style.setProperty("--mid-spin", `${midSpinValue.toFixed(1)}deg`);
    balloon.style.setProperty("--string-tilt", `${stringTilt.toFixed(1)}deg`);
    balloon.style.setProperty("--metal-light", color.light);
    balloon.style.setProperty("--metal-mid", color.mid);
    balloon.style.setProperty("--metal-dark", color.dark);
    balloon.style.setProperty("--metal-deep", color.deep);

    layer.appendChild(balloon);
  }
}
