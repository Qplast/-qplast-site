/* ============================================================
   Q Plast — shared site scripts
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Language ---------- */
  var LANGS = ["fa", "en", "ar", "tr", "zh"];
  var LABELS = { fa: "فارسی", en: "English", ar: "العربية", tr: "Türkçe", zh: "中文" };
  var SITE_VER = 4;
  var savedVer = parseInt(localStorage.getItem("qplast-ver") || "0", 10);
  if (savedVer < SITE_VER) {
    localStorage.removeItem("qplast-lang");
    localStorage.setItem("qplast-ver", SITE_VER);
  }
  var currentLang = localStorage.getItem("qplast-lang") || "fa";
  if (LANGS.indexOf(currentLang) === -1) currentLang = "fa";

  function applyLang(lang) {
    var dir = lang === "fa" || lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;

    document.querySelectorAll("[data-" + lang + "]").forEach(function (el) {
      if (el.tagName === "OPTION") {
        el.textContent = el.getAttribute("data-" + lang);
      } else {
        el.innerHTML = el.getAttribute("data-" + lang);
      }
    });

    var btn = document.getElementById("langBtn");
    if (btn) {
      var icon = btn.querySelector(".lang-select__icon");
      var label = document.createElement("span");
      label.className = "lang-select__label";
      label.textContent = LABELS[lang];
      btn.innerHTML = "";
      if (icon) btn.appendChild(icon);
      btn.appendChild(label);
    }

    document.documentElement.setAttribute("data-lang", lang);
    localStorage.setItem("qplast-lang", lang);
    if (typeof updateFinder === "function") updateFinder();
    if (typeof renderSpecs === "function") renderSpecs();
  }

  var langBtn = document.getElementById("langBtn");
  var langMenu = document.getElementById("langMenu");
  if (langBtn && langMenu) {
    langBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      langMenu.classList.toggle("open");
    });
    langMenu.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        currentLang = b.getAttribute("data-lang");
        applyLang(currentLang);
        langMenu.classList.remove("open");
      });
    });
    document.addEventListener("click", function (e) {
      if (langMenu && !langMenu.contains(e.target)) langMenu.classList.remove("open");
    });
  }

  applyLang(currentLang);

  /* ---------- Header scroll ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 20);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("navBurger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      burger.classList.toggle("open");
      nav.classList.toggle("open");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        burger.classList.remove("open");
        nav.classList.remove("open");
      });
    });
  }

  /* ---------- Active nav link ---------- */
  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (nav) nav.querySelectorAll("a").forEach(function (a) {
    var href = (a.getAttribute("href") || "").toLowerCase();
    if (href && href.charAt(0) !== "#" && href === page) a.classList.add("active");
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal-target");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  /* ---------- Product finder ---------- */
  var finderRec = document.getElementById("finderRec");
  var finderType = document.getElementById("finderType");
  var finderVol = document.getElementById("finderVol");
  var beautyCards = document.getElementById("beautyCards");

  var SPECS_DATA = {
    hamta: {
      family: { fa: "همتا", en: "Hamta", ar: "همتا", tr: "Hamta", zh: "Hamta" },
      diameter: 45,
      pump: 54.95,
      material: "PET",
      bottles: [
        { vol: 90, h: 66, neck: 24 },
        { vol: 100, h: 80, neck: 24 },
        { vol: 140, h: 100, neck: 24 },
        { vol: 170, h: 112.27, neck: 24 },
        { vol: 220, h: 150, neck: 24 }
      ]
    },
    arya: {
      family: { fa: "آریا", en: "Arya", ar: "آريا", tr: "Arya", zh: "Arya" },
      diameter: 30.5,
      cap: 47,
      material: "PET",
      bottles: [
        { vol: 30, h: 66, neck: 18 },
        { vol: 50, h: 81, neck: 18 },
        { vol: 80, h: 126.5, neck: 18 }
      ]
    },
    pars: {
      family: { fa: "پارس", en: "Pars", ar: "بارس", tr: "Pars", zh: "Pars" },
      diameter: 36,
      cap: 49,
      material: "PET",
      bottles: [
        { vol: 30, h: 35, neck: 20 },
        { vol: 50, h: 58.3, neck: 20 },
        { vol: 80, h: 93.28, neck: 20 }
      ]
    },
    qoil: {
      family: { fa: "اسپری روغن Q", en: "Q Oil Spray", ar: "رذاذ الزيت Q", tr: "Q Yağ Spreyi", zh: "Q油雾喷头" },
      diameter: 45,
      pump: 0,
      material: "PET",
      sprayType: { fa: "میست اسپری", en: "Mist spray", ar: "رذاذ", tr: "Mist sprey", zh: "喷雾" },
      colors: { fa: "سیاه و سفید", en: "Black & White", ar: "أسود وأبيض", tr: "Siyah ve Beyaz", zh: "黑白" },
      chrome: true,
      bottles: [
        { vol: 140, h: 155, neck: 24 }
      ]
    }
  };

  function recText(lang, fam) {
    var NAMES = {
      fa: { hamta: "«همتا»", arya: "«آریا»", pars: "«پارس»", sepanta: "«سپنتا»", qoil: "«اسپری روغن Q»" },
      en: { hamta: "Hamta", arya: "Arya", pars: "Pars", sepanta: "Sepanta", qoil: "Q Oil Spray" },
      ar: { hamta: "«همتا»", arya: "«آريا»", pars: "«بارس»", sepanta: "«سبنتا»", qoil: "«رذاذ الزيت Q»" },
      tr: { hamta: "Hamta", arya: "Arya", pars: "Pars", sepanta: "Sepanta", qoil: "Q Yağ Spreyi" },
      zh: { hamta: "Hamta", arya: "Arya", pars: "Pars", sepanta: "Sepanta", qoil: "Q油雾喷头" }
    };
    var names = NAMES[lang] || NAMES.en;
    var families = fam === "all" ? [] : fam.split("+");
    if (families.length === 0) {
      var allMsg = {
        fa: "برای محصول شما، مجموعه‌های «همتا»، «آریا»، «پارس» و «سپنتا» مناسب هستند.",
        en: "The Hamta, Arya, Pars and Sepanta collections suit your product.",
        ar: "مجموعات «همتا» و«آريا» و«بارس» و«سبنتا» مناسبة لمنتجك.",
        tr: "Hamta, Arya, Pars ve Sepanta koleksiyonları ürününüze uygundur.",
        zh: "Hamta、Arya、Pars和Sepanta系列都适合您的产品。"
      };
      return allMsg[lang] || allMsg.en;
    }
    var labeled = families.map(function (f) { return names[f] || f; });
    var joined;
    if (labeled.length === 1) joined = labeled[0];
    else if (labeled.length === 2) joined = labeled[0] + " و " + labeled[1];
    else if (labeled.length === 3) joined = labeled[0] + "، " + labeled[1] + " و " + labeled[2];
    else joined = labeled.slice(0, -1).join("، ") + " و " + labeled[labeled.length - 1];
    var prefix = {
      fa: "برای محصول شما، مجموعه" + (labeled.length > 1 ? "های" : "") + " ",
      en: "For your product, the ",
      ar: "لمنتجك، ",
      tr: "Ürününüz için ",
      zh: "针对您的产品，"
    };
    var suffix = {
      fa: " مناسب هستند.",
      en: " collections are the best fit.",
      ar: " مناسبة لك.",
      tr: " koleksiyonları en iyi seçimdir.",
      zh: " 系列是最佳选择。"
    };
    return (prefix[lang] || prefix.en) + joined + (suffix[lang] || suffix.en);
  }

  /* ---------- Blueprint drawing ---------- */
  var fmt = function (n) {
    return String(n).replace(".", ".");
  };

  function buildBlueprint(fam, vol) {
    var f = SPECS_DATA[fam];
    var bottle = null;
    for (var i = 0; i < f.bottles.length; i++) {
      if (f.bottles[i].vol === vol) { bottle = f.bottles[i]; break; }
    }
    if (!bottle) return "";

    var dia = f.diameter || 45;
    var bottleHmm = bottle.h;
    var neckHmm = bottle.neck || 24;
    var topHmm = f.cap || f.pump;   /* cap (Arya) or pump (Hamta) on top of bottle */
    var tubeHmm = bottleHmm;        /* straw length equals bottle height */

    var targetH = 460;              /* desired drawing height (px) */
    var mm = Math.min(6, targetH / (bottleHmm + topHmm));  /* px per mm, capped */

    var bw = dia * mm;              /* bottle body width = cap width (same Ø) */
    var neckW = neckHmm * mm;       /* neck width from bottle's own size */
    var topW = bw;                  /* cap/pump width = bottle width */
    var bottleH = bottleHmm * mm;
    var topH = topHmm * mm;
    var tubeH = tubeHmm * mm;

    var padTop = 34, padLeft = 64, padRight = 64, padBottom = 44;
    var W = padLeft + padRight + bw;
    var H = padTop + topH + bottleH + padBottom;

    var cx = padLeft + bw / 2;
    var xTop1 = cx - topW / 2, xTop2 = cx + topW / 2;
    var xNeck1 = cx - neckW / 2, xNeck2 = cx + neckW / 2;
    var yActTop = padTop;
    var yTopTop = yActTop + 14;
    var yTopBottom = yTopTop + topH;
    var yBottleTop = yTopBottom;
    var yBottleBottom = yBottleTop + bottleH;

    var s = "";
    s += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="technical drawing">';
    /* bottle body (cylinder) */
    s += '<rect x="' + (cx - bw / 2) + '" y="' + yBottleTop + '" width="' + bw + '" height="' + bottleH + '" rx="8" fill="#ffffff" stroke="#1b1915" stroke-width="1.6"/>';
    /* cap / pump head (directly on top of bottle, no gap) */
    s += '<rect x="' + xTop1 + '" y="' + yTopTop + '" width="' + topW + '" height="' + (yTopBottom - yTopTop) + '" rx="4" fill="#ffffff" stroke="#1b1915" stroke-width="1.6"/>';
    /* actuator / nozzle (same width) */
    s += '<rect x="' + (cx - topW / 2) + '" y="' + yActTop + '" width="' + topW + '" height="14" rx="3" fill="#ffffff" stroke="#1b1915" stroke-width="1.4"/>';
    /* dip tube (dashed, starts at bottle top) */
    s += '<line x1="' + cx + '" y1="' + (yBottleTop + 8) + '" x2="' + cx + '" y2="' + (yBottleTop + 8 + tubeH) + '" stroke="#9c7a3e" stroke-width="1.4" stroke-dasharray="5 4"/>';

    /* dimension helper values */
    var vBottle = fmt(bottleHmm) + " mm";
    var vTop = fmt(topHmm) + " mm";
    var vTube = fmt(tubeHmm) + " mm";
    var vTotal = fmt(Number((bottleHmm + topHmm).toFixed(2))) + " mm";
    var vDia = "Ø " + fmt(dia) + " mm";

    /* right: tube length + total height */
    s += dimV(cx + bw / 2 + 18, yBottleTop, yBottleTop + tubeH, vTube, "start");
    s += dimV(cx + bw / 2 + 44, yActTop, yBottleBottom, vTotal, "start");
    /* bottom: diameter */
    s += dimH(yBottleBottom + 26, cx - bw / 2, cx + bw / 2, vDia);

    /* neck label */
    s += textLabel(cx, yBottleTop + bottleH * 0.5 + 6, "NECK " + fmt(neckHmm) + " mm", "normal", "#5f5a50");

    s += "</svg>";
    return s;
  }

  function dimV(x, y1, y2, text, anchor) {
    var mid = (y1 + y2) / 2;
    /* place text on the line, centered on it, rotated 90deg to run along the dimension */
    var rot = anchor === "start" ? 90 : -90;
    var s = "";
    s += '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '" stroke="#8a8373" stroke-width="1.1"/>';
    s += '<line x1="' + (x - 5) + '" y1="' + y1 + '" x2="' + (x + 5) + '" y2="' + y1 + '" stroke="#8a8373" stroke-width="1.1"/>';
    s += '<line x1="' + (x - 5) + '" y1="' + y2 + '" x2="' + (x + 5) + '" y2="' + y2 + '" stroke="#8a8373" stroke-width="1.1"/>';
    /* keep number beside the line so it stays readable */
    var tx = anchor === "start" ? x + 8 : x - 8;
    s += '<text x="' + tx + '" y="' + mid + '" text-anchor="middle" transform="rotate(' + rot + ' ' + tx + ' ' + mid + ')" font-size="12" font-weight="600" font-family="Arial, sans-serif" fill="#1b1915">' + text + '</text>';
    return s;
  }

  function dimH(y, x1, x2, text) {
    var mid = (x1 + x2) / 2;
    var s = "";
    s += '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke="#8a8373" stroke-width="1.1"/>';
    s += '<line x1="' + x1 + '" y1="' + (y - 5) + '" x2="' + x1 + '" y2="' + (y + 5) + '" stroke="#8a8373" stroke-width="1.1"/>';
    s += '<line x1="' + x2 + '" y1="' + (y - 5) + '" x2="' + x2 + '" y2="' + (y + 5) + '" stroke="#8a8373" stroke-width="1.1"/>';
    s += '<text x="' + mid + '" y="' + (y + 16) + '" text-anchor="middle" font-size="12" font-weight="600" font-family="Arial, sans-serif" fill="#1b1915">' + text + '</text>';
    return s;
  }

  function textLabel(x, y, txt, weight, color) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="11" font-weight="' + (weight || "normal") + '" font-family="Arial, sans-serif" fill="' + (color || "#1b1915") + '">' + txt + '</text>';
  }

  /* ---------- Blueprint renderer state ---------- */
  var specsPanel = document.getElementById("specsPanel");
  var currentFamily = "hamta";
  var currentVol = 220;

  function renderSpecs() {
    if (!specsPanel || specsPanel.hidden) return;
    var f = SPECS_DATA[currentFamily];
    var volBtns = document.getElementById("specsVolumes");
    var drawEl = document.getElementById("specsDrawing");
    var capEl = document.getElementById("specsCaption");
    var photoEl = document.getElementById("specsPhoto");

    var famName = f.family[currentLang] || f.family.en;
    document.getElementById("specsFamily").textContent = famName;

    /* product photo */
    if (photoEl) {
      var imgMap = {
        hamta: "../assets/hamta-product.png",
        arya: "../assets/arya-white.png",
        pars: "../assets/pars-product.png",
        qoil: "../assets/qoil-product.png"
      };
      var src = imgMap[currentFamily];
      photoEl.innerHTML = src ? '<img src="' + src + '" alt="' + famName + '" loading="lazy"/>' : "";
    }

    /* volume buttons */
    volBtns.innerHTML = "";
    f.bottles.forEach(function (b) {
      var bEl = document.createElement("button");
      bEl.type = "button";
      bEl.className = "specs__vol" + (b.vol === currentVol ? " active" : "");
      bEl.textContent = b.vol + " ml";
      bEl.addEventListener("click", function () {
        currentVol = b.vol;
        renderSpecs();
      });
      volBtns.appendChild(bEl);
    });

    /* drawing */
    drawEl.innerHTML = buildBlueprint(currentFamily, currentVol);

    /* caption */
    var bottle = null;
    for (var i = 0; i < f.bottles.length; i++) {
      if (f.bottles[i].vol === currentVol) { bottle = f.bottles[i]; break; }
    }
    var caps = [];
    caps.push({ l: "Bottle", v: fmt(bottle.h) + " mm" });
    caps.push({ l: "Neck", v: fmt(bottle.neck || 24) + " mm" });
    caps.push({ l: f.cap ? "Cap" : "Pump", v: fmt(f.cap || f.pump) + " mm" });
    caps.push({ l: "Straw", v: fmt(bottle.h) + " mm" });
    caps.push({ l: "Body", v: f.material });
    var DIM_LABELS = {
      fa: { Bottle: "ارتفاع بطری", Neck: "دهانه", Pump: "طول پمپ", Cap: "کاپ", Straw: "نی", Body: "جنس بدنه" },
      en: { Bottle: "Bottle height", Neck: "Neck", Pump: "Pump length", Cap: "Cap", Straw: "Straw", Body: "Body material" },
      ar: { Bottle: "ارتفاع الزجاجة", Neck: "العنق", Pump: "طول المضخة", Cap: "الغطاء", Straw: "المصاصة", Body: "مادة الجسم" },
      tr: { Bottle: "Şişe yüksekliği", Neck: "Boyun", Pump: "Pompa uzunluğu", Cap: "Kapak", Straw: "Pipet", Body: "Gövde malzemesi" },
      zh: { Bottle: "瓶高", Neck: "口径", Pump: "泵长", Cap: "瓶盖", Straw: "吸管", Body: "主体材质" }
    };
    var L = DIM_LABELS[currentLang] || DIM_LABELS.en;
    capEl.innerHTML = caps.map(function (c) {
      return '<span class="specs__cap-item">' + L[c.l] + ': <b>' + c.v + '</b></span>';
    }).join("");
  }

  function updateFinder() {
    if (!finderRec || !beautyCards) return;
    var type = "all";
    var vol = "all";
    var typeActive = finderType && finderType.querySelector(".finder__chip.active");
    var volActive = finderVol && finderVol.querySelector(".finder__chip.active");
    if (typeActive) type = typeActive.getAttribute("data-type");
    if (volActive) vol = volActive.getAttribute("data-vol");

    var volFams = vol === "small" ? ["arya", "pars", "sepanta", "qoil"] : vol === "large" ? ["hamta"] : null;
    var cards = beautyCards.querySelectorAll(".card[data-family]");
    var shown = [];
    cards.forEach(function (card) {
      var fam = card.getAttribute("data-family");
      var types = (card.getAttribute("data-types") || "").split(" ");
      var typeHit = type === "all" || types.indexOf(type) !== -1;
      var volHit = !volFams || volFams.indexOf(fam) !== -1;
      var match = typeHit && volHit;
      card.style.display = match ? "" : "none";
      if (match) shown.push(fam);
    });
    var msg = recText(currentLang, shown.length ? shown.join("+") : "all");
    if (type === "oil") {
      var oilNote = {
        fa: "میست روغن خوراکی: اسپری Q | میست روغن آرایشی: همتا",
        en: "Edible oil mist: Q Oil Spray | Cosmetic oil mist: Hamta",
        ar: "رذاذ زيت غذائي: رذاذ الزيت Q | رذاذ زيت تجميلي: همتا",
        tr: "Yenilebilir yağ spreyi: Q Yağ Spreyi | Kozmetik yağ spreyi: Hamta",
        zh: "食用油喷雾：Q Oil Spray | 化妆品油雾：Hamta"
      };
      msg += " — " + (oilNote[currentLang] || oilNote.en);
    }
    if (type === "micellar") {
      var micNote = {
        fa: "میسلار واتر معمولاً با پمپ همتا (دهانه ۲۴) سازگار است.",
        en: "Micellar water is typically compatible with the Hamta pump (Neck 24).",
        ar: "ماء الميسيلار عادة ما يتوافق مع مضخة همتا (عنق ٢٤).",
        tr: "Misel suyu genellikle Hamta pompası (24 boyun) ile uyumludur.",
        zh: "卸妆水通常与Hamta泵（口径24）兼容。"
      };
      msg += " — " + (micNote[currentLang] || micNote.en);
    }
    finderRec.textContent = msg;
  }

  function showSpecs(fam) {
    if (!SPECS_DATA[fam]) return;
    var specsPanel = document.getElementById("specsPanel");
    if (!specsPanel) return;
    currentFamily = fam;
    var vols = SPECS_DATA[fam].bottles;
    var matches = vols.filter(function (b) { return b.vol === currentVol; });
    if (!matches.length) currentVol = vols[vols.length - 1].vol;
    specsPanel.hidden = false;
    specsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    renderSpecs();
  }

  if (finderType) {
    finderType.addEventListener("click", function (e) {
      var chip = e.target.closest(".finder__chip");
      if (!chip) return;
      finderType.querySelectorAll(".finder__chip").forEach(function (c) {
        c.classList.remove("active");
      });
      chip.classList.add("active");
      updateFinder();
    });
  }
  if (finderVol) {
    finderVol.addEventListener("click", function (e) {
      var chip = e.target.closest(".finder__chip");
      if (!chip) return;
      finderVol.querySelectorAll(".finder__chip").forEach(function (c) {
        c.classList.remove("active");
      });
      chip.classList.add("active");
      updateFinder();
    });
  }
  if (beautyCards) {
    beautyCards.addEventListener("click", function (e) {
      var card = e.target.closest(".card[data-family]");
      if (!card) return;
      showSpecs(card.getAttribute("data-family"));
    });
  }
  updateFinder();

  /* ---------- Inquiry form ---------- */
  var form = document.getElementById("inquiryForm");
  var note = document.getElementById("formNote");
  if (form && note) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("fName").value.trim();
      var company = document.getElementById("fCompany").value.trim();
      var email = document.getElementById("fEmail").value.trim();
      var phone = document.getElementById("fPhone").value.trim();
      var family = document.getElementById("fFamily").value;
      var volume = document.getElementById("fVolume").value;
      var qty = document.getElementById("fQty").value.trim();
      var msg = document.getElementById("fMsg").value.trim();

      var familyLabel = family === "hamta" ? "Hamta (Neck 24)" : family === "arya" ? "Arya (Neck 18)" : family === "pars" ? "Pars (Neck 20)" : family === "sepanta" ? "Sepanta (Airless)" : family === "qoil" ? "Q Oil Spray" : family;
      var subject = "Quote request — " + (company || name);

      var lines = [
        "Name: " + name,
        "Company: " + (company || "-"),
        "Email: " + email,
        "Phone: " + (phone || "-"),
        "Collection: " + familyLabel,
        "Volume: " + volume + " ml",
        "Qty: " + (qty || "-"),
        "",
        "Message:",
        msg || "-"
      ];

      window.location.href =
        "mailto:sales@qplast.ir?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));

      note.hidden = false;
      note.className = "form__note success";
      var okText = {
        fa: "درخواست شما آماده شد. لطفاً ارسال ایمیل را تأیید کنید. در صورت باز نشدن ایمیل‌خوان، درخواست را به sales@qplast.ir بفرستید.",
        en: "Your request is ready. Please confirm sending the email. If your mail client doesn't open, send the request to sales@qplast.ir.",
        ar: "تم تجهيز طلبك. يرجى تأكيد إرسال البريد الإلكتروني. إذا لم يفتح برنامج البريد، أرسل الطلب إلى sales@qplast.ir.",
        tr: "Talebiniz hazır. Lütfen e-postayı göndermeyi onaylayın. E-posta uygulaması açılmazsa talebi sales@qplast.ir adresine gönderin.",
        zh: "您的请求已准备好。请确认发送邮件。如果邮件客户端未打开，请将请求发送至 sales@qplast.ir。"
      };
      note.textContent = okText[currentLang] || okText.en;

      form.reset();
    });
  }

  /* ---------- Contact form ---------- */
  var cForm = document.getElementById("contactForm");
  var cNote = document.getElementById("contactNote");
  if (cForm && cNote) {
    cForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("cName").value.trim();
      var email = document.getElementById("cEmail").value.trim();
      var subject = document.getElementById("cSubject").value.trim();
      var msg = document.getElementById("cMsg").value.trim();

      var lines = [
        "Name: " + name,
        "Email: " + email,
        "",
        "Subject: " + (subject || "-"),
        "",
        "Message:",
        msg
      ];

      window.location.href =
        "mailto:sales@qplast.ir?subject=" + encodeURIComponent(subject || "Contact — " + name) + "&body=" + encodeURIComponent(lines.join("\n"));

      cNote.hidden = false;
      cNote.className = "form__note success";
      var okText = {
        fa: "پیام شما آماده شد. لطفاً ارسال ایمیل را تأیید کنید.",
        en: "Your message is ready. Please confirm sending the email.",
        ar: "تم تجهيز رسالتك. يرجى تأكيد إرسال البريد الإلكتروني.",
        tr: "Mesajınız hazır. Lütfen e-postayı göndermeyi onaylayın.",
        zh: "您的留言已准备好。请确认发送邮件。"
      };
      cNote.textContent = okText[currentLang] || okText.en;

      cForm.reset();
    });
  }

  /* ---------- Scroll to hash on load ---------- */
  function scrollToHash() {
    var h = window.location.hash;
    if (h) {
      var el = document.querySelector(h);
      if (el) {
        el.scrollIntoView({ behavior: "instant", block: "start" });
      }
    }
  }
  if (document.readyState === "complete") {
    scrollToHash();
  } else {
    window.addEventListener("load", scrollToHash);
  }
})();
