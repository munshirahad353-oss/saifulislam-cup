// মো: সাইফুল ইসলাম — Portfolio interactions
// Scope: mobile nav toggle, smooth-scroll close on link click,
// active-section highlighting, footer year. No dependencies.

(function () {
  "use strict";

  var navToggle = document.getElementById("navToggle");
  var siteNav = document.getElementById("siteNav");

  if (navToggle && siteNav) {
    if (siteNav.id) navToggle.setAttribute("aria-controls", siteNav.id);

    function closeNav() {
      siteNav.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }

    navToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = siteNav.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close the mobile menu after a nav link is tapped.
    siteNav.querySelectorAll("a[data-nav]").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    // Close on outside click / tap.
    document.addEventListener("click", function (e) {
      if (siteNav.classList.contains("open") &&
          !siteNav.contains(e.target) &&
          !navToggle.contains(e.target)) {
        closeNav();
      }
    });

    // Close on Escape and return focus to the toggle.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && siteNav.classList.contains("open")) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  // ---------- Info accordion (About / Focus / Projects / Contact) ----------
  var accordionItems = Array.prototype.slice.call(document.querySelectorAll(".accordion-item"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("a[data-nav]"));

  function setItemOpen(item, open) {
    item.classList.toggle("open", open);
    var header = item.querySelector(".accordion-header");
    if (header) header.setAttribute("aria-expanded", open ? "true" : "false");
  }

  // Opens the given section and closes the others (classic FAQ-style accordion).
  function openAccordion(name) {
    accordionItems.forEach(function (item) {
      setItemOpen(item, item.getAttribute("data-acc") === name);
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + name);
    });
  }

  // Clicking an open section's own header closes it; clicking a closed
  // section opens it (and closes whichever other section was open).
  function toggleAccordion(name) {
    var item = accordionItems.filter(function (i) { return i.getAttribute("data-acc") === name; })[0];
    if (item && item.classList.contains("open")) {
      setItemOpen(item, false);
      navLinks.forEach(function (link) {
        if (link.getAttribute("href") === "#" + name) link.classList.remove("active");
      });
    } else {
      openAccordion(name);
    }
  }

  accordionItems.forEach(function (item) {
    var header = item.querySelector(".accordion-header");
    if (header) {
      header.addEventListener("click", function () {
        toggleAccordion(item.getAttribute("data-acc"));
      });
    }
  });

  // Header nav links (About/Focus/Projects/Contact) open the matching
  // accordion section and scroll the dashboard section into view.
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var name = link.getAttribute("href").replace("#", "");
      var hasAcc = accordionItems.some(function (item) { return item.getAttribute("data-acc") === name; });
      if (hasAcc) {
        e.preventDefault();
        openAccordion(name);
        var dashboard = document.getElementById("dashboard");
        if (dashboard) dashboard.scrollIntoView({ behavior: "smooth", block: "start" });
        if (siteNav && siteNav.classList.contains("open")) {
          siteNav.classList.remove("open");
          navToggle.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      }
    });
  });

  // ---------- Hero buttons: reuse the tracker's own Project/Invest options ----------
  // These buttons reach into the already-embedded tracker iframe (same-origin)
  // and click its real button, so PDFs / the invest form stay in sync with
  // whatever the admin has set inside the tracker itself.
  var heroTrackerButtons = Array.prototype.slice.call(document.querySelectorAll("[data-tracker-btn]"));
  var heroTrackerFrame = document.getElementById("heroTrackerFrame");
  var heroTrackerFrameReady = false;

  if (heroTrackerFrame) {
    heroTrackerFrame.addEventListener("load", function () {
      heroTrackerFrameReady = true;
    });
  }

  function clickInnerTrackerButton(targetId) {
    // Returns true if the click was successfully forwarded into the iframe.
    try {
      if (heroTrackerFrame && heroTrackerFrame.contentDocument) {
        var innerBtn = heroTrackerFrame.contentDocument.getElementById(targetId);
        if (innerBtn) {
          heroTrackerFrame.scrollIntoView({ behavior: "smooth", block: "center" });
          innerBtn.click();
          return true;
        }
      }
    } catch (err) {
      // cross-origin (e.g. opened via file://) — fall back to opening a new tab
    }
    return false;
  }

  heroTrackerButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-tracker-btn");

      if (clickInnerTrackerButton(targetId)) return;

      // Iframe likely hasn't finished loading yet: wait for it, then retry
      // once, instead of immediately popping a new tab.
      if (heroTrackerFrame && !heroTrackerFrameReady) {
        var retried = false;
        var onReady = function () {
          if (retried) return;
          retried = true;
          if (!clickInnerTrackerButton(targetId)) {
            window.open("munshi_agro_tracker.html", "_blank", "noopener");
          }
        };
        heroTrackerFrame.addEventListener("load", onReady, { once: true });
        // Safety net in case the load event already fired just before this
        // listener was attached (race condition on slow connections).
        setTimeout(function () {
          if (!retried) onReady();
        }, 1500);
        return;
      }

      window.open("munshi_agro_tracker.html", "_blank", "noopener");
    });
  });

  // ---------- Scroll fade-in (progressive enhancement) ----------
  // Only activates when JS + IntersectionObserver are available, so the
  // page is fully visible by default without them.
  var fadeSection = document.querySelector(".section.dashboard-section");
  if (fadeSection && "IntersectionObserver" in window) {
    fadeSection.classList.add("fade-init");
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          fadeSection.classList.add("fade-in");
          fadeObserver.unobserve(fadeSection);
        }
      });
    }, { threshold: 0.08 });
    fadeObserver.observe(fadeSection);
  }

  // ---------- Scroll progress bar ----------
  var progressBar = document.querySelector("#scrollProgress span");
  if (progressBar) {
    var updateProgress = function () {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + "%";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  }

  // ---------- Back-to-top button ----------
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    var toggleBackToTop = function () {
      backToTop.classList.toggle("show", (window.scrollY || document.documentElement.scrollTop) > 480);
    };
    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTop.addEventListener("click", function () {
      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  // ---------- Hero tagline typing animation ----------
  var typingEl = document.getElementById("typingTagline");
  if (typingEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var fullText = typingEl.textContent;
    typingEl.textContent = "";
    var i = 0;
    (function typeNext() {
      if (i <= fullText.length) {
        typingEl.textContent = fullText.slice(0, i);
        i++;
        setTimeout(typeNext, 65);
      }
    })();
  }

  // Footer year.
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Lightbox (click a project-gallery image to enlarge) ----------
  var galleryImgs = Array.prototype.slice.call(document.querySelectorAll(".project-gallery img"));
  var lightbox = document.getElementById("lightboxOverlay");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxClose = document.getElementById("lightboxClose");
  var lastFocused = null;

  function openLightbox(img) {
    var figure = img.closest("figure");
    var caption = figure ? figure.querySelector("figcaption") : null;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    lightboxCaption.textContent = caption ? caption.textContent : "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    lastFocused = document.activeElement;
    lightboxClose.focus();
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (lightbox && galleryImgs.length) {
    galleryImgs.forEach(function (img) {
      img.addEventListener("click", function () { openLightbox(img); });
    });
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
    });
  }
})();
