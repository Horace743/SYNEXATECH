(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Année dynamique dans le footer                                     */
  /* ------------------------------------------------------------------ */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ */
  /* Mode clair / sombre                                                */
  /* ------------------------------------------------------------------ */
  var themeToggle = document.getElementById("themeToggle");
  var root = document.documentElement;

  function getStoredTheme() {
    try { return localStorage.getItem("synexa-theme"); } catch (e) { return null; }
  }
  function storeTheme(value) {
    try { localStorage.setItem("synexa-theme", value); } catch (e) {}
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre");
    }
  }

  // Le thème initial est déjà posé par le script inline dans <head> (anti-flash).
  // On synchronise juste le libellé accessible du bouton.
  applyTheme(root.getAttribute("data-theme") || "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(current);
      storeTheme(current);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Menu mobile                                                        */
  /* ------------------------------------------------------------------ */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Lien de navigation actif au scroll                                 */
  /* On repère la section dont le haut vient de passer sous le header : */
  /* c'est celle qui occupe visuellement l'écran à cet instant.         */
  /* ------------------------------------------------------------------ */
  var navLinks = document.querySelectorAll(".main-nav a");
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var headerEl = document.getElementById("header");

  if (navLinks.length && sections.length) {
    var ticking = false;

    function updateActiveNav() {
      var headerHeight = headerEl ? headerEl.offsetHeight : 76;
      var refLine = headerHeight + 24;
      var currentId = sections[0].id;

      for (var i = 0; i < sections.length; i++) {
        var top = sections[i].getBoundingClientRect().top;
        if (top <= refLine) currentId = sections[i].id;
      }

      navLinks.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + currentId);
      });
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(updateActiveNav);
        ticking = true;
      }
    }, { passive: true });

    updateActiveNav();
  }

  /* ------------------------------------------------------------------ */
  /* Animations au scroll (reveal)                                      */
  /* ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll(".reveal, .reveal-fade");
  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reduceMotionQuery.matches || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    // Stagger : indexe les enfants directs des grilles pour un décalage progressif
    ["values-grid", "services-grid", "about-features"].forEach(function (cls) {
      var grid = document.querySelector("." + cls);
      if (!grid) return;
      Array.prototype.forEach.call(grid.children, function (child, i) {
        child.style.setProperty("--i", i);
      });
    });

    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* Formulaire de contact (site 100% statique, sans serveur)           */
  /* Ouvre le client mail de l'utilisateur avec le message pré-rempli.  */
  /* ------------------------------------------------------------------ */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  var DEST_EMAIL = "contactsynexatech@gmail.com";

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var subject = form.subject.value.trim();
      var message = form.message.value.trim();

      if (!name || !email || !subject || !message) {
        status.textContent = "Merci de remplir tous les champs avant d'envoyer.";
        status.style.color = "#dc2626";
        return;
      }

      var body =
        "Nom : " + name + "\n" +
        "Email : " + email + "\n\n" +
        message;

      var mailto =
        "mailto:" + encodeURIComponent(DEST_EMAIL) +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailto;

      status.textContent = "Votre client mail va s'ouvrir avec le message pré-rempli.";
      status.style.color = "var(--blue)";
    });
  }

  /* ------------------------------------------------------------------ */
  /* Animation du hero : réseau hexagonal (motif du logo = synergie)    */
  /* ------------------------------------------------------------------ */
  var canvas = document.getElementById("hexField");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var nodes = [];
  var width, height, dpr;

  var COLORS = ["rgba(37,99,235,0.9)", "rgba(212,175,55,0.9)"];
  var LINK_DIST = 170;

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initNodes();
  }

  function initNodes() {
    var count = Math.max(18, Math.round((width * height) / 48000));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.6 + 1.2,
        c: COLORS[i % 2 === 0 ? 0 : 1]
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    }

    for (var a = 0; a < nodes.length; a++) {
      for (var b = a + 1; b < nodes.length; b++) {
        var dx = nodes[a].x - nodes[b].x;
        var dy = nodes[a].y - nodes[b].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          var alpha = (1 - dist / LINK_DIST) * 0.35;
          ctx.strokeStyle = "rgba(148,163,184," + alpha.toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[a].x, nodes[a].y);
          ctx.lineTo(nodes[b].x, nodes[b].y);
          ctx.stroke();
        }
      }
    }

    for (var j = 0; j < nodes.length; j++) {
      var node = nodes[j];
      ctx.beginPath();
      ctx.fillStyle = node.c;
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reduceMotionQuery.matches) requestAnimationFrame(step);
  }

  window.addEventListener("resize", resize);
  resize();
  step();
})();
