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

  // ---------- Dashboard tabs (About / Focus / Projects / Contact) ----------
  var dashTabs = Array.prototype.slice.call(document.querySelectorAll(".dash-tab"));
  var tabPanels = Array.prototype.slice.call(document.querySelectorAll(".tab-panel"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("a[data-nav]"));

  function activateTab(name) {
    dashTabs.forEach(function (btn) {
      var isMatch = btn.getAttribute("data-tab") === name;
      btn.classList.toggle("active", isMatch);
      btn.setAttribute("aria-selected", isMatch ? "true" : "false");
    });
    tabPanels.forEach(function (panel) {
      panel.classList.toggle("active", panel.getAttribute("data-panel") === name);
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + name);
    });
  }

  dashTabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activateTab(btn.getAttribute("data-tab"));
    });
  });

  // Header nav links (About/Focus/Projects/Contact) switch the matching
  // tab and scroll the dashboard section into view, rather than jumping
  // to a hidden panel directly.
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var name = link.getAttribute("href").replace("#", "");
      var hasTab = dashTabs.some(function (btn) { return btn.getAttribute("data-tab") === name; });
      if (hasTab) {
        e.preventDefault();
        activateTab(name);
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

  // Footer year.
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
