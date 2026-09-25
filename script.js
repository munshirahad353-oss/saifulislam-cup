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

  // Highlight the current section's nav link while scrolling.
  // scroll-margin-top on sections (see CSS) keeps this in sync with the
  // sticky header's height, so it needs no hardcoded offset here.
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("a[data-nav]"));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href").replace("#", "");
      return document.getElementById(id);
    })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + id);
    });
  }

  if (sections.length) {
    if ("IntersectionObserver" in window) {
      // Track intersection ratios so the most-visible section wins,
      // avoiding flicker when two sections are both partly on screen.
      var ratios = {};
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            ratios[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
          });
          var currentId = null;
          var best = 0;
          sections.forEach(function (section) {
            var r = ratios[section.id] || 0;
            if (r > best) {
              best = r;
              currentId = section.id;
            }
          });
          if (currentId) setActive(currentId);
        },
        { rootMargin: "-96px 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      sections.forEach(function (section) { observer.observe(section); });
      setActive(sections[0].id);
    } else {
      // Fallback for older browsers without IntersectionObserver.
      var fallback = function () {
        var scrollPos = window.scrollY + 120;
        var current = sections[0];
        sections.forEach(function (section) {
          if (section.offsetTop <= scrollPos) current = section;
        });
        if (current) setActive(current.id);
      };
      window.addEventListener("scroll", fallback, { passive: true });
      fallback();
    }
  }

  // Footer year.
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
