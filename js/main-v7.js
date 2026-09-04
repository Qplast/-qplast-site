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
  /* Language priority: URL (path segment or ?lang=) > localStorage > default fa */
  var urlLang = null;
  var firstSeg = location.pathname.split("/").filter(Boolean)[0];
  if (LANGS.indexOf(firstSeg) !== -1) {
    urlLang = firstSeg;
  } else {
    var q = new URLSearchParams(location.search).get("lang");
    if (q && LANGS.indexOf(q) !== -1) urlLang = q;
  }
  var currentLang = urlLang || localStorage.getItem("qplast-lang") || "fa";
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
  var finderNeck = document.getElementById("finderNeck");
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
    },
    dropper: {
      family: { fa: "آرتا", en: "Arta", ar: "آرتا", tr: "Arta", zh: "Arta" },
      diameter: 36,
      cap: 49,
      material: "PET",
      dropper: true,
      bottles: [
        { vol: 30, h: 66, neck: 18, ref: "arya" },
        { vol: 50, h: 81, neck: 18, ref: "arya" },
        { vol: 80, h: 126.5, neck: 18, ref: "arya" },
        { vol: 30, h: 35, neck: 20, ref: "pars" },
        { vol: 50, h: 58.3, neck: 20, ref: "pars" },
        { vol: 80, h: 93.28, neck: 20, ref: "pars" }
      ]
    },
    sepanta: {
      family: { fa: "سپنتا", en: "Sepanta", ar: "سبنتا", tr: "Sepanta", zh: "塞潘塔" },
      airless: true,
      unverified: true,
      bottles: [
        { vol: 30 },
        { vol: 50 },
        { vol: 80 }
      ]
    }
  };

  function recText(lang, fam) {
    var NAMES = {
      fa: { hamta: "«همتا»", arya: "«آریا»", pars: "«پارس»", sepanta: "«سپنتا»", qoil: "«اسپری روغن Q»", dropper: "«آرتا»" },
      en: { hamta: "Hamta", arya: "Arya", pars: "Pars", sepanta: "Sepanta", qoil: "Q Oil Spray", dropper: "Arta" },
      ar: { hamta: "«همتا»", arya: "«آريا»", pars: "«بارس»", sepanta: "«سبنتا»", qoil: "«رذاذ الزيت Q»", dropper: "«آرتا»" },
      tr: { hamta: "Hamta", arya: "Arya", pars: "Pars", sepanta: "Sepanta", qoil: "Q Yağ Spreyi", dropper: "Arta" },
      zh: { hamta: "Hamta", arya: "Arya", pars: "Pars", sepanta: "Sepanta", qoil: "Q油雾喷头", dropper: "Arta" }
    };
    var names = NAMES[lang] || NAMES.en;

    if (fam === "none") {
      var noMatch = {
        fa: "محصولی با مشخصات انتخاب‌شده یافت نشد. فیلترها را تغییر دهید یا با ما تماس بگیرید.",
        en: "No collection matches your selection. Try adjusting filters or contact us.",
        ar: "لا توجد مجموعة تطابق اختيارك. غيّر الفلاتر أو تواصل معنا.",
        tr: "Seçiminizle eşleşen koleksiyon bulunamadı. Filtreleri değiştirin veya bize ulaşın.",
        zh: "没有匹配的系列。请调整筛选条件或联系我们。"
      };
      return noMatch[lang] || noMatch.en;
    }

    if (fam === "multi") {
      var multi = {
        fa: "از لیست بالا انتخاب‌ها را کامل کنید تا محصول مناسب نمایش داده شود.",
        en: "Complete your selections from the list above to show the right product.",
        ar: "أكمل اختياراتك من القائمة أعلاه لإظهار المنتج المناسب.",
        tr: "Doğru ürünü göstermek için yukarıdaki listeden seçimlerinizi tamamlayın.",
        zh: "请从上方列表完成选择，以显示合适的产品。"
      };
      return multi[lang] || multi.en;
    }

    var families = fam.split("+");
    var labeled = families.map(function (f) {
      return '<button type="button" class="finder__rec-link" style="display:inline;padding:0;margin:0;border:0;background:none;font:inherit;font-weight:800;color:var(--gold-dark);text-decoration:underline;cursor:pointer" data-family="' + f + '">' + (names[f] || f) + '</button>';
    });
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
    var s = String(n);
    if (currentLang === "fa") {
      s = s.replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".charAt(+d); })
           .replace(/\./g, "٫");
    } else if (currentLang === "ar") {
      s = s.replace(/[0-9]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".charAt(+d); })
           .replace(/\./g, "٫");
    }
    return s;
  };

  function buildBlueprint(fam, vol) {
    var f = SPECS_DATA[fam];
    if (!f || f.unverified) return "";
    var bottle = null;
    var list = fam === "dropper" ? bottlesFor(fam, currentNeck) : f.bottles;
    for (var i = 0; i < list.length; i++) {
      if (list[i].vol === vol) { bottle = list[i]; break; }
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
  var currentNeck = 24;

  /* filter bottles for the family — for dropper, only the selected neck's set */
  function bottlesFor(fam, neck) {
    var f = SPECS_DATA[fam];
    var list = f.bottles;
    if (fam === "dropper") {
      list = list.filter(function (b) { return b.neck === neck; });
    }
    return list;
  }

  function renderSpecs() {
    if (!specsPanel || specsPanel.hidden) return;
    var f = SPECS_DATA[currentFamily];
    var volBtns = document.getElementById("specsVolumes");
    var drawEl = document.getElementById("specsDrawing");
    var capEl = document.getElementById("specsCaption");
    var photoEl = document.getElementById("specsPhoto");

    var famName = f.family[currentLang] || f.family.en;
    document.getElementById("specsFamily").textContent = famName;

    /* product photo — dropper switches image by neck */
    if (photoEl) {
      var imgMap = {
        hamta: "../assets/hamta-mist-24.jpg",
        arya: "../assets/arya-white.jpg",
        pars: "../assets/pars-product.png",
        qoil: "../assets/qoil-product.jpg",
        sepanta: "../assets/sepanta-product.jpg"
      };
      var neckVolMap = {
        "18": { "30": "../assets/arya-30.jpg" }
      };
      var src;
      if (currentFamily === "dropper") {
        src = currentNeck === 18 ? "../assets/dropper-18.png" : "../assets/dropper-product.png";
      } else {
        var activeNeck = String(f.bottles[0].neck || "");
        var perVol = neckVolMap[activeNeck] && neckVolMap[activeNeck][String(currentVol)];
        src = perVol || imgMap[currentFamily];
      }
      photoEl.innerHTML = src ? '<img src="' + src + '" alt="' + famName + '" loading="lazy"/>' : "";
    }

    /* volume buttons — respect chosen neck for dropper */
    var famBottles = bottlesFor(currentFamily, currentNeck);
    volBtns.innerHTML = "";
    var volSeen = {};
    famBottles.forEach(function (b) {
      if (volSeen[b.vol]) return;
      volSeen[b.vol] = true;
      var bEl = document.createElement("button");
      bEl.type = "button";
      bEl.className = "specs__vol" + (b.vol === currentVol ? " active" : "");
      bEl.textContent = b.vol + " ml";
      bEl.addEventListener("click", function (e) {
        e.stopPropagation();
        currentVol = b.vol;
        renderSpecs();
      });
      volBtns.appendChild(bEl);
    });

    /* drawing or unverified-specs message */
    var SPEC_NOTE = {
      fa: "مشخصات فنی این مدل در مرجع فعلی ثبت نشده است.",
      en: "Technical specifications for this model are not recorded in the current reference.",
      ar: "المواصفات الفنية لهذا الموديل غير مسجلة في المرجع الحالي.",
      tr: "Bu modelin teknik özellikleri mevcut referansta kayıtlı değildir.",
      zh: "该型号的技术规格未记录在当前参考文件中。"
    };
    if (f.unverified) {
      drawEl.innerHTML = '<p style="text-align:center;color:var(--ink-soft);padding:40px 10px;font-size:14px">' + (SPEC_NOTE[currentLang] || SPEC_NOTE.en) + '</p>';
      capEl.innerHTML = "";
    } else {
      /* drawing */
      drawEl.innerHTML = buildBlueprint(currentFamily, currentVol);

      /* caption */
      var bottle = null;
      for (var i = 0; i < famBottles.length; i++) {
        if (famBottles[i].vol === currentVol) { bottle = famBottles[i]; break; }
      }
      var caps = [];
      caps.push({ l: "Bottle", v: fmt(bottle.h) + " mm" });
      caps.push({ l: f.airless ? "NeckFixed" : "Neck", v: f.airless ? "•" : fmt(bottle.neck || 24) + " mm" });
      caps.push({ l: f.cap ? "Cap" : "Pump", v: fmt(f.cap || f.pump) + " mm" });
      caps.push({ l: "Straw", v: fmt(bottle.h) + " mm" });
      caps.push({ l: "Body", v: f.material });
      var DIM_LABELS = {
        fa: { Bottle: "ارتفاع بطری", Neck: "دهانه", NeckFixed: "دهانهٔ ثابت", Pump: "طول پمپ", Cap: "کاپ", Straw: "نی", Body: "جنس بدنه" },
        en: { Bottle: "Bottle height", Neck: "Neck", NeckFixed: "Fixed neck", Pump: "Pump length", Cap: "Cap", Straw: "Straw", Body: "Body material" },
        ar: { Bottle: "ارتفاع الزجاجة", Neck: "العنق", NeckFixed: "عنق ثابت", Pump: "طول المضخة", Cap: "الغطاء", Straw: "المصاصة", Body: "مادة الجسم" },
        tr: { Bottle: "Şişe yüksekliği", Neck: "Boyun", NeckFixed: "Sabit boyun", Pump: "Pompa uzunluğu", Cap: "Kapak", Straw: "Pipet", Body: "Gövde malzemesi" },
        zh: { Bottle: "瓶高", Neck: "口径", NeckFixed: "固定口径", Pump: "泵长", Cap: "瓶盖", Straw: "吸管", Body: "主体材质" }
      };
      var L = DIM_LABELS[currentLang] || DIM_LABELS.en;
      capEl.innerHTML = caps.map(function (c) {
        return '<span class="specs__cap-item">' + L[c.l] + ': <b>' + c.v + '</b></span>';
      }).join("");
    }
  }

  /* neck → allowed volumes mapping */
  var NECK_VOLS = {
    "24": ["90", "100", "140", "170", "220"],
    "18": ["30", "50", "80"],
    "20": ["30", "50", "80"]
  };

  function updateFinder(noAuto) {
    if (!finderRec || !beautyCards) return;
    var type = "all";
    var vol = "all";
    var neck = "all";
    var typeActive = finderType && finderType.querySelector(".finder__opt.active");
    var volActive = finderVol && finderVol.querySelector(".finder__opt.active");
    var neckActive = finderNeck && finderNeck.querySelector(".finder__opt.active");
    if (typeActive) type = typeActive.getAttribute("data-type");
    if (volActive) vol = volActive.getAttribute("data-vol");
    if (neckActive) neck = neckActive.getAttribute("data-neck");

    /* --- neck → volume constraint --- */
    if (finderVol) {
      var allowedVols = NECK_VOLS[neck] || null;
      var volOpts = finderVol.querySelectorAll(".finder__opt");
      var activeStillValid = false;
      volOpts.forEach(function (opt) {
        var v = opt.getAttribute("data-vol");
        if (v === "all") { opt.classList.remove("disabled"); opt.removeAttribute("disabled"); return; }
        var valid = !allowedVols || allowedVols.indexOf(v) !== -1;
        opt.classList.toggle("disabled", !valid);
        if (valid) { opt.removeAttribute("disabled"); } else { opt.setAttribute("disabled", ""); }
        if (valid && opt.classList.contains("active")) activeStillValid = true;
      });
      if (!activeStillValid) {
        var fallback = finderVol.querySelector('.finder__opt[data-vol="all"]');
        if (fallback) {
          volOpts.forEach(function (o) { o.classList.remove("active"); });
          fallback.classList.add("active");
          vol = "all";
        }
      }
      document.querySelectorAll(".finder__dropSel").forEach(function (sel) {
        var menu = sel.closest(".finder__drop").querySelector(".finder__menu");
        if (!menu || menu !== finderVol) return;
        var act = menu.querySelector(".finder__opt.active");
        if (act) sel.innerHTML = act.innerHTML;
      });
    }

    var cards = beautyCards.querySelectorAll(".card[data-family]");
    var dropperNeck = null;
    var shown = [];
    cards.forEach(function (card) {
      var fam = card.getAttribute("data-family");
      var types = (card.getAttribute("data-types") || "").split(" ");
      var cardNeck = (card.getAttribute("data-neck") || "").split(" ");
      var cardVols = (card.getAttribute("data-vols") || "").split(" ");
      var volHit = vol === "all" || cardVols.indexOf(vol) !== -1;
      var typeHit = type === "all" || types.indexOf(type) !== -1;
      var hasNeck = cardNeck.length && cardNeck[0] !== "";
      var neckHit = (type === "airless") ? true : (neck === "all" || (hasNeck && cardNeck.indexOf(neck) !== -1));
      var match = typeHit && volHit && neckHit;
      card.style.display = match ? "" : "none";
      if (match) shown.push(fam);
      if (fam === "dropper" && neck !== "all" && cardNeck.indexOf(neck) !== -1) dropperNeck = neck;
    });

    var dropperImg = beautyCards.querySelector(".dropper-card img");
    if (dropperImg) {
      if (dropperNeck === "18" && dropperImg.getAttribute("data-neck18")) {
        dropperImg.src = dropperImg.getAttribute("data-neck18");
      } else if (dropperImg.getAttribute("data-neck20")) {
        dropperImg.src = dropperImg.getAttribute("data-neck20");
      } else {
        dropperImg.src = "../assets/dropper-product.png";
      }
    }
    var msg = recText(currentLang, shown.length > 1 ? "multi" : (shown.length ? shown.join("+") : "none"));
    finderRec.innerHTML = msg;

    /* when the customer narrows down to a single product, show it directly */
    if (shown.length === 1 && (type !== "all" || vol !== "all" || neck !== "all") && !noAuto) {
      var solo = shown[0];
      if (SPECS_DATA[solo]) {
        if (specsPanel && !specsPanel.hidden && currentFamily && currentFamily !== solo) hideSpecs();
        showSpecs(solo);
      }
    }

    document.querySelectorAll(".finder__dropSel").forEach(function (sel) {
      var menu = sel.closest(".finder__drop").querySelector(".finder__menu");
      if (!menu) return;
      var act = menu.querySelector(".finder__opt.active");
      if (act) sel.innerHTML = act.innerHTML;
    });
  }

  function hideSpecs() {
    var p = document.getElementById("specsPanel");
    if (p) p.hidden = true;
  }

  function showSpecs(fam) {
    if (!SPECS_DATA[fam]) return;
    var specsPanel = document.getElementById("specsPanel");
    if (!specsPanel) return;
    currentFamily = fam;

    /* read current neck selection (dropper has two necks) */
    var selNeck = null;
    if (finderNeck) {
      var nActive = finderNeck.querySelector(".finder__opt.active");
      if (nActive) {
        var nVal = nActive.getAttribute("data-neck");
        if (nVal !== "all") selNeck = Number(nVal);
      }
    }
    if (fam === "dropper") currentNeck = (selNeck === 18 || selNeck === 20) ? selNeck : 18;
    else currentNeck = null;

    var vols = bottlesFor(fam, currentNeck);
    var matches = vols.filter(function (b) { return b.vol === currentVol; });
    if (!matches.length) currentVol = vols[vols.length - 1].vol;
    specsPanel.hidden = false;
    specsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    renderSpecs();
  }

  function closeFinderMenus(except) {
    document.querySelectorAll(".finder__drop .finder__menu").forEach(function (m) {
      if (m !== except) m.classList.remove("open");
    });
    document.querySelectorAll(".finder__dropBtn").forEach(function (b) {
      b.setAttribute("aria-expanded", "false");
    });
  }

  var dropBtns = document.querySelectorAll(".finder__dropBtn");
  if (dropBtns.length) {
    dropBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var drop = btn.closest(".finder__drop");
        if (!drop) return;
        var menu = drop.querySelector(".finder__menu");
        if (!menu) return;
        var willOpen = !menu.classList.contains("open");
        closeFinderMenus(menu);
        if (willOpen) {
          menu.classList.add("open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".finder__drop")) closeFinderMenus();
  });

  function bindFinderMenu(menu, cb) {
    if (!menu) return;
    menu.addEventListener("click", function (e) {
      var opt = e.target.closest(".finder__opt");
      if (!opt) return;
      e.stopPropagation();
      menu.querySelectorAll(".finder__opt").forEach(function (c) {
        c.classList.remove("active");
      });
      opt.classList.add("active");
      var specsOpen = specsPanel && !specsPanel.hidden;
      var v = opt.getAttribute("data-vol");
      if (menu === finderVol && v !== "all" && /^\d+$/.test(v)) currentVol = Number(v);
      /* changing family filters while specs open = user starts a new search; close old specs */
      var suppress = false;
      if (menu === finderType || menu === finderNeck) {
        if (specsOpen) {
          hideSpecs();
          suppress = true;
        }
      } else if (!specsOpen) {
        hideSpecs();
      }
      closeFinderMenus();
      cb(opt, suppress);
      if (specsOpen && menu === finderVol && v !== "all" && /^\d+$/.test(v)) renderSpecs();
    });
  }
  bindFinderMenu(finderType, function (opt, suppress) { updateFinder(suppress); });
  bindFinderMenu(finderVol, function (opt, suppress) { updateFinder(suppress); });
  bindFinderMenu(finderNeck, function (opt, suppress) { updateFinder(suppress); });

  if (finderRec) {
    finderRec.addEventListener("click", function (e) {
      var link = e.target.closest(".finder__rec-link");
      if (!link) return;
      e.stopPropagation();
      showSpecs(link.getAttribute("data-family"));
    });
  }

  if (beautyCards) {
    beautyCards.addEventListener("click", function (e) {
      var card = e.target.closest(".card[data-family]");
      if (!card) return;
      e.stopPropagation();
      showSpecs(card.getAttribute("data-family"));
    });
  }

  function bindSpecsClose() {
    var panel = document.getElementById("specsPanel");
    var closeBtn = document.getElementById("specsClose");
    if (closeBtn && panel) {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        hideSpecs();
      });
      document.addEventListener("click", function (e) {
        if (!panel.hidden && !panel.contains(e.target)) hideSpecs();
      });
    }
  }
  bindSpecsClose();
  updateFinder();

  var LOCALE_PREFIXES = ["pages", "en", "ar", "tr", "zh"];
  var SEND_ENDPOINT = (function(){ var p = (window.location.pathname.split("/").filter(Boolean)); return p.length > 1 && LOCALE_PREFIXES.indexOf(p[0].toLowerCase()) > -1 ? "../mail/send-mail.php" : "mail/send-mail.php"; })();

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

      var familyLabel = family === "hamta" ? "Hamta (Neck 24)" : family === "arya" ? "Arya (Neck 18)" : family === "pars" ? "Pars (Neck 20)" : family === "sepanta" ? "Sepanta (Airless)" : family === "dropper" ? "Arta" : family === "qoil" ? "Q Oil Spray" : family;
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

      var okText = {
        fa: "درخواست شما با موفقیت ارسال شد. به‌زودی با شما تماس خواهیم گرفت.",
        en: "Your request has been sent successfully. We will get back to you soon.",
        ar: "تم إرسال طلبك بنجاح. سنتواصل معك قريبًا.",
        tr: "Talebiniz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.",
        zh: "您的请求已成功发送。我们会尽快与您联系。"
      };
      var errText = {
        fa: "ارسال ناموفق بود. لطفاً دوباره تلاش کنید یا از واتساپ استفاده کنید.",
        en: "Sending failed. Please try again or use WhatsApp.",
        ar: "فشل الإرسال. يرجى المحاولة مرة أخرى أو استخدام واتساب.",
        tr: "Gönderim başarısız oldu. Lütfen tekrar deneyin veya WhatsApp kullanın.",
        zh: "发送失败。请重试或使用WhatsApp。"
      };

      note.hidden = false;
      note.textContent = "";

      var payload = {
        type: "inquiry",
        website: (document.getElementById("fWebsite") ? document.getElementById("fWebsite").value : ""),
        name: name,
        company: company,
        email: email,
        phone: phone,
        family: family,
        volume: volume,
        quantity: qty,
        message: msg
      };

      fetch(SEND_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (res && res.ok) {
            note.className = "form__note success";
            note.textContent = (okText[currentLang] || okText.en);
            form.reset();
            if (typeof gtag === "function") {
              gtag("event", "generate_lead", { form_type: "inquiry", form_location: currentLang });
            }
          } else {
            var waUrl = "https://wa.me/989909702100?text=" + encodeURIComponent(bodyLines(lines));
            note.className = "form__note error";
            var err = (errText[currentLang] || errText.en);
            note.textContent = err + " ";
            var waLink = document.createElement("a");
            waLink.href = waUrl;
            waLink.target = "_blank";
            waLink.textContent = "WhatsApp";
            note.appendChild(waLink);
          }
        })
        .catch(function () {
          var waUrl = "https://wa.me/989909702100?text=" + encodeURIComponent(bodyLines(lines));
          note.className = "form__note error";
          note.textContent = (errText[currentLang] || errText.en) + " ";
          var waLink = document.createElement("a");
          waLink.href = waUrl;
          waLink.target = "_blank";
          waLink.textContent = "WhatsApp";
          note.appendChild(waLink);
        });
    });
  }

  function bodyLines(arr) {
    return arr.join("\n");
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

      var okText = {
        fa: "پیام شما با موفقیت ارسال شد. از تماس شما سپاسگزاریم.",
        en: "Your message has been sent successfully. Thank you for contacting us.",
        ar: "تم إرسال رسالتك بنجاح. شكرًا لتواصلك معنا.",
        tr: "Mesajınız başarıyla gönderildi. Bize ulaştığınız için teşekkürler.",
        zh: "您的留言已成功发送。感谢您联系我们。"
      };
      var errText = {
        fa: "ارسال ناموفق بود. لطفاً دوباره تلاش کنید یا از واتساپ استفاده کنید.",
        en: "Sending failed. Please try again or use WhatsApp.",
        ar: "فشل الإرسال. يرجى المحاولة مرة أخرى أو استخدام واتساب.",
        tr: "Gönderim başarısız oldu. Lütfen tekrar deneyin veya WhatsApp kullanın.",
        zh: "发送失败。请重试或使用WhatsApp。"
      };

      cNote.hidden = false;
      cNote.textContent = "";

      var payload = {
        type: "contact",
        website: (document.getElementById("cWebsite") ? document.getElementById("cWebsite").value : ""),
        name: name,
        email: email,
        subject: subject,
        message: msg
      };

      fetch(SEND_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (res && res.ok) {
            cNote.className = "form__note success";
            cNote.textContent = (okText[currentLang] || okText.en);
            cForm.reset();
            if (typeof gtag === "function") {
              gtag("event", "generate_lead", { form_type: "contact", form_location: currentLang });
            }
          } else {
            var waUrl = "https://wa.me/989909702100?text=" + encodeURIComponent(bodyLines(lines));
            cNote.className = "form__note error";
            cNote.textContent = (errText[currentLang] || errText.en) + " ";
            var wl = document.createElement("a");
            wl.href = waUrl;
            wl.target = "_blank";
            wl.textContent = "WhatsApp";
            cNote.appendChild(wl);
          }
        })
        .catch(function () {
          var waUrl = "https://wa.me/989909702100?text=" + encodeURIComponent(bodyLines(lines));
          cNote.className = "form__note error";
          cNote.textContent = (errText[currentLang] || errText.en) + " ";
          var wl = document.createElement("a");
          wl.href = waUrl;
          wl.target = "_blank";
          wl.textContent = "WhatsApp";
          cNote.appendChild(wl);
        });
    });
  }

  /* ---------- Reduced motion for hero video ---------- */
  var heroVideo = document.querySelector(".hero__video");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  function applyMotionPreference() {
    if (!heroVideo) return;
    if (reduceMotion.matches) {
      heroVideo.pause();
      heroVideo.removeAttribute("autoplay");
    } else {
      heroVideo.play();
    }
  }
  applyMotionPreference();
  reduceMotion.addEventListener("change", applyMotionPreference);

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

  /* ---------- Lightbox gallery ---------- */
  (function initGallery() {
    document.querySelectorAll(".card__media").forEach(function (media) {
      var hint = media.querySelector(".gallery-hint");
      if (media.classList.contains("gallery-trigger")) {
        media.classList.remove("gallery-trigger");
        var g = media.getAttribute("data-gallery");
        media.removeAttribute("data-gallery");
        if (hint && g) {
          hint.setAttribute("data-gallery", g);
          hint.classList.add("gallery-trigger");
        }
      }
    });
    var GALLERIES = {
      hamta: [
        { src: "../assets/hamta-product.jpg", caption: "Hamta" },
        { src: "../assets/hamta-gallery-dzYNo.jpg", caption: "Hamta" },
        { src: "../assets/hamta-gallery-media.jpg2K202608221948.jpeg", caption: "Hamta" },
        { src: "../assets/hamta-gallery-media.jpg2K202608221949.jpeg", caption: "Hamta" },
        { src: "../assets/hamta-gallery-media.jpg2K202608221956.jpeg", caption: "Hamta" },
        { src: "../assets/hamta-gallery-media.jpg2026082220091.jpeg", caption: "Hamta" },
        { src: "../assets/hamta-gallery-media.jpg2026082220092.jpeg", caption: "Hamta" }
      ]
    };

    var lightbox = document.getElementById("lightbox");
    if (!lightbox) return;
    var img = document.getElementById("lightboxImg");
    var caption = document.getElementById("lightboxCaption");
    var items = [];
    var index = 0;

    function open(itemsArr, startIndex) {
      items = itemsArr;
      index = startIndex;
      render();
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    }
    function close() {
      lightbox.hidden = true;
      document.body.style.overflow = "";
    }
    function render() {
      if (!items.length) return;
      img.src = items[index].src;
      caption.textContent = items[index].caption;
    }
    function next() { index = (index + 1) % items.length; render(); }
    function prev() { index = (index - 1 + items.length) % items.length; render(); }

    document.querySelectorAll(".gallery-trigger").forEach(function (trigger) {
      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var g = trigger.getAttribute("data-gallery");
        var arr = GALLERIES[g];
        if (!arr || !arr.length) return;
        open(arr, 0);
      });
    });

    lightbox.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", close);
    });
    var nb = lightbox.querySelector("[data-next]");
    var pb = lightbox.querySelector("[data-prev]");
    if (nb) nb.addEventListener("click", next);
    if (pb) pb.addEventListener("click", prev);

    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });
  })();
})();
