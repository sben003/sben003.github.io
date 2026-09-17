/* Portfolio Salem Benzineh - JS minimal, sans dependance.
   1. Bascule de theme (clair / sombre / systeme)
   2. Mise en evidence de la section courante dans la navigation           */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORE_KEY = "sb-theme";

  /* --- 1. Theme ---------------------------------------------------------- */
  var toggle = document.querySelector(".theme-toggle");

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function currentTheme() {
    var forced = root.getAttribute("data-theme");
    if (forced === "dark" || forced === "light") return forced;
    return systemPrefersDark() ? "dark" : "light";
  }

  function syncToggle() {
    if (!toggle) return;
    var dark = currentTheme() === "dark";
    var label = toggle.getAttribute(dark ? "data-label-light" : "data-label-dark");
    toggle.setAttribute("aria-label", label || "");
    toggle.setAttribute("title", label || "");
    toggle.setAttribute("aria-pressed", String(dark));
  }

  if (toggle) {
    toggle.hidden = false;
    syncToggle();
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(STORE_KEY, next); } catch (e) { /* stockage indisponible */ }
      syncToggle();
    });
  }

  /* Suivre la preference systeme tant que l'utilisateur n'a rien force */
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function () {
      var stored = null;
      try { stored = localStorage.getItem(STORE_KEY); } catch (e) { /* ignore */ }
      if (!stored) syncToggle();
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* --- 2. Section active dans la navigation ------------------------------ */
  var links = Array.prototype.slice.call(document.querySelectorAll(".site-nav a[href^='#']"));
  if (!links.length || !("IntersectionObserver" in window)) return;

  var byId = {};
  var sections = [];

  links.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var section = document.getElementById(id);
    if (section) {
      byId[id] = link;
      sections.push(section);
    }
  });

  var visible = {};

  function refresh() {
    var active = null;
    for (var i = 0; i < sections.length; i++) {
      if (visible[sections[i].id]) { active = sections[i].id; break; }
    }
    links.forEach(function (link) {
      var isActive = link.getAttribute("href") === "#" + active;
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      visible[entry.target.id] = entry.isIntersecting;
    });
    refresh();
  }, { rootMargin: "-20% 0px -70% 0px", threshold: 0 });

  sections.forEach(function (section) { observer.observe(section); });
})();
