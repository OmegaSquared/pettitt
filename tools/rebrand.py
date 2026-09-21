#!/usr/bin/env python3
"""
One-time rebrand pass applied to the React source copied from the original site.
Kept for reference / re-running if the source is refreshed:  python3 rebrand.py
"""
import re, os, glob

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")
files = glob.glob(ROOT + "/**/*.jsx", recursive=True) + glob.glob(ROOT + "/**/*.js", recursive=True) + [ROOT + "/index.css"]

GOLD, GOLD_RGB = "#F4C366", "244, 195, 102"
STEEL, STEEL_RGB = "#7C8BB0", "124, 139, 176"      # replaces the old blue accent on dark canvases
PALE = "#C9D3EA"                                   # replaces the old light blue

SUBS = [
    # ---- colors
    (re.compile(r"#E87A30", re.I), GOLD),
    (re.compile(r"#FF7800|#FF8A00|#FFA200|#FFB300|#FFBF00", re.I), GOLD),
    (re.compile(r"rgba?\(\s*232\s*,\s*122\s*,\s*48"), "rgba(" + GOLD_RGB),
    (re.compile(r"#255EA8", re.I), STEEL),
    (re.compile(r"rgba?\(\s*37\s*,\s*94\s*,\s*168"), "rgba(" + STEEL_RGB),
    (re.compile(r"#A9C5E6", re.I), PALE),
    (re.compile(r"#c45d1a|#173b6b", re.I), "#C9962E"),
    # ---- fonts
    (re.compile(r"'Outfit'"), "'Book Antiqua', 'Palatino Linotype', Palatino, 'Playfair Display', Georgia"),
    (re.compile(r"'Poppins'"), "'Raleway'"),
    (re.compile(r"family=Poppins[^']*"), "family=Raleway:wght@300;400;500;600;700;800&display=swap"),
    # ---- copy
    (re.compile(r"Omega Private Wealth consultant"), "Pettitt Wealth advisor"),
    (re.compile(r"Securities and advisory services offered through Omega Squared Asset Management\. Member FINRA/SIPC\."),
     "Securities offered through Cambridge Investment Research, Inc., a Broker/Dealer, member FINRA/SIPC. Advisory services offered through Cambridge Investment Research Advisers, Inc., a Registered Investment Adviser. Pettitt Wealth and Cambridge are not affiliated."),
    (re.compile(r"Omega Squared and Cambridge Investment Research are not affiliated\."), "Pettitt Wealth and Cambridge Investment Research are not affiliated."),
    (re.compile(r"proprietary Omega Squared cyclical filters\. Updated tracking available through the Private Wealth Portal\."), "our cyclical filters."),
    (re.compile(r"Omega Squared Edge"), "Pettitt Wealth Edge"),
    (re.compile(r"Omega Squared"), "Pettitt Wealth"),
    (re.compile(r"Omega²"), "Pettitt Wealth"),
    (re.compile(r"Omega2|Omega"), "Pettitt Wealth"),
    # ---- asset paths: absolute -> relative (GitHub Pages project sites live under /repo/)
    (re.compile(r'(["\'`])/assets/'), r"\1assets/"),
    # ---- old CTA labels
    (re.compile(r"Establish Your Edge"), "Schedule an Appointment"),
    (re.compile(r"Message the Desk"), "Email Eric"),
    (re.compile(r"Open Priority Channel →"), "Email Eric →"),
    (re.compile(r"Consult a Specialist"), "Schedule an Appointment"),
]

for f in files:
    s = open(f, encoding="utf-8").read()
    o = s
    for rx, rep in SUBS:
        s = rx.sub(rep, s)
    if s != o:
        open(f, "w", encoding="utf-8").write(s)
        print("rebranded", os.path.relpath(f, ROOT))

# ---- page-specific surgery
def edit(path, pairs):
    p = os.path.join(ROOT, path); s = open(p, encoding="utf-8").read()
    for a, b in pairs:
        assert a in s, (path, a[:60])
        s = s.replace(a, b)
    open(p, "w", encoding="utf-8").write(s)

edit("pages/AssetManagement.jsx", [
    ("import TickerTape from '../components/Visuals/TickerTape';\n", ""),
    ("import LeadMagnet from '../components/Visuals/LeadMagnet';\n", ""),
    ("import { Link } from 'react-router-dom';\n", ""),
    ("            {/* Show local ticker ONLY if no global position is set (legacy/guest support) */}\n            {!userProfile?.tickerPosition && <TickerTape position=\"fixed-bottom\" />}\n", ""),
    ("            <LeadMagnet theme={theme} />\n", ""),
    ("paddingTop: `${100 + (userProfile?.tickerPosition === 'fixed-top' ? 45 : 0)}px`", "paddingTop: '24px'"),
])
edit("pages/CompassPage.jsx", [
    ("import { Link } from 'react-router-dom';\n", ""),
    ("<Link \n                                to=\"/clock\" ", "<a \n                                href=\"clock.html\" "),
    ("<Link to=\"/clock\" ", "<a href=\"clock.html\" "),
])
# generic </Link> -> </a>
p = os.path.join(ROOT, "pages/CompassPage.jsx"); s = open(p).read().replace("</Link>", "</a>"); open(p, "w").write(s)

# Dark-mode palette in the big stylesheet -> Pettitt navy
edit("index.css", [
    ("    --bg-color: #0f172a;\n    --text-color: #f8f9fa;", "    --bg-color: #0F1F35;\n    --text-color: #f8f9fa;"),
    ("    --footer-bg: #030A16;", "    --footer-bg: #1C1F2A;"),
    ("    --cinematic-bg: #030a16;", "    --cinematic-bg: #0B1730;"),
])
print("done")
