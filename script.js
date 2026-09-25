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

  heroTrackerButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-tracker-btn");
      var opened = false;
      try {
        if (heroTrackerFrame && heroTrackerFrame.contentDocument) {
          var innerBtn = heroTrackerFrame.contentDocument.getElementById(targetId);
          if (innerBtn) {
            heroTrackerFrame.scrollIntoView({ behavior: "smooth", block: "center" });
            innerBtn.click();
            opened = true;
          }
        }
      } catch (err) {
        opened = false; // cross-origin or not-yet-loaded — fall back below
      }
      if (!opened) {
        window.open("munshi_agro_tracker.html", "_blank", "noopener");
      }
    });
  });

  // Footer year.
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
