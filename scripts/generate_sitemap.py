#!/usr/bin/env python3
"""One-off helper used to expand sitemap.xml to include all 5 language
variants of each page (previously only the fa URL was listed, with the
other languages only reachable via hreflang inside the fa page). Not
run by CI — this is a manual maintenance script."""

LANGS = ["fa", "en", "ar", "tr", "zh"]

PAGES = [
    # kind, fa_path, changefreq, priority, lastmod
    ("index", "index.html", "weekly", "1.0", "2026-09-03"),
    ("products", "pages/products.html", "weekly", "0.9", "2026-08-17"),
    ("about", "pages/about.html", "monthly", "0.8", "2026-08-17"),
    ("inquiry", "pages/inquiry.html", "monthly", "0.8", "2026-08-17"),
    ("quality", "pages/quality.html", "monthly", "0.7", "2026-08-17"),
    ("contact", "pages/contact.html", "monthly", "0.6", "2026-08-17"),
    ("news", "pages/news.html", "weekly", "0.6", "2026-09-03"),
]


def lang_path(fa_path, lang):
    if lang == "fa":
        return fa_path
    # fa paths are "index.html" or "pages/xxx.html" -> becomes "<lang>/xxx.html"
    fname = fa_path.split("/")[-1]
    return f"{lang}/{fname}"


lines = []
lines.append('<?xml version="1.0" encoding="UTF-8"?>')
lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
lines.append('        xmlns:xhtml="http://www.w3.org/1999/xhtml">')
lines.append("")

for kind, fa_path, changefreq, priority, lastmod in PAGES:
    alt_links = "\n".join(
        f'    <xhtml:link rel="alternate" hreflang="{lang}" href="https://qplast.ir/{lang_path(fa_path, lang)}" />'
        for lang in LANGS
    )
    x_default = f'    <xhtml:link rel="alternate" hreflang="x-default" href="https://qplast.ir/{fa_path}" />'

    for lang in LANGS:
        loc = lang_path(fa_path, lang)
        lines.append(f"  <!-- {kind} ({lang}) -->")
        lines.append("  <url>")
        lines.append(f"    <loc>https://qplast.ir/{loc}</loc>")
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
        lines.append(f"    <changefreq>{changefreq}</changefreq>")
        # non-fa priority slightly lower, fa stays canonical-priority
        prio = priority if lang == "fa" else f"{max(0.1, float(priority) - 0.1):.1f}"
        lines.append(f"    <priority>{prio}</priority>")
        lines.append(alt_links)
        lines.append(x_default)
        lines.append("  </url>")
        lines.append("")

lines.append("</urlset>")

with open("sitemap.xml", "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

print("sitemap.xml regenerated:", len(PAGES) * len(LANGS), "urls")
