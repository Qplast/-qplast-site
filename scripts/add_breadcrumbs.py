#!/usr/bin/env python3
"""One-off helper: adds breadcrumb schema to about/contact/products/news
pages across all 5 languages (inquiry & quality already had it). Also
fixes the page-level JSON-LD "url" field on non-fa pages, which was
pointing at the fa URL instead of the page's own localized URL.
Not run by CI — manual maintenance script."""

import re

LANGS = ["fa", "en", "ar", "tr", "zh"]

HOME_NAME = {"fa": "خانه", "en": "Home", "ar": "الرئيسية", "tr": "Ana Sayfa", "zh": "首页"}

PAGES = {
    "about":    {"fname": "about.html",    "name": {"fa": "درباره ما", "en": "About", "ar": "من نحن", "tr": "Hakkımızda", "zh": "关于我们"}},
    "contact":  {"fname": "contact.html",  "name": {"fa": "تماس", "en": "Contact", "ar": "اتصل بنا", "tr": "İletişim", "zh": "联系我们"}},
    "products": {"fname": "products.html", "name": {"fa": "محصولات", "en": "Products", "ar": "المنتجات", "tr": "Ürünler", "zh": "产品"}},
    "news":     {"fname": "news.html",     "name": {"fa": "اخبار", "en": "News", "ar": "الأخبار", "tr": "Haberler", "zh": "新闻"}},
}


def file_path(fname, lang):
    return f"pages/{fname}" if lang == "fa" else f"{lang}/{fname}"


def home_url(lang):
    return "https://qplast.ir/index.html" if lang == "fa" else f"https://qplast.ir/{lang}/index.html"


def page_url(fname, lang):
    return f"https://qplast.ir/{file_path(fname, lang)}"


changed = []

for kind, info in PAGES.items():
    fname = info["fname"]
    for lang in LANGS:
        path = file_path(fname, lang)
        with open(path, encoding="utf-8") as fh:
            content = fh.read()

        correct_url = page_url(fname, lang)
        wrong_url = page_url(fname, "fa")

        # Only touch the FIRST top-level "url" line in the JSON-LD block
        # (products.html has nested "url" fields per product further down).
        m = re.search(r'(    "url": ")([^"]+)(",\n)', content)
        if not m:
            print(f"SKIP (no url line found): {path}")
            continue

        # Fix wrong url (only applies to non-fa pages that wrongly pointed at fa)
        if lang != "fa" and m.group(2) == wrong_url:
            content = content[:m.start(2)] + correct_url + content[m.end(2):]
            m = re.search(r'(    "url": ")([^"]+)(",\n)', content)  # re-match after edit

        if '"breadcrumb"' in content.split(m.group(0))[0][-50:]:
            pass  # unlikely

        # Skip if this page already has a breadcrumb (idempotent re-runs)
        # Look only in the header region (first ld+json block) to be safe.
        head_end = content.find("</head>")
        head_region = content[:head_end]
        if '"breadcrumb"' in head_region:
            print(f"SKIP (already has breadcrumb): {path}")
            continue

        breadcrumb_block = (
            '    "breadcrumb": {\n'
            '      "@type": "BreadcrumbList",\n'
            '      "itemListElement": [\n'
            f'        {{"@type": "ListItem", "position": 1, "name": "{HOME_NAME[lang]}", "item": "{home_url(lang)}"}},\n'
            f'        {{"@type": "ListItem", "position": 2, "name": "{info["name"][lang]}", "item": "{correct_url}"}}\n'
            '      ]\n'
            '    },\n'
        )

        insert_at = m.end()
        content = content[:insert_at] + breadcrumb_block + content[insert_at:]

        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)
        changed.append(path)

print(f"\nUpdated {len(changed)} files:")
for p in changed:
    print(" -", p)
