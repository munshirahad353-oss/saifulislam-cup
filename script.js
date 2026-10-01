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

  // ---------- Generic scroll count-up for .stat-value (bn digits) ----------
  (function setupStatsStrip() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".stat-value"));
    if (!els.length) return;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function bnDigits(n) { return String(n).replace(/[0-9]/g, function (d) { return "০১২৩৪৫৬৭৮৯"[d]; }); }
    function animate(el) {
      var target = parseFloat(el.getAttribute("data-target")) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion) { el.textContent = bnDigits(target) + suffix; return; }
      var dur = 1000, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var cur = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = bnDigits(cur) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animate(entry.target); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      els.forEach(function (el) { obs.observe(el); });
    } else {
      els.forEach(animate);
    }
  })();

  // ---------- "এক নজরে" dashboard: pulled live from the embedded tracker (same-origin) ----------
  (function setupGlance() {
    var frame = document.getElementById("heroTrackerFrame");
    var sub = document.getElementById("glanceSub");
    if (!frame) return;

    function bnDigits(n) {
      return String(n).replace(/[0-9]/g, function (d) { return "০১২৩৪৫৬৭৮৯"[d]; });
    }
    function fmtPct(p) {
      if (p == null) return "—";
      var sign = p >= 0 ? "+" : "−";
      return sign + bnDigits(Math.abs(p).toFixed(1)) + "%";
    }
    function animateCount(el, to) {
      var dur = 900, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        el.textContent = bnDigits(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = bnDigits(to);
      } else {
        requestAnimationFrame(step);
      }
    }

    function renderChart(yearlyTrend) {
      var chartEl = document.getElementById("glanceChart");
      if (!yearlyTrend || !yearlyTrend.length) {
        chartEl.innerHTML = '<div class="glance-loading">এখনো কোনো এন্ট্রি নেই।</div>';
        return;
      }
      chartEl.innerHTML = "";
      yearlyTrend.forEach(function (y) {
        var col = document.createElement("div");
        col.className = "glance-year-col";
        var bars = document.createElement("div");
        bars.className = "glance-bars";
        var inc = document.createElement("div");
        inc.className = "glance-bar income";
        inc.style.height = "0px";
        var exp = document.createElement("div");
        exp.className = "glance-bar expense";
        exp.style.height = "0px";
        bars.appendChild(inc);
        bars.appendChild(exp);
        var label = document.createElement("div");
        label.className = "glance-year-label";
        label.textContent = y.year + " বছর";
        col.appendChild(bars);
        col.appendChild(label);
        chartEl.appendChild(col);
        requestAnimationFrame(function () {
          // yearlyTrend values are already a 0–100 relative index — no taka figures involved.
          inc.style.height = Math.max(4, (y.incomeIndex / 100) * 150) + "px";
          exp.style.height = Math.max(4, (y.expenseIndex / 100) * 150) + "px";
        });
      });
    }

    function renderActivity(entries) {
      var listEl = document.getElementById("glanceActivity");
      if (!entries || !entries.length) {
        listEl.innerHTML = '<li class="glance-loading">এখনো কোনো এন্ট্রি নেই।</li>';
        return;
      }
      listEl.innerHTML = "";
      entries.forEach(function (e) {
        var li = document.createElement("li");
        var catSpan = document.createElement("span");
        catSpan.className = "ga-cat";
        catSpan.textContent = e.category + (e.date ? " · " + e.date : e.year ? " · " + e.year + " বছর" : "");
        var tagSpan = document.createElement("span");
        tagSpan.className = "ga-amt " + e.type;
        tagSpan.textContent = e.type === "income" ? "আয়" : "খরচ";
        li.appendChild(catSpan);
        li.appendChild(tagSpan);
        listEl.appendChild(li);
      });
    }

    function applySummary(sum) {
      if (!sum) return;
      document.getElementById("kpiIncome").textContent = fmtPct(sum.incomeGrowthPct);
      document.getElementById("kpiExpense").textContent = fmtPct(sum.expenseGrowthPct);
      var profitEl = document.getElementById("kpiProfit");
      profitEl.textContent = fmtPct(sum.profitGrowthPct);
      profitEl.classList.toggle("is-negative", sum.profitGrowthPct != null && sum.profitGrowthPct < 0);
      animateCount(document.getElementById("kpiInvestors"), sum.investorsCount || 0);
      renderChart(sum.yearlyTrend);
      renderActivity(sum.recentActivity);
      if (sub) sub.textContent = "লাইভ ট্র্যাকার থেকে সরাসরি হালনাগাদ তথ্য (নির্দিষ্ট টাকার অঙ্ক শুধু ইনভেস্টর লগইনে দেখা যাবে)";
    }

    function tryPull() {
      try {
        if (frame.contentWindow && typeof frame.contentWindow.getMunshiSummary === "function") {
          applySummary(frame.contentWindow.getMunshiSummary());
          return true;
        }
      } catch (err) { /* cross-origin (e.g. file://) — nothing we can do */ }
      return false;
    }

    frame.addEventListener("load", function () {
      if (!tryPull()) {
        var tries = 0;
        var iv = setInterval(function () {
          tries++;
          if (tryPull() || tries > 20) clearInterval(iv);
        }, 400);
      }
      try {
        frame.contentWindow.addEventListener("munshi:update", function (ev) { applySummary(ev.detail); });
      } catch (err) { /* cross-origin — live updates just won't reach this page */ }
    });

    if (frame.contentWindow && frame.contentDocument && frame.contentDocument.readyState === "complete") {
      tryPull();
    }
  })();

  // ---------- PWA: service worker + install button ----------
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  (function setupInstallPill() {
    var pill = document.getElementById("installPill");
    if (!pill || window.self !== window.top) return; // not inside the hero iframe
    var btn = document.getElementById("installBtn");
    var closeBtn = document.getElementById("installClose");
    var hint = document.getElementById("installHint");
    var standalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone;
    if (standalone) return;
    try { if (sessionStorage.getItem("installDismissed") === "1") return; } catch (e) {}

    var deferred = null;
    var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      deferred = e;
      pill.hidden = false;
    });
    window.addEventListener("appinstalled", function () { pill.hidden = true; });
    if (isIOS) pill.hidden = false;

    btn.addEventListener("click", function () {
      if (deferred) {
        deferred.prompt();
        deferred.userChoice.then(function () { deferred = null; pill.hidden = true; });
      } else if (isIOS) {
        hint.hidden = !hint.hidden;
      }
    });
    closeBtn.addEventListener("click", function () {
      pill.hidden = true;
      try { sessionStorage.setItem("installDismissed", "1"); } catch (e) {}
    });
  })();

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
