(function () {
  if (location.search.indexOf("dbg=1") === -1) return;
  var bar = document.createElement("div");
  bar.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#111;color:#ffe;font:11px/1.45 monospace;padding:6px 10px;white-space:pre-wrap;direction:ltr;text-align:left;opacity:.98";
  document.body.appendChild(bar);
  function snap() {
    var cta = document.querySelector(".header__cta");
    var cb = cta ? cta.getBoundingClientRect() : null;
    var head = document.querySelector(".header");
    var hb = head ? head.getBoundingClientRect() : null;
    var items = Array.prototype.slice.call(document.querySelectorAll(".nav > .nav__item, .nav > a"));
    var per = items.map(function (a) { var b = a.getBoundingClientRect(); return (a.textContent.trim().slice(0, 8) + ":" + Math.round(b.height) + "/" + Math.round(b.width)); });
    var fonts = (document.fonts && typeof document.fonts.status === "string") ? document.fonts.status : "?";
    var css = document.querySelector('link[href*="style.css"]');
    var ver = css ? css.href.split("=")[1] : "?";
    bar.textContent =
      "W=" + innerWidth + " DPR=" + devicePixelRatio + " CSSv=" + ver + " fonts=" + fonts + " scrollY=" + Math.round(scrollY) + " overX=" + (document.documentElement.scrollWidth - innerWidth) + "\n" +
      "headerH=" + Math.round(hb.height) + " cta=" + (cb ? Math.round(cb.width) + "x" + Math.round(cb.height) : "none") + " items(h/w): " + per.join(" ");
  }
  snap();
  setInterval(snap, 700);
  window.addEventListener("hashchange", function () { setTimeout(snap, 1300); });
  window.addEventListener("click", function () { setTimeout(snap, 1300); }, true);
  window.addEventListener("scroll", snap, { passive: true });
})();