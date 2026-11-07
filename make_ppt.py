"""
Rental Vault — Presentation Generator v7 (27 Slides for 6 Speakers)
Run: python make_ppt.py
"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

# === COLORS ===
BG        = RGBColor(0x08, 0x10, 0x20)
BG2       = RGBColor(0x0E, 0x1A, 0x30)
INDIGO    = RGBColor(0x18, 0x2A, 0x48)
PANEL     = RGBColor(0x1E, 0x32, 0x54)
PANEL_L   = RGBColor(0x28, 0x40, 0x68)
AMBER     = RGBColor(0xE3, 0xA2, 0x3A)
AMBER_L   = RGBColor(0xF5, 0xD2, 0x8A)
WHITE     = RGBColor(0xFF, 0xFF, 0xFF)
GREY      = RGBColor(0x8A, 0x94, 0xA6)
GREY_L    = RGBColor(0xC6, 0xCD, 0xDA)
GREEN     = RGBColor(0x42, 0xA8, 0x82)
RED       = RGBColor(0xD1, 0x5C, 0x45)
TEAL      = RGBColor(0x4A, 0xA8, 0xC0)

SERIF = 'Georgia'
SANS  = 'Calibri'
L     = 0.85
R     = 12.5
W     = R - L

CONTENT_TOP    = 2.85
PANEL_H        = 3.65
CONTENT_BOTTOM = CONTENT_TOP + PANEL_H
FOOTER_Y       = 7.15

prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]

def solid(sh, c):
    sh.fill.solid(); sh.fill.fore_color.rgb = c

def no_line(sh):
    sh.line.fill.background()

def rect(sl, x, y, w, h, c, r=False, rad=0.1):
    sh = sl.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE if r else MSO_SHAPE.RECTANGLE,
        Inches(x), Inches(y), Inches(w), Inches(h))
    solid(sh, c); no_line(sh)
    if r:
        try: sh.adjustments[0] = rad
        except: pass
    return sh

def oval(sl, x, y, w, h, c):
    sh = sl.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(w), Inches(h))
    solid(sh, c); no_line(sh)
    return sh

def arrow(sl, x, y, w, h, c=AMBER):
    sh = sl.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, Inches(x), Inches(y), Inches(w), Inches(h))
    solid(sh, c); no_line(sh)
    return sh

def down_arrow(sl, x, y, w, h, c=AMBER):
    sh = sl.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, Inches(x), Inches(y), Inches(w), Inches(h))
    solid(sh, c); no_line(sh)
    return sh

def up_arrow(sl, x, y, w, h, c=AMBER):
    sh = sl.shapes.add_shape(MSO_SHAPE.UP_ARROW, Inches(x), Inches(y), Inches(w), Inches(h))
    solid(sh, c); no_line(sh)
    return sh

def text(sl, x, y, w, h, t, size=14, color=WHITE, bold=False, font=None,
         align=PP_ALIGN.LEFT, italic=False, anchor=MSO_ANCHOR.TOP, spacing=1.0):
    tb = sl.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    f = font or SANS
    for i, ln in enumerate(t.split('\n')):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.line_spacing = spacing
        r = p.add_run(); r.text = ln
        r.font.size = Pt(size); r.font.color.rgb = color
        r.font.bold = bold; r.font.italic = italic; r.font.name = f
    return tb

def bg_slide():
    s = prs.slides.add_slide(BLANK)
    rect(s, 0, 0, 13.333, 7.5, BG)
    rect(s, 0, 4.0, 13.333, 3.5, BG2)
    rect(s, 0, 0, 0.14, 7.5, AMBER)
    return s

def footer(s, page):
    text(s, L, FOOTER_Y, 8, 0.25, 'Rental Vault  ·  Bengaluru Circularity Project',
         size=8.5, color=GREY, font=SANS)
    text(s, 12.0, FOOTER_Y, 0.7, 0.25, page, size=8.5, color=GREY,
         align=PP_ALIGN.RIGHT, font=SANS)

def page_number(s, num):
    text(s, 12.2, 0.5, 0.7, 0.3, f'{num:02d}', size=11, color=AMBER,
         bold=True, align=PP_ALIGN.RIGHT, font=SANS)

def eyebrow(s, txt):
    text(s, L, 0.55, 10, 0.3, txt, size=11, color=AMBER, bold=True, font=SANS)

def accent_bar(s):
    rect(s, L, 0.88, 0.55, 0.05, AMBER)

def title(s, txt, y=1.1, size=44, w=11.65):
    text(s, L, y, w, 1.6, txt, size=size, color=WHITE, bold=True,
         spacing=1.05, font=SERIF)

def notes(sl, txt):
    sl.notes_slide.notes_text_frame.text = txt


# ============= 01 — TITLE (Speaker 1) =============
s = bg_slide()
oval(s, 9.5, 3.2, 3.2, 3.2, PANEL)
oval(s, 9.95, 3.65, 2.3, 2.3, AMBER)
oval(s, 10.35, 4.05, 1.5, 1.5, BG)
text(s, 10.35, 4.35, 1.5, 0.9, 'V', size=54, color=AMBER_L, bold=True, align=PP_ALIGN.CENTER, font=SERIF)
text(s, L, 1.4, 11, 0.4, 'BENGALURU CIRCULARITY PROJECT · TRACK 02', size=13, color=AMBER_L, bold=True, font=SANS)
text(s, L, 1.95, 11, 1.9, 'Rental Vault', size=96, color=WHITE, bold=True, font=SERIF)
rect(s, L, 4.0, 1.5, 0.07, AMBER)
text(s, L, 4.3, 11, 0.7, 'Idle goods, held in trust.', size=30, color=AMBER_L, italic=True, font=SERIF)
text(s, L, 5.35, 9.5, 1.1, 'A secure neighbourhood vault where underused\nhousehold assets become rental income — with\nverified grading, insured exchange, and custody.', size=14, color=GREY_L, spacing=1.3, font=SANS)
text(s, L, 6.8, 11, 0.4, 'One goal  ·  One ward  ·  One shared shelf', size=12, color=GREY, font=SANS)
notes(s, "Speaker 1: Good morning. We are Team [Name], and we are building Rental Vault—a marketplace that turns idle household goods into rental income, securely.")

# ============= 02 — PROBLEM (Speaker 1) =============
s = bg_slide()
page_number(s, 2)
eyebrow(s, '01 · DIAGNOSIS')
accent_bar(s)
title(s, 'Two problems.\nSame city.', size=44, y=1.05)
text(s, L + 0.35, CONTENT_TOP + 0.75, 5.1, 2.7, '✓   Browse page with live listings\n✓   Detail page for every item\n✓   Rent action — creates transaction\n✓   Return action — closes the loop\n✓   My Rentals page\n✓   Full custody event audit trail\n✓   Deployed  ·  code on GitHub', size=12.5, color=WHITE, spacing=1.7, font=SANS)
rect(s, 6.85, CONTENT_TOP, 5.65, PANEL_H, PANEL, r=True, rad=0.1)
text(s, 7.2, CONTENT_TOP + 0.3, 4.95, 0.3, 'THE GAP, IN ONE LINE', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, 7.2, CONTENT_TOP + 0.85, 4.95, 1.9, 'Goods exist,\nmetres apart,\nthat never reach\neach other.', size=22, color=WHITE, bold=True, spacing=1.25, font=SERIF)
text(s, 7.2, CONTENT_TOP + 2.85, 4.95, 0.6, 'The project does not need to\ncreate supply. It needs to create trust.', size=11.5, color=AMBER_L, italic=True, spacing=1.3, font=SANS)
footer(s, '02')
notes(s, "Speaker 1: 'We are not solving a supply problem. We are solving a trust problem.'")

# ============= 03 — PARADOX (Speaker 1) =============
s = bg_slide()
page_number(s, 3)
eyebrow(s, '01.1 · THE PARADOX')
accent_bar(s)
title(s, 'Scarcity and idleness,\nin the same neighbourhood.', size=34, y=1.05)
cards = [
    ('01', 'DEMAND', 'Mobility without ownership', 'Students, young professionals and migrant families move often. They need durable goods for months — not years.'),
    ('02', 'SUPPLY', 'Idle assets, locked up', 'Owners hold underused goods. They leave them idle rather than risk loss or a bad-faith return.'),
    ('03', 'MISSING', 'No neutral verification', 'No verification point. No damage cover. No secure exchange. Without the layer, trust never forms.'),
]
x = L
for num, tag, head, body in cards:
    rect(s, x, CONTENT_TOP, 3.85, PANEL_H, PANEL, r=True, rad=0.1)
    text(s, x + 0.35, CONTENT_TOP + 0.3, 3.15, 0.3, num + '  ·  ' + tag, size=10.5, color=AMBER, bold=True, font=SANS)
    text(s, x + 0.35, CONTENT_TOP + 0.7, 3.15, 1.0, head, size=19, color=WHITE, bold=True, spacing=1.15, font=SERIF)
    text(s, x + 0.35, CONTENT_TOP + 1.85, 3.15, 1.6, body, size=11.5, color=GREY_L, spacing=1.4, font=SANS)
    x += 3.95
footer(s, '03')
notes(s, "Speaker 1: Bengaluru has a mobility problem. People need things for months, not years. Meanwhile, others have idle items locked away.")

# ============= 04 — MARKET (Speaker 1) =============
s = bg_slide()
page_number(s, 4)
eyebrow(s, '02 · MARKET SIGNALS')
accent_bar(s)
title(s, 'Demand is proven.\nThe gap is trust.', size=40, y=1.05)
stats = [
    ('₹1,810cr\n→ ₹4,540cr', 'India appliance rental\nmarket, 2024 to 2030.'),
    ('16.3%', 'Projected category growth.\nStructural, not a spike.'),
    ('85%', 'Urban Indians prefer\nrent over buy.'),
    ('60%', 'Category share held\nby home appliances.'),
]
x = L
for num, body in stats:
    rect(s, x, CONTENT_TOP, 2.87, 2.0, PANEL, r=True, rad=0.1)
    text(s, x + 0.25, CONTENT_TOP + 0.25, 2.4, 0.85, num, size=18, color=AMBER_L, bold=True, spacing=1.05, font=SERIF)
    text(s, x + 0.25, CONTENT_TOP + 1.25, 2.4, 0.65, body, size=10.5, color=GREY_L, spacing=1.3, font=SANS)
    x += 3.0
readings = [
    ('SIGNAL 01', 'Growth is structural', 'A 16.3% growth rate reflects a permanent shift in how urban populations consume.'),
    ('SIGNAL 02', 'Storage is the twin demand', 'The same hub doubles as secure self-storage for renters in transit.'),
    ('SIGNAL 03', 'Preference already flipped', 'At 85% preference, the constraint is the trusted local exchange.'),
]
x = L
for tag, head, body in readings:
    rect(s, x, CONTENT_TOP + 2.2, 3.85, 1.4, PANEL_L, r=True, rad=0.1)
    text(s, x + 0.28, CONTENT_TOP + 2.35, 3.3, 0.28, tag, size=9.5, color=AMBER, bold=True, font=SANS)
    text(s, x + 0.28, CONTENT_TOP + 2.65, 3.3, 0.4, head, size=13, color=WHITE, bold=True, font=SERIF)
    text(s, x + 0.28, CONTENT_TOP + 3.05, 3.3, 0.5, body, size=10, color=GREY_L, spacing=1.25, font=SANS)
    x += 3.95
footer(s, '04')
notes(s, "Speaker 1: This isn't a niche. The market is growing at 16.3%, and 85% of urban Indians prefer renting. The demand is proven.")

# ============= 05 — DEFINITION (Speaker 1) =============
s = bg_slide()
page_number(s, 5)
eyebrow(s, '03 · DEFINITION')
accent_bar(s)
title(s, 'What is a "Rental Vault"?', size=40, y=1.05)
rect(s, L, CONTENT_TOP, 5.75, PANEL_H, PANEL, r=True, rad=0.1)
text(s, L + 0.35, CONTENT_TOP + 0.3, 5.1, 0.3, 'DICTIONARY ENTRY', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, L + 0.35, CONTENT_TOP + 0.65, 5.1, 0.7, 'rent·al vault', size=32, color=WHITE, bold=True, font=SERIF)
text(s, L + 0.35, CONTENT_TOP + 1.4, 5.1, 0.3, '/ˈrentl vôlt/  ·  noun', size=12, color=GREY, italic=True, font=SANS)
text(s, L + 0.35, CONTENT_TOP + 1.8, 5.1, 1.7, 'A physical hub where owners deposit idle items.\nThe vault inspects, grades, photographs and\ninsures each item. Damage is settled from a\npooled fund — never paid as cash.', size=12, color=GREY_L, spacing=1.4, font=SANS)
rect(s, 6.85, CONTENT_TOP, 5.65, PANEL_H, PANEL_L, r=True, rad=0.1)
text(s, 7.2, CONTENT_TOP + 0.3, 5.0, 0.3, 'WHY "VAULT" IS THE RIGHT WORD', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, 7.2, CONTENT_TOP + 0.7, 5.0, 0.3, 'Custody first. Transaction second.', size=12, color=AMBER_L, bold=True, font=SANS)
text(s, 7.2, CONTENT_TOP + 1.1, 5.0, 1.2, 'A vault holds things safely before\nanything else happens. Every item\ngoes into physical custody before\nit can be rented.', size=11.5, color=GREY_L, spacing=1.3, font=SANS)
text(s, 7.2, CONTENT_TOP + 2.4, 5.0, 0.3, 'The same hub doubles as self-storage.', size=12, color=AMBER_L, bold=True, font=SANS)
text(s, 7.2, CONTENT_TOP + 2.8, 5.0, 0.5, 'Renters in transit store their own\ngoods here too.', size=11.5, color=GREY_L, spacing=1.3, font=SANS)
footer(s, '05')
notes(s, "Speaker 1: Our solution is a physical hub in the neighbourhood. Owners drop items off, the vault inspects them, and renters pick them up.")

# ============= 06 — THREE MODELS (Speaker 2) =============
s = bg_slide()
page_number(s, 6)
eyebrow(s, '03.1 · SOLUTION MODELS')
accent_bar(s)
title(s, 'Three ways to build.\nOne fits the goal.', size=36, y=1.05)
models = [
    ('A', 'SECURE NEIGHBOURHOOD VAULT', 'RECOMMENDED', True, 'Owners deposit items at the hub.\nThe vault grades and insures.\nRenters browse, pay and collect.\nDamage from a pooled fund.'),
    ('B', 'PURE P2P + LOGISTICS', 'THINNER TRUST', False, 'Owner-to-renter directly.\nPlatform handles delivery.\nTrust layer stays thin.\nRisk sits with users.'),
    ('C', 'B2B MANAGED', 'OUT OF SCOPE', False, 'Operator owns inventory.\nRents to businesses.\nDoes not unlock idle stock.\nSlow sales cycle only.'),
]
x = L
for letter, name, tag, is_a, body in models:
    border = AMBER if is_a else PANEL_L
    rect(s, x, CONTENT_TOP, 3.85, PANEL_H, border, r=True, rad=0.1)
    if is_a:
        rect(s, x + 0.3, CONTENT_TOP + 0.25, 3.25, 0.35, BG, r=True, rad=0.2)
        text(s, x + 0.3, CONTENT_TOP + 0.31, 3.25, 0.28, tag, size=10, color=AMBER, bold=True, align=PP_ALIGN.CENTER, font=SANS)
    else:
        rect(s, x + 0.3, CONTENT_TOP + 0.25, 3.25, 0.35, PANEL_L, r=True, rad=0.2)
        text(s, x + 0.3, CONTENT_TOP + 0.31, 3.25, 0.28, tag, size=10, color=GREY, bold=True, align=PP_ALIGN.CENTER, font=SANS)
    text(s, x + 0.3, CONTENT_TOP + 0.75, 3.25, 0.5, letter, size=20, color=BG if is_a else GREY, bold=True, font=SERIF)
    text(s, x + 0.3, CONTENT_TOP + 1.2, 3.25, 0.75, name, size=14, color=BG if is_a else WHITE, bold=True, spacing=1.15, font=SERIF)
    text(s, x + 0.3, CONTENT_TOP + 2.05, 3.25, 1.4, body, size=11, color=BG if is_a else GREY_L, spacing=1.35, font=SANS)
    x += 3.95
footer(s, '06')
notes(s, "Speaker 2: We looked at 3 models. We chose Model A because it is the fastest to build and makes the most trust. Companies like Rentomojo own their inventory. We unlock the peer-to-peer layer.")

# ============= 07 — RECOMMENDATION (Speaker 2) =============
s = bg_slide()
page_number(s, 7)
eyebrow(s, '03.2 · RECOMMENDATION')
accent_bar(s)
title(s, 'Why Model A.', size=44, y=1.05)
rect(s, L, CONTENT_TOP, 5.75, PANEL_H, AMBER, r=True, rad=0.1)
text(s, L + 0.4, CONTENT_TOP + 0.3, 4.95, 0.35, 'RECOMMENDED', size=11, color=BG, bold=True, font=SANS)
text(s, L + 0.4, CONTENT_TOP + 0.75, 4.95, 1.6, 'Secure\nNeighbourhood\nVault', size=32, color=BG, bold=True, spacing=1.05, font=SERIF)
text(s, L + 0.4, CONTENT_TOP + 2.6, 4.95, 0.9, 'A single hub produces the cleanest\ndamage-claim baseline — the metric\nthat decides scale.', size=11.5, color=BG, spacing=1.35, font=SANS)
rect(s, 6.85, CONTENT_TOP, 5.65, PANEL_H, PANEL, r=True, rad=0.1)
text(s, 7.2, CONTENT_TOP + 0.3, 5.0, 0.3, 'COMPARATIVE FIT', size=10.5, color=AMBER, bold=True, font=SANS)
rows = [('Trust & security', 'HIGH'), ('Speed to launch', 'FAST'), ('Unit economics', 'IMMEDIATE'), ('Asset utilisation', 'HIGH'), ('Goal compatibility', 'YES')]
y = CONTENT_TOP + 0.85
for label, val in rows:
    text(s, 7.2, y, 3.4, 0.4, label, size=13, color=GREY_L, font=SANS)
    text(s, 9.85, y, 2.35, 0.4, val, size=13, color=AMBER_L, bold=True, align=PP_ALIGN.RIGHT, font=SANS)
    rect(s, 7.2, y + 0.45, 5.0, 0.012, PANEL_L)
    y += 0.55
footer(s, '07')
notes(s, "Speaker 2: Model A gives us the cleanest damage-claim baseline because every item passes through a physical operator.")

# ============= 08 — STAKEHOLDERS (Speaker 2) =============
s = bg_slide()
page_number(s, 8)
eyebrow(s, '04 · STAKEHOLDERS')
accent_bar(s)
title(s, 'Who the vault has to work for.', size=34, y=1.05)
stakeholders = [
    ('01', 'OWNERS', 'Deposit idle assets. Earn rental income.', 'Passive income · insured custody'),
    ('02', 'RENTERS', 'Access goods at a fraction of purchase cost.', 'Affordable access'),
    ('03', 'VAULT OPERATOR', 'Custody, grading, insurance, disputes.', 'Commission · storage fees'),
    ('04', 'INSURERS', 'Pooled damage and theft cover.', 'A new pooled-risk book'),
    ('05', 'REPAIR PARTNERS', 'Keep rental stock working.', 'Steady repair demand'),
]
y = CONTENT_TOP + 0.15
for num, name, body, gets in stakeholders:
    rect(s, L, y, 11.65, 0.65, PANEL, r=True, rad=0.15)
    oval(s, L + 0.2, y + 0.13, 0.4, 0.4, AMBER)
    text(s, L + 0.2, y + 0.2, 0.4, 0.3, num, size=11, color=BG, bold=True, align=PP_ALIGN.CENTER, font=SANS)
    text(s, L + 0.75, y + 0.1, 3.2, 0.45, name, size=13.5, color=WHITE, bold=True, anchor=MSO_ANCHOR.MIDDLE, font=SERIF)
    text(s, 4.9, y + 0.1, 4.6, 0.45, body, size=11.5, color=GREY_L, anchor=MSO_ANCHOR.MIDDLE, font=SANS)
    text(s, 9.5, y + 0.1, 2.9, 0.45, gets, size=11.5, color=AMBER_L, bold=True, align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE, font=SANS)
    y += 0.7
footer(s, '08')
notes(s, "Speaker 2: For this loop to work, everyone gets something: Owners get passive income, Renters get access, Operators earn commission, and Insurers get a new risk book.")

# ============= 09 — TRUST MECHANICS (Speaker 2) =============
s = bg_slide()
page_number(s, 9)
eyebrow(s, '04.1 · TRUST MECHANICS')
accent_bar(s)
title(s, 'Four small proofs\nmake strangers trade.', size=36, y=1.05)
steps = [
    ('01', 'GRADE', 'Photo-graded at intake\nand again at return.\nSame rubric both times.'),
    ('02', 'REGISTER', 'Serial registry on every\nitem. No listing without\na unique ID.'),
    ('03', 'INSURE', 'Pooled damage and theft\ncover across all items\nheld in the vault.'),
    ('04', 'ARBITRATE', 'Operator-mediated dispute\nsettlement with a clear\nevidence trail.'),
]
x = L
for i, (num, name, body) in enumerate(steps):
    rect(s, x, CONTENT_TOP, 2.75, 3.55, PANEL, r=True, rad=0.1)
    oval(s, x + 0.32, CONTENT_TOP + 0.3, 0.5, 0.5, AMBER)
    text(s, x + 0.32, CONTENT_TOP + 0.41, 0.5, 0.3, num, size=12.5, color=BG, bold=True, align=PP_ALIGN.CENTER, font=SANS)
    text(s, x + 0.32, CONTENT_TOP + 1.0, 2.2, 0.55, name, size=18, color=WHITE, bold=True, font=SERIF)
    text(s, x + 0.32, CONTENT_TOP + 1.75, 2.2, 1.6, body, size=11, color=GREY_L, spacing=1.4, font=SANS)
    if i < 3:
        arrow(s, x + 2.8, CONTENT_TOP + 1.65, 0.28, 0.28, AMBER)
    x += 2.95
text(s, L, CONTENT_TOP + 3.75, 11.65, 0.4, 'Custody and verification first, transaction second.', size=11.5, color=GREY_L, italic=True, font=SANS)
footer(s, '09')
notes(s, "Speaker 2: How do we make strangers trade? We photo-grade at intake, register serial numbers, insure the pool, and mediate disputes.")

# ============= 10 — ESCROW (Speaker 2) =============
s = bg_slide()
page_number(s, 10)
eyebrow(s, '04.2 · TERM EXPLAINER')
accent_bar(s)
title(s, 'What is escrow?', size=42, y=1.05)
rect(s, L, CONTENT_TOP, 11.65, 1.3, PANEL, r=True, rad=0.1)
text(s, L + 0.35, CONTENT_TOP + 0.25, 11.0, 0.3, 'DEFINITION', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, L + 0.35, CONTENT_TOP + 0.65, 11.0, 0.6, 'Money held by a neutral third party until both sides of an agreement have been fulfilled.', size=17, color=WHITE, bold=True, anchor=MSO_ANCHOR.MIDDLE, font=SERIF)
flow = [
    ('RENTER PAYS', 'Deposit held by the vault'),
    ('VAULT HOLDS', 'Neither side can touch it'),
    ('ITEM RETURNED', 'Operator verifies condition'),
    ('FUNDS RELEASED', 'Owner earns. Renter gets\ndeposit back.'),
]
x = L
for i, (name, body) in enumerate(flow):
    rect(s, x, CONTENT_TOP + 1.6, 2.6, 1.75, PANEL_L, r=True, rad=0.1)
    text(s, x + 0.22, CONTENT_TOP + 1.8, 2.2, 0.4, name, size=12.5, color=AMBER_L, bold=True, font=SANS)
    text(s, x + 0.22, CONTENT_TOP + 2.25, 2.2, 1.0, body, size=10.5, color=GREY_L, spacing=1.3, font=SANS)
    if i < 3:
        arrow(s, x + 2.67, CONTENT_TOP + 2.3, 0.3, 0.28, AMBER)
    x += 2.97
footer(s, '10')
notes(s, "Speaker 2: We use escrow. The deposit is held safely. It is only released when the operator verifies the return condition.")

# ============= 11 — KYC + CUSTODY (Speaker 3) =============
s = bg_slide()
page_number(s, 11)
eyebrow(s, '04.3 · TERM EXPLAINERS')
accent_bar(s)
title(s, 'KYC and custody states.', size=36, y=1.05)
rect(s, L, CONTENT_TOP, 5.6, PANEL_H, PANEL, r=True, rad=0.1)
text(s, L + 0.35, CONTENT_TOP + 0.3, 4.9, 0.3, 'KYC', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, L + 0.35, CONTENT_TOP + 0.65, 4.9, 0.55, 'Know Your Customer', size=22, color=WHITE, bold=True, font=SERIF)
text(s, L + 0.35, CONTENT_TOP + 1.45, 4.9, 2.0, 'The process of verifying that a user is\nwho they claim to be, before they\nhandle money or trust.\n\nEvery user starts as UNVERIFIED.\nAfter ID submission and operator\napproval, they become VERIFIED.', size=11.5, color=GREY_L, spacing=1.4, font=SANS)
rect(s, 6.75, CONTENT_TOP, 5.75, PANEL_H, PANEL_L, r=True, rad=0.1)
text(s, 7.1, CONTENT_TOP + 0.3, 5.1, 0.3, 'CUSTODY STATES', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, 7.1, CONTENT_TOP + 0.65, 5.1, 0.5, 'The state machine', size=20, color=WHITE, bold=True, font=SERIF)
states = [('IN_VAULT', 'Available for rent'), ('RENTED', 'With a renter'), ('RETURNED', 'Back in vault, verified'), ('DAMAGED', 'Under damage review'), ('REPAIR', 'With the repair network'), ('LOST', 'Non-return reported')]
y = CONTENT_TOP + 1.4
for st, desc in states:
    rect(s, 7.1, y, 1.7, 0.32, INDIGO, r=True, rad=0.25)
    text(s, 7.1, y + 0.03, 1.7, 0.28, st, size=10, color=AMBER_L, bold=True, align=PP_ALIGN.CENTER, font=SANS)
    text(s, 8.95, y + 0.03, 3.45, 0.28, desc, size=11, color=GREY_L, font=SANS)
    y += 0.37
footer(s, '11')
notes(s, "Speaker 3: Every item has a strict digital lifecycle. An item cannot be rented unless it is physically in the vault.")

# ============= 12 — LOOP (Speaker 3) =============
s = bg_slide()
page_number(s, 12)
eyebrow(s, '04.4 · FLOWCHART')
accent_bar(s)
title(s, 'The rent–return loop.', size=42, y=1.05)
text(s, L, CONTENT_TOP - 0.15, 11.65, 0.4, 'State transitions are enforced by server-side code. Every change writes a custody event to the audit log.', size=11.5, color=GREY_L, font=SANS)
state_positions = [(1.55, 3.35), (5.65, 3.35), (9.75, 3.35)]
state_names = ['IN_VAULT', 'RENTED', 'RETURNED']
state_colors = [GREEN, AMBER, TEAL]
for (x, y), name, col in zip(state_positions, state_names, state_colors):
    oval(s, x, y, 1.85, 1.85, col)
    text(s, x, y + 0.72, 1.85, 0.42, name, size=12.5, color=BG if col == AMBER else WHITE, bold=True, align=PP_ALIGN.CENTER, font=SERIF)
arrow(s, 3.65, 4.0, 1.75, 0.55, AMBER_L)
text(s, 3.65, 3.58, 1.75, 0.3, 'RENT', size=12, color=AMBER_L, bold=True, align=PP_ALIGN.CENTER, font=SANS)
arrow(s, 7.75, 4.0, 1.75, 0.55, AMBER_L)
text(s, 7.75, 3.58, 1.75, 0.3, 'USE', size=12, color=AMBER_L, bold=True, align=PP_ALIGN.CENTER, font=SANS)
up_arrow(s, 2.27, 5.32, 0.42, 0.42, AMBER_L)
up_arrow(s, 10.47, 5.32, 0.42, 0.42, AMBER_L)
rect(s, 2.46, 5.72, 0.05, 0.32, AMBER_L)
rect(s, 10.66, 5.72, 0.05, 0.32, AMBER_L)
rect(s, 2.46, 6.02, 8.25, 0.05, AMBER_L)
text(s, 5.6, 6.12, 2.0, 0.3, 'RETURN', size=12, color=AMBER_L, bold=True, align=PP_ALIGN.CENTER, font=SANS)
footer(s, '12')
notes(s, "Speaker 3: State transitions are strictly enforced. The renter pays, takes the item, uses it, and returns it. The loop closes.")

# ============= 13 — STATE MACHINE (Speaker 3) =============
s = bg_slide()
page_number(s, 13)
eyebrow(s, '04.5 · FLOWCHART')
accent_bar(s)
title(s, 'The custody state machine.', size=36, y=1.05)
rect(s, L, CONTENT_TOP + 0.2, 2.1, 0.85, GREEN, r=True, rad=0.15)
text(s, L, CONTENT_TOP + 0.38, 2.1, 0.5, 'IN_VAULT', size=12.5, color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, font=SANS)
rect(s, 3.35, CONTENT_TOP + 0.2, 2.1, 0.85, AMBER, r=True, rad=0.15)
text(s, 3.35, CONTENT_TOP + 0.38, 2.1, 0.5, 'RENTED', size=12.5, color=BG, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, font=SANS)
rect(s, 6.05, CONTENT_TOP + 0.2, 2.1, 0.85, TEAL, r=True, rad=0.15)
text(s, 6.05, CONTENT_TOP + 0.38, 2.1, 0.5, 'RETURNED', size=12.5, color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, font=SANS)
rect(s, 8.75, CONTENT_TOP + 0.2, 2.1, 0.85, GREEN, r=True, rad=0.15)
text(s, 8.75, CONTENT_TOP + 0.38, 2.1, 0.5, 'IN_VAULT', size=12.5, color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, font=SANS)
rect(s, 11.3, CONTENT_TOP + 0.2, 1.2, 0.85, PANEL, r=True, rad=0.15)
text(s, 11.3, CONTENT_TOP + 0.38, 1.2, 0.5, 'REPEAT', size=11, color=GREY_L, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, font=SANS)
arrow(s, 2.78, CONTENT_TOP + 0.35, 0.5, 0.5, AMBER_L)
arrow(s, 5.5, CONTENT_TOP + 0.35, 0.5, 0.5, AMBER_L)
arrow(s, 8.22, CONTENT_TOP + 0.35, 0.5, 0.5, AMBER_L)
arrow(s, 10.95, CONTENT_TOP + 0.35, 0.28, 0.5, AMBER_L)
down_arrow(s, 4.05, CONTENT_TOP + 1.3, 0.5, 0.5, RED)
text(s, 3.45, CONTENT_TOP + 1.9, 1.7, 0.3, 'DAMAGE', size=11, color=RED, bold=True, align=PP_ALIGN.CENTER, font=SANS)
rect(s, 3.35, CONTENT_TOP + 2.3, 2.1, 0.8, RED, r=True, rad=0.15)
text(s, 3.35, CONTENT_TOP + 2.45, 2.1, 0.5, 'DAMAGED', size=12.5, color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, font=SANS)
rect(s, 6.05, CONTENT_TOP + 2.3, 2.1, 0.8, PANEL_L, r=True, rad=0.15)
text(s, 6.05, CONTENT_TOP + 2.45, 2.1, 0.5, 'REPAIR', size=12.5, color=WHITE, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, font=SANS)
rect(s, 8.75, CONTENT_TOP + 2.3, 2.1, 0.8, PANEL, r=True, rad=0.15)
text(s, 8.75, CONTENT_TOP + 2.45, 2.1, 0.5, 'LOST', size=12.5, color=GREY_L, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, font=SANS)
arrow(s, 5.5, CONTENT_TOP + 2.45, 0.5, 0.5, AMBER)
arrow(s, 8.22, CONTENT_TOP + 2.45, 0.5, 0.5, AMBER)
footer(s, '13')
notes(s, "Speaker 3: Damage and loss are first-class states. This prevents broken items from being rented again.")

# ============= 14 — PROTOTYPE BROWSE (Speaker 3) =============
s = bg_slide()
page_number(s, 14)
eyebrow(s, '06.1 · THE WORKING PROTOTYPE')
accent_bar(s)
title(s, 'Renter View: Browse', size=40, y=1.05)

rect(s, L, CONTENT_TOP, 7.5, PANEL_H, PANEL_L, r=True, rad=0.1)
text(s, L + 1, CONTENT_TOP + 1.5, 5.5, 0.5, '[ INSERT SCREENSHOT: BROWSE PAGE ]', size=18, color=AMBER, bold=True, align=PP_ALIGN.CENTER, font=SANS)

rect(s, 8.65, CONTENT_TOP, 3.85, PANEL_H, PANEL, r=True, rad=0.1)
text(s, 8.95, CONTENT_TOP + 0.3, 3.25, 0.3, 'KEY FEATURES', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, 8.95, CONTENT_TOP + 0.8, 3.25, 2.5, '• Live listings\n• Search & filter\n• 3D tilt cards\n• Grade badges', size=12, color=GREY_L, spacing=1.5, font=SANS)
footer(s, '14')
notes(s, "Speaker 3: We didn't just design this—we built it. Here is our MVP. Renters can browse items and take a photo with their camera to rent.")

# ============= 15 — PROTOTYPE RENT (Speaker 3) =============
s = bg_slide()
page_number(s, 15)
eyebrow(s, '06.2 · THE WORKING PROTOTYPE')
accent_bar(s)
title(s, 'Intake & Return Flow', size=40, y=1.05)

rect(s, L, CONTENT_TOP, 5.6, PANEL_H, PANEL_L, r=True, rad=0.1)
text(s, L + 0.5, CONTENT_TOP + 1.5, 4.6, 0.5, '[ INSERT SCREENSHOT: INTAKE ]', size=14, color=AMBER, bold=True, align=PP_ALIGN.CENTER, font=SANS)
text(s, L + 0.5, CONTENT_TOP + 2.0, 4.6, 0.3, 'Live Camera Capture', size=11, color=GREY_L, align=PP_ALIGN.CENTER, font=SANS)

rect(s, 6.75, CONTENT_TOP, 5.75, PANEL_H, PANEL_L, r=True, rad=0.1)
text(s, 7.25, CONTENT_TOP + 1.5, 4.75, 0.5, '[ INSERT SCREENSHOT: RETURN ]', size=14, color=AMBER, bold=True, align=PP_ALIGN.CENTER, font=SANS)
text(s, 7.25, CONTENT_TOP + 2.0, 4.75, 0.3, 'Photo Evidence Stored', size=11, color=GREY_L, align=PP_ALIGN.CENTER, font=SANS)
footer(s, '15')
notes(s, "Speaker 3: When returning, the operator uses the live camera to capture the return state, and escrow is released safely.")

# ============= 16 — PROTOTYPE OPERATOR (Speaker 4) =============
s = bg_slide()
page_number(s, 16)
eyebrow(s, '06.3 · THE WORKING PROTOTYPE')
accent_bar(s)
title(s, 'Operator Command Center', size=40, y=1.05)

rect(s, L, CONTENT_TOP, 11.65, 2.3, PANEL_L, r=True, rad=0.1)
text(s, L + 2, CONTENT_TOP + 0.9, 7.65, 0.5, '[ INSERT SCREENSHOT: OPERATOR DASHBOARD ]', size=16, color=AMBER, bold=True, align=PP_ALIGN.CENTER, font=SANS)

rect(s, L, CONTENT_TOP + 2.5, 3.7, 1.1, PANEL, r=True, rad=0.1)
text(s, L + 0.2, CONTENT_TOP + 2.6, 3.3, 0.3, 'Pending Approvals', size=12, color=WHITE, bold=True, font=SERIF)
text(s, L + 0.2, CONTENT_TOP + 2.95, 3.3, 0.5, 'Review new listings', size=10.5, color=GREY_L, font=SANS)

rect(s, 4.85, CONTENT_TOP + 2.5, 3.7, 1.1, PANEL, r=True, rad=0.1)
text(s, 5.05, CONTENT_TOP + 2.6, 3.3, 0.3, 'Active Rentals', size=12, color=WHITE, bold=True, font=SERIF)
text(s, 5.05, CONTENT_TOP + 2.95, 3.3, 0.5, 'Process returns', size=10.5, color=GREY_L, font=SANS)

rect(s, 8.8, CONTENT_TOP + 2.5, 3.7, 1.1, PANEL, r=True, rad=0.1)
text(s, 9.0, CONTENT_TOP + 2.6, 3.3, 0.3, 'Custody Events', size=12, color=WHITE, bold=True, font=SERIF)
text(s, 9.0, CONTENT_TOP + 2.95, 3.3, 0.5, 'Full audit trail', size=10.5, color=GREY_L, font=SANS)

footer(s, '16')
notes(s, "Speaker 4: The operator dashboard is the Command Center. They can approve new listings, process returns, and view the full audit trail.")

# ============= 17 — PROTOTYPE DISPUTE (Speaker 4) =============
s = bg_slide()
page_number(s, 17)
eyebrow(s, '06.4 · THE WORKING PROTOTYPE')
accent_bar(s)
title(s, 'Dispute Resolution', size=40, y=1.05)

rect(s, L, CONTENT_TOP, 11.65, 2.0, PANEL_L, r=True, rad=0.1)
text(s, L + 2, CONTENT_TOP + 0.75, 7.65, 0.5, '[ INSERT SCREENSHOT: CLAIMS ROW ]', size=16, color=AMBER, bold=True, align=PP_ALIGN.CENTER, font=SANS)

rect(s, L, CONTENT_TOP + 2.2, 5.6, 1.35, PANEL, r=True, rad=0.1)
text(s, L + 0.3, CONTENT_TOP + 2.35, 5.0, 0.3, 'EVIDENCE REVIEW', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, L + 0.3, CONTENT_TOP + 2.7, 5.0, 0.7, 'Side-by-side intake and return photos.\nSerial number verification.', size=11, color=GREY_L, spacing=1.3, font=SANS)

rect(s, 6.75, CONTENT_TOP + 2.2, 5.75, 1.35, PANEL, r=True, rad=0.1)
text(s, 7.05, CONTENT_TOP + 2.35, 5.1, 0.3, '3-TIER ESCALATION', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, 7.05, CONTENT_TOP + 2.7, 5.1, 0.7, 'Operator rules -> Renter disputes ->\nPlatform makes final call.', size=11, color=GREY_L, spacing=1.3, font=SANS)

footer(s, '17')
notes(s, "Speaker 4: If an item is damaged, we built a 3-tier system. The operator files a claim. The renter can dispute it. If escalated, an independent 'Platform' reviewer makes the final call. This prevents the operator from scamming the renter.")

# ============= 18 — GOAL PLAN (Speaker 4) =============
s = bg_slide()
page_number(s, 18)
eyebrow(s, '05 · GOAL PLAN')
accent_bar(s)
title(s, 'One goal. Four checkpoints.', size=40, y=1.05)
text(s, L, CONTENT_TOP - 0.15, 11.65, 0.35, 'Each checkpoint must be cleared before the next begins.', size=12.5, color=GREY_L, font=SANS)
checkpoints = [
    ('01', 'SHORTLIST THE TRUST LAYER', 'Vault site shortlisted.\nInsurance partner identified.\nApp wireframes drafted.', False),
    ('02', 'SECURE THE ANCHOR', 'Vault space secured.\nApp build begins.\nFirst owners signed up.', False),
    ('03', 'PUT THE INTERFACE LIVE', 'App MVP live.\nListings graded.\nFirst transactions complete.', False),
    ('04', 'PROVE THE LOOP', 'Target listings live.\nTarget transactions.\nDamage baseline set.', True),
]
x = L
for num, name, body, is_last in checkpoints:
    col = AMBER if is_last else PANEL
    rect(s, x, CONTENT_TOP + 0.35, 2.85, 3.3, col, r=True, rad=0.1)
    text(s, x + 0.25, CONTENT_TOP + 0.55, 2.4, 0.3, 'CHECKPOINT ' + num, size=10, color=BG if is_last else AMBER_L, bold=True, font=SANS)
    text(s, x + 0.25, CONTENT_TOP + 0.95, 2.4, 1.0, name, size=13.5, color=BG if is_last else WHITE, bold=True, spacing=1.2, font=SERIF)
    text(s, x + 0.25, CONTENT_TOP + 2.1, 2.4, 1.4, body, size=11, color=BG if is_last else GREY_L, spacing=1.35, font=SANS)
    x += 2.95
footer(s, '18')
notes(s, "Speaker 4: We ran this as a strict 4-week sprint. Each week had an exit gate that had to be cleared before moving on.")

# ============= 19 — TARGETS (Speaker 4) =============
s = bg_slide()
page_number(s, 19)
eyebrow(s, '05.1 · TARGETS')
accent_bar(s)
title(s, 'What the goal looks like.', size=40, y=1.05)
kpis = [('30', 'OWNER SIGN-UPS', 'AT CHECKPOINT 02'), ('100', 'LIVE LISTINGS', 'AT PROJECT CLOSE'), ('50', 'COMPLETED TRANSACTIONS', 'AT PROJECT CLOSE'), ('<5%', 'DAMAGE-CLAIM RATE', 'OF TRANSACTIONS')]
x = L
for num, label, sub in kpis:
    rect(s, x, CONTENT_TOP, 2.87, 2.05, PANEL, r=True, rad=0.1)
    text(s, x, CONTENT_TOP + 0.25, 2.87, 1.0, num, size=44, color=AMBER_L, bold=True, align=PP_ALIGN.CENTER, font=SERIF)
    text(s, x, CONTENT_TOP + 1.3, 2.87, 0.45, label, size=11, color=WHITE, bold=True, align=PP_ALIGN.CENTER, font=SANS)
    text(s, x, CONTENT_TOP + 1.75, 2.87, 0.28, sub, size=9, color=GREY, align=PP_ALIGN.CENTER, font=SANS)
    x += 3.0
rect(s, L, CONTENT_TOP + 2.35, 11.65, 1.25, PANEL_L, r=True, rad=0.1)
text(s, L + 0.35, CONTENT_TOP + 2.5, 11.0, 0.3, 'SUCCESS CRITERIA  —  ALL MUST BE TRUE TO CLOSE', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, L + 0.35, CONTENT_TOP + 2.85, 11.0, 0.7, 'Track 01  ·  2 clusters live  ·  ~100 homes harvesting  ·  baseline reading logged\nTrack 02  ·  Vault live  ·  100 listings  ·  50 transactions  ·  damage rate under 5%\nTrack 03  ·  100 repairs completed  ·  at least 60% success  ·  1 recycler partner signed', size=10.5, color=GREY_L, spacing=1.3, font=SANS)
footer(s, '19')
notes(s, "Speaker 4: Our success criteria for Week 4 are clear: 100 live listings, 50 completed transactions, and a damage-claim rate under 5%.")

# ============= 20 — RISKS (Speaker 4) =============
s = bg_slide()
page_number(s, 20)
eyebrow(s, '05.2 · RISK REGISTER')
accent_bar(s)
title(s, 'What can break the goal.', size=40, y=1.05)
risks = [
    ('R1', 'App build slips', 'Use an off-the-shelf template. Customise only the grading module.'),
    ('R2', 'Vault space delay', 'Pre-negotiated shortlist. Fallback to partner storage space.'),
    ('R3', 'Low owner sign-ups', 'Direct RWA outreach. Pitch insured custody, not just income.'),
    ('R4', 'Damage-claim disputes', 'Photo-grade at intake and return. Operator arbitration keeps claims under target.'),
]
y = CONTENT_TOP + 0.15
for tag, risk, mit in risks:
    rect(s, L, y, 11.65, 0.68, PANEL, r=True, rad=0.15)
    text(s, L + 0.3, y + 0.2, 0.6, 0.4, tag, size=12, color=AMBER, bold=True, font=SERIF)
    text(s, L + 0.95, y + 0.16, 3.3, 0.4, risk, size=12.5, color=WHITE, bold=True, anchor=MSO_ANCHOR.MIDDLE, font=SERIF)
    text(s, 5.05, y + 0.16, 7.4, 0.4, mit, size=10.5, color=GREY_L, anchor=MSO_ANCHOR.MIDDLE, font=SANS)
    y += 0.76
rect(s, L, CONTENT_TOP + 3.2, 11.65, 0.5, AMBER, r=True, rad=0.15)
text(s, L + 0.35, CONTENT_TOP + 3.29, 11.0, 0.35, 'Kill rule  —  If two of the three tracks miss a checkpoint, the project stops and re-plans.', size=12, color=BG, bold=True, anchor=MSO_ANCHOR.MIDDLE, font=SANS)
footer(s, '20')
notes(s, "Speaker 4: We know what can break this. If vault space is delayed, we have partner storage ready. If damage is ambiguous, our photo-grading handles it. We designed this to be stopped cheaply if the evidence says stop.")

# ============= 21 — BUSINESS MODEL (Speaker 5) =============
s = bg_slide()
page_number(s, 21)
eyebrow(s, '06 · BUSINESS MODEL')
accent_bar(s)
title(s, 'Earn when an idle\nasset works.', size=38, y=1.05)
revs = [
    ('Rental commission', 'PRIMARY', '15–20% of each completed transaction'),
    ('Storage fee', 'FLOOR', 'Monthly fee per item or locker'),
    ('Delivery', 'ADD-ON', 'Walk-to-vault is default; delivery charged per trip'),
    ('Rent-to-own', 'LOOP', 'Refurbished stock re-enters the vault at a margin'),
]
y = CONTENT_TOP + 0.1
for name, tag, body in revs:
    rect(s, L, y, 11.65, 0.75, PANEL, r=True, rad=0.15)
    oval(s, L + 0.28, y + 0.2, 0.36, 0.36, AMBER)
    text(s, L + 0.85, y + 0.1, 3.9, 0.32, name, size=13, color=WHITE, bold=True, font=SERIF)
    text(s, L + 0.85, y + 0.45, 3.9, 0.26, tag, size=9, color=AMBER, bold=True, font=SANS)
    text(s, 5.4, y + 0.18, 7.0, 0.45, body, size=11.5, color=GREY_L, anchor=MSO_ANCHOR.MIDDLE, font=SANS)
    y += 0.83
text(s, L, CONTENT_TOP + 3.6, 11.65, 0.35, 'A single leased space plus one operator keeps the model legible.', size=11, color=GREY, italic=True, font=SANS)
footer(s, '21')
notes(s, "Speaker 5: We earn when an idle asset moves. Our primary revenue is a 15-20% commission on every rental. We also charge for storage and delivery.")

# ============= 22 — TECH STACK (Speaker 5) =============
s = bg_slide()
page_number(s, 22)
eyebrow(s, '07 · WHAT WE BUILT')
accent_bar(s)
title(s, 'Built. Deployed.\nWorking.', size=44, y=1.05)
rect(s, L, CONTENT_TOP, 5.75, PANEL_H, PANEL, r=True, rad=0.1)
text(s, L + 0.35, CONTENT_TOP + 0.3, 5.1, 0.3, 'LIVE FEATURES', size=10.5, color=AMBER, bold=True, font=SANS)
features = ['✓   Browse page with live listings', '✓   Detail page for every item', '✓   Rent action — creates transaction', '✓   Return action — closes the loop', '✓   My Rentals page', '✓   Full custody event audit trail', '✓   Deployed  ·  code on GitHub']
y = CONTENT_TOP + 0.85
for line in features:
    text(s, L + 0.35, y, 5.1, 0.28, line, size=11, color=WHITE, font=SANS)
    y += 0.36
rect(s, 6.85, CONTENT_TOP, 5.65, PANEL_H, PANEL_L, r=True, rad=0.1)
text(s, 7.2, CONTENT_TOP + 0.3, 5.0, 0.3, 'TECH STACK', size=10.5, color=AMBER, bold=True, font=SANS)
stack = [('Frontend + Backend', 'Next.js 16'), ('Language', 'TypeScript'), ('Styling', 'Tailwind CSS'), ('Database', 'Supabase'), ('Hosting', 'Vercel'), ('Cost to build', '₹0  ·  free tier')]
y = CONTENT_TOP + 0.9
for label, value in stack:
    text(s, 7.2, y, 3.0, 0.4, label, size=12, color=GREY, font=SANS)
    text(s, 10.0, y, 2.3, 0.4, value, size=12.5, color=WHITE, bold=True, align=PP_ALIGN.RIGHT, font=SANS)
    rect(s, 7.2, y + 0.42, 5.0, 0.012, PANEL)
    y += 0.45
footer(s, '22')
notes(s, "Speaker 5: We built this using a modern stack: Next.js for the frontend, Supabase for the database and auth, deployed on Vercel. Our infrastructure cost is zero.")

# ============= 23 — SECURITY (Speaker 5) =============
s = bg_slide()
page_number(s, 23)
eyebrow(s, '07.1 · ARCHITECTURE')
accent_bar(s)
title(s, 'Database Security (RLS)', size=40, y=1.05)
rect(s, L, CONTENT_TOP, 5.6, PANEL_H, PANEL, r=True, rad=0.1)
text(s, L + 0.35, CONTENT_TOP + 0.3, 4.9, 0.3, 'WHAT IS IT?', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, L + 0.35, CONTENT_TOP + 0.7, 4.9, 0.5, 'Row Level Security', size=22, color=WHITE, bold=True, font=SERIF)
text(s, L + 0.35, CONTENT_TOP + 1.5, 4.9, 1.8, 'Because we deal with money and identity, security is paramount.\n\nWe used Supabase RLS. This means even if a hacker intercepts our API, the database itself prevents them from reading other users\' data.', size=11.5, color=GREY_L, spacing=1.4, font=SANS)
rect(s, 6.75, CONTENT_TOP, 5.75, PANEL_H, PANEL_L, r=True, rad=0.1)
text(s, 7.1, CONTENT_TOP + 0.3, 5.1, 0.3, 'HOW IT WORKS', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, 7.1, CONTENT_TOP + 0.9, 5.1, 2.3, '• Renters can only see their own transactions.\n\n• Operators can only update item states.\n\n• Only Platform reviewers can resolve escalated claims.\n\n• Deleting a user cascades safely.', size=12, color=GREY_L, spacing=1.3, font=SANS)
footer(s, '23')
notes(s, "Speaker 5: Because we deal with money and identity, security is paramount. We used Supabase RLS. This means even if a hacker intercepts our API, the database itself prevents them from reading other users' data.")

# ============= 24 — DEPLOYMENT (Speaker 5) =============
s = bg_slide()
page_number(s, 24)
eyebrow(s, '07.2 · DEPLOYMENT')
accent_bar(s)
title(s, 'From localhost to live.', size=40, y=1.05)
rect(s, L, CONTENT_TOP, 3.7, PANEL_H, PANEL, r=True, rad=0.1)
text(s, L + 0.25, CONTENT_TOP + 0.3, 3.2, 0.3, 'NEXT.JS 16', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, L + 0.25, CONTENT_TOP + 0.7, 3.2, 0.5, 'Frontend', size=20, color=WHITE, bold=True, font=SERIF)
text(s, L + 0.25, CONTENT_TOP + 1.4, 3.2, 1.8, 'React Server Components.\n\nTailwind CSS for styling.\n\n3D interactive cards.', size=12, color=GREY_L, spacing=1.4, font=SANS)
rect(s, 4.85, CONTENT_TOP, 3.7, PANEL_H, PANEL, r=True, rad=0.1)
text(s, 5.1, CONTENT_TOP + 0.3, 3.2, 0.3, 'SUPABASE', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, 5.1, CONTENT_TOP + 0.7, 3.2, 0.5, 'Backend', size=20, color=WHITE, bold=True, font=SERIF)
text(s, 5.1, CONTENT_TOP + 1.4, 3.2, 1.8, 'Postgres Database.\n\nEmail Auth.\n\nS3-compatible Storage.', size=12, color=GREY_L, spacing=1.4, font=SANS)
rect(s, 8.8, CONTENT_TOP, 3.7, PANEL_H, PANEL, r=True, rad=0.1)
text(s, 9.05, CONTENT_TOP + 0.3, 3.2, 0.3, 'VERCEL', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, 9.05, CONTENT_TOP + 0.7, 3.2, 0.5, 'Hosting', size=20, color=WHITE, bold=True, font=SERIF)
text(s, 9.05, CONTENT_TOP + 1.4, 3.2, 1.8, 'GitHub integration.\n\nAutomatic builds.\n\nZero downtime.', size=12, color=GREY_L, spacing=1.4, font=SANS)
footer(s, '24')
notes(s, "Speaker 5: The app is deployed on Vercel. Every push to GitHub automatically triggers a build and deploys to the live URL.")

# ============= 25 — SDGs (Speaker 6) =============
s = bg_slide()
page_number(s, 25)
eyebrow(s, '08 · IMPACT')
accent_bar(s)
title(s, 'A circular economy.', size=40, y=1.05)
rect(s, L, CONTENT_TOP, 5.6, PANEL_H, PANEL, r=True, rad=0.1)
text(s, L + 0.35, CONTENT_TOP + 0.3, 4.9, 0.3, 'SDG 12', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, L + 0.35, CONTENT_TOP + 0.7, 4.9, 0.5, 'Responsible Consumption', size=20, color=WHITE, bold=True, font=SERIF)
text(s, L + 0.35, CONTENT_TOP + 1.4, 4.9, 1.8, 'We don\'t want people to buy new things. We want them to share what already exists. This reduces waste and lowers the carbon footprint of manufacturing.', size=11.5, color=GREY_L, spacing=1.4, font=SANS)
rect(s, 6.75, CONTENT_TOP, 5.75, PANEL_H, PANEL_L, r=True, rad=0.1)
text(s, 7.1, CONTENT_TOP + 0.3, 5.1, 0.3, 'SDG 8', size=10.5, color=AMBER, bold=True, font=SANS)
text(s, 7.1, CONTENT_TOP + 0.7, 5.1, 0.5, 'Decent Work & Growth', size=20, color=WHITE, bold=True, font=SERIF)
text(s, 7.1, CONTENT_TOP + 1.4, 5.1, 1.8, 'We create new income streams for owners, new jobs for vault operators, and steady work for local repair partners.', size=11.5, color=GREY_L, spacing=1.4, font=SANS)
footer(s, '25')
notes(s, "Speaker 6: Finally, we care about the planet. This is SDG 12 and SDG 8. We don't want people to buy new things. We want them to share.")

# ============= 26 — TEAM (Speaker 6) =============
s = bg_slide()
page_number(s, 26)
eyebrow(s, '09 · THE TEAM')
accent_bar(s)
title(s, 'Built by a team of six.', size=40, y=1.05)

team = [
    ('Speaker 1', 'Business & Problem'), ('Speaker 2', 'Market & Solution'), ('Speaker 3', 'Trust & Prototype'),
    ('Speaker 4', 'Disputes & Risk'), ('Speaker 5', 'Tech & Execution'), ('Speaker 6', 'Outro & Impact')
]
x = L
y = CONTENT_TOP + 0.1
for i, (name, role) in enumerate(team):
    rect(s, x, y, 3.7, 1.2, PANEL, r=True, rad=0.1)
    text(s, x + 0.3, y + 0.25, 3.1, 0.3, name, size=14, color=AMBER_L, bold=True, font=SERIF)
    text(s, x + 0.3, y + 0.6, 3.1, 0.4, role, size=11, color=GREY_L, font=SANS)
    x += 3.95
    if i == 2:
        x = L
        y += 1.4
footer(s, '26')
notes(s, "Speaker 6: We are a team of six, covering backend architecture, business strategy, and frontend development.")

# ============= 27 — THANK YOU (Speaker 6) =============
s = bg_slide()
oval(s, 9.5, 3.4, 3.2, 3.2, PANEL)
oval(s, 9.95, 3.85, 2.3, 2.3, AMBER)
oval(s, 10.35, 4.25, 1.5, 1.5, BG)
text(s, 10.35, 4.55, 1.5, 0.9, 'V', size=52, color=AMBER_L, bold=True, align=PP_ALIGN.CENTER, font=SERIF)
text(s, L, 1.7, 10, 0.4, 'THANK YOU', size=13, color=AMBER, bold=True, font=SANS)
text(s, L, 2.2, 11, 2.0, 'Idle goods,\nheld in trust.', size=58, color=WHITE, bold=True, spacing=1.1, font=SERIF)
rect(s, L, 4.35, 1.5, 0.07, AMBER)
text(s, L, 4.65, 10, 1.0, 'A working product. A four-checkpoint plan.\nA neighbourhood that shares.', size=16, color=GREY_L, spacing=1.35, font=SANS)
text(s, L, 6.35, 11, 0.4, 'Grade  ·  Register  ·  Insure  ·  Arbitrate', size=12, color=AMBER_L, bold=True, font=SANS)
text(s, L, 6.85, 11, 0.35, 'Questions welcome.', size=12, color=GREY, italic=True, font=SANS)
notes(s, "Speaker 6: To finish, our goal is simple: One month, not thirty-six. Thank you for listening. We are ready for questions. (Wait for applause, then let the Lead Developer reveal the Trump Card if asked).")

prs.save('Rental_Vault_Presentation.pptx')
print('✓ Generated: Rental_Vault_Presentation.pptx')
print('  27 slides · 16:9 · speaker notes included')