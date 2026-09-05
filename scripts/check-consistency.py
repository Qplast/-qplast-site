#!/usr/bin/env python3
"""
Q Plast — pre-deploy consistency guard.

Runs in GitHub Actions before every deploy. It does NOT rebuild or change
any file — it only checks that the things which have to stay identical
across all 35 pages (main.js version, style.css version, hreflang links,
basic HTML structure) really are identical, and fails the deploy loudly
with a plain-English explanation if not.

This exists because the site has no shared template: the header, footer,
script tags and hreflang blocks are copy-pasted into every page by hand.
Every bug found in review so far (stale main-v5.js on 30 pages while
products.html moved to main-v8.js, mismatched CSS version, broken
hreflang) was exactly this kind of silent drift. This script turns that
class of bug into a failed, clearly-explained GitHub Actions run instead
of a silent live bug someone has to notice by accident.
"""

import glob
import json
import re
import sys

ROOT = "."

LANGS = ["fa", "en", "ar", "tr", "zh"]

# Maps each of the 7 page "kinds" to its file path per language.
PAGE_FILES = {
    "index":    {"fa": "index.html",          "en": "en/index.html",    "ar": "ar/index.html",    "tr": "tr/index.html",    "zh": "zh/index.html"},
    "about":    {"fa": "pages/about.html",     "en": "en/about.html",    "ar": "ar/about.html",    "tr": "tr/about.html",    "zh": "zh/about.html"},
    "contact":  {"fa": "pages/contact.html",   "en": "en/contact.html",  "ar": "ar/contact.html",  "tr": "tr/contact.html",  "zh": "zh/contact.html"},
    "inquiry":  {"fa": "pages/inquiry.html",   "en": "en/inquiry.html",  "ar": "ar/inquiry.html",  "tr": "tr/inquiry.html",  "zh": "zh/inquiry.html"},
    "news":     {"fa": "pages/news.html",      "en": "en/news.html",     "ar": "ar/news.html",     "tr": "tr/news.html",     "zh": "zh/news.html"},
    "products": {"fa": "pages/products.html",  "en": "en/products.html", "ar": "ar/products.html", "tr": "tr/products.html", "zh": "zh/products.html"},
    "quality":  {"fa": "pages/quality.html",   "en": "en/quality.html",  "ar": "ar/quality.html",  "tr": "tr/quality.html",  "zh": "zh/quality.html"},
}

ALL_FILES = sorted({f for kinds in PAGE_FILES.values() for f in kinds.values()})

errors = []


def fail(msg):
    errors.append(msg)


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


# ---------- 1. every page must reference the exact same main.js / style.css version ----------
js_versions = {}
css_versions = {}
stale_js_refs = []

for f in ALL_FILES:
    content = read(f)

    m = re.search(r'main\.js(\?v=[A-Za-z0-9_.-]+)?', content)
    js_versions[f] = m.group(0) if m else None

    m = re.search(r'style\.css(\?v=[A-Za-z0-9_.-]+)?', content)
    css_versions[f] = m.group(0) if m else None

    if re.search(r'main-v\d+\.js', content):
        stale_js_refs.append(f)

def report_outliers(versions, label):
    """versions: {file: value}. Reports only the files that disagree with the majority value."""
    present = {f: v for f, v in versions.items() if v is not None}
    if not present:
        return
    from collections import Counter
    counts = Counter(present.values())
    majority_value, _ = counts.most_common(1)[0]
    outliers = {f: v for f, v in present.items() if v != majority_value}
    if outliers:
        fail(
            f"صفحات مختلف به نسخه‌های متفاوتی از {label} وصل‌اند (باید همه دقیقاً یکی باشند؛ اکثریت صفحات روی «{majority_value}» هستند، این‌ها فرق دارند): "
            + ", ".join(f"{f} -> {v}" for f, v in sorted(outliers.items()))
        )

report_outliers(js_versions, "main.js")
missing_js = [f for f, v in js_versions.items() if v is None]
if missing_js:
    fail("این صفحات اصلاً به main.js وصل نیستند: " + ", ".join(missing_js))

report_outliers(css_versions, "style.css")

if stale_js_refs:
    fail(
        "این صفحات هنوز به یک فایل جاوااسکریپت قدیمی/شماره‌دار (main-vN.js) اشاره می‌کنند، نه main.js: "
        + ", ".join(stale_js_refs)
    )

# ---------- 1b. the "specs photo" filter-leak bug guard ----------
# This exact bug (the technical-specs photo silently reusing whatever
# "Product type" filter was left selected from an earlier, unrelated
# search — instead of the reason THIS specs view was opened) has already
# been reintroduced twice while extending the photo feature. If someone
# removes the specsPhotoUseFilter guard again, catch it here instead of
# a customer noticing a wrong product photo a third time.
main_js = read("js/main.js")
if "specsPhotoUseFilter" not in main_js:
    fail(
        "js/main.js: محافظ specsPhotoUseFilter از کد عکس مشخصات فنی حذف شده. "
        "این یعنی احتمالاً همان باگ «عکس اشتباه محصول» (که قبلاً دوبار پیش آمده) دوباره برگشته — "
        "قبل از دیپلوی این را بررسی کنید."
    )

# ---------- 2. every page: exactly one DOCTYPE / head / body, valid JSON-LD ----------
for f in ALL_FILES:
    content = read(f)

    if not content.lstrip().startswith("<!DOCTYPE html>"):
        fail(f"{f}: با <!DOCTYPE html> شروع نمی‌شود")

    if len(re.findall(r'<head[ >]', content)) != 1 or content.count("</head>") != 1:
        fail(f"{f}: تعداد تگ head درست نیست")

    if len(re.findall(r'<body[ >]', content)) != 1:
        fail(f"{f}: تعداد تگ body درست نیست")

    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', content, re.S):
        try:
            json.loads(m.group(1))
        except Exception as e:
            fail(f"{f}: یکی از بلوک‌های JSON-LD نامعتبر است ({e})")

# ---------- 3. hreflang reciprocity per page-kind ----------
HREFLANG_RE = re.compile(r'hreflang="([\w-]+)"\s+href="([^"]+)"')

for kind, files in PAGE_FILES.items():
    expected = {}
    for lang, path in files.items():
        content = read(path)
        tags = dict(HREFLANG_RE.findall(content))
        present_langs = set(tags.keys()) - {"x-default"}
        if present_langs != set(LANGS):
            fail(
                f"{path} (نسخه‌ی {lang} صفحه‌ی {kind}): بلوک hreflang همه‌ی ۵ زبان را ندارد "
                f"(موجود: {sorted(present_langs)})"
            )
            continue
        expected[lang] = tags

    # every language's hreflang block must point to the SAME set of URLs for this page-kind
    url_sets = {lang: frozenset(tags.items()) for lang, tags in expected.items()}
    if len(set(url_sets.values())) > 1:
        fail(
            f"صفحه‌ی {kind}: بلوک hreflang در نسخه‌های زبانی مختلف با هم یکی نیست (باید همه دقیقاً همان ۵+۱ آدرس را نشان بدهند): "
            + json.dumps({lang: dict(tags) for lang, tags in expected.items()}, ensure_ascii=False)
        )

# ---------- report ----------
if errors:
    print("::error::بررسی هماهنگی سایت قبل از دیپلوی شکست خورد — دیپلوی متوقف شد.\n")
    for i, e in enumerate(errors, 1):
        print(f"{i}. {e}\n")
    print(f"جمع: {len(errors)} مشکل. لطفاً این‌ها را اصلاح کنید و دوباره push کنید.")
    sys.exit(1)

print(f"بررسی هماهنگی سایت: {len(ALL_FILES)} صفحه چک شد، مشکلی پیدا نشد.")
sys.exit(0)
