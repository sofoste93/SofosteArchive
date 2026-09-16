document.documentElement.classList.add("js");

const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("[data-site-nav]");

function closeNavigation() {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    siteNav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
}

if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
        const willOpen = navToggle.getAttribute("aria-expanded") !== "true";
        navToggle.setAttribute("aria-expanded", String(willOpen));
        navToggle.setAttribute("aria-label", willOpen ? "Close menu" : "Open menu");
        siteNav.classList.toggle("is-open", willOpen);
        document.body.classList.toggle("nav-open", willOpen);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) closeNavigation();
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
});

const galleryDialog = document.querySelector("[data-gallery-dialog]");

if (galleryDialog instanceof HTMLDialogElement) {
    const dialogImage = galleryDialog.querySelector("[data-dialog-image]");
    const dialogCaption = galleryDialog.querySelector("[data-dialog-caption]");
    const closeButton = galleryDialog.querySelector("[data-dialog-close]");
    let lastGalleryTrigger;

    document.querySelectorAll("[data-gallery-item]").forEach((item) => {
        item.addEventListener("click", () => {
            lastGalleryTrigger = item;
            dialogImage.src = item.dataset.full;
            dialogImage.alt = item.dataset.alt;
            dialogCaption.textContent = item.dataset.caption;
            galleryDialog.showModal();
            closeButton.focus();
        });
    });

    closeButton.addEventListener("click", () => galleryDialog.close());
    galleryDialog.addEventListener("close", () => lastGalleryTrigger?.focus());
    galleryDialog.addEventListener("click", (event) => {
        if (event.target === galleryDialog) galleryDialog.close();
    });
}
