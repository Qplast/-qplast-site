(function () {
  if (location.search.indexOf("dbg=1") === -1) return;
  var bar = document.createElement("div");
  bar.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#111;color:#ffe;font:11px/1.5 monospace;padding:6px 10px;white-space:pre-wrap;direction:ltr;text-align:left;opacity:.98";
  document.body.appendChild(bar);
  function snap() {
    var cta = document.querySelector(".header__cta");
    var cs = cta ? getComputedStyle(cta) : null;
    var cb = cta ? cta.getBoundingClientRect() : null;
    var items = Array.prototype.slice.call(document.querySelectorAll(".nav > .nav__item, .nav > a"));
    var wrap = items.filter(function (a) { return a.getBoundingClientRect().height > 34 && a.textContent.trim() !== "محصولات"; });
    var css = document.querySelector('link[href*="style.css"]');
    var ver = css ? css.href.split("=")[1] : "?";
    var nav = document.querySelector(".nav");
    var nb = nav ? nav.getBoundingClientRect() : null;
    var brand = document.querySelector(".brand");
    var bb = brand ? brand.getBoundingClientRect() : null;
    bar.textContent =
      "W=" + window.innerWidth +
      " DPR=" + devicePixelRatio +
      " CSSv=" + ver +
      " scrollY=" + Math.round(scrollY) +
      " | CTA=" + (cs ? cs.display + " " + Math.round(cb.width) + "x" + Math.round(cb.height) : "none") +
      " | navW=" + (nb ? Math.round(nb.width) : "?") +
      " brandR=" + (bb ? Math.round(bb.right) : "?") +
      " overX=" + (document.documentElement.scrollWidth - window.innerWidth) +
      " | wrapItems=[" + wrap.map(function (a) { return a.textContent.trim(); }).join(",") + "]";
  }
  snap();
  setInterval(snap, 500);
  window.addEventListener("hashchange", function () { setTimeout(snap, 1200); });
  window.addEventListener("click", function () { setTimeout(snap, 1200); }, true);
  window.addEventListener("scroll", snap, { passive: true });
})();