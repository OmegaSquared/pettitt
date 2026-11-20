#!/usr/bin/env python3
"""
Pettitt Wealth static site generator.

Edit the page content below (or SITE settings), then run:
    python3 build.py
It writes the finished static site into ./docs (ready for GitHub Pages).
No dependencies beyond the Python standard library.
"""
import os, re, html, datetime

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "docs")

SITE = {
    "name": "Pettitt Wealth",
    "url": "https://www.pettittwealth.com",   # update if the site lives elsewhere
    "email": "eric@pettittwealth.com",
    "phone": "(480) 933-5277",
    "phone_tel": "+14809335277",
    "address_1": "4824 E. Baseline Rd., Suite 108-A",
    "address_2": "Mesa, AZ 85206",
    "map_link": "https://maps.app.goo.gl/wPQAgAWX3yoHbHv79",
    "map_embed": "https://maps.google.com/maps?q=4824%20E%20Baseline%20Rd%20Suite%20108-A%2C%20Mesa%2C%20AZ%2085206&t=&z=14&ie=UTF8&iwloc=&output=embed",
    "brokercheck": "https://brokercheck.finra.org/",
    "form_crs": "https://www.joincambridge.com/investors/cambridge-disclosures/form-crs/",
    "states": "AZ, CA, CO, IN, MO, MT, NM, SC, TX, and UT",
    "tagline": "Planning is bringing the future into the present so that you can do something about it now.",
}

MAILTO = (
    "mailto:{email}?subject=PETTITT%20WEALTH%20Conversation%20Request"
    "&body=Hello%20Eric%2C%0A%0AI%20would%20like%20to%20start%20a%20conversation%20with%20PETTITT%20WEALTH.%0A%0A"
    "Name%3A%20%0APhone%3A%20%0APreferred%20dates%20%2F%20times%3A%20%0AWhat%20I%27d%20like%20to%20discuss%3A%20%0A%0AThank%20you."
).format(email=SITE["email"])

# ----------------------------------------------------------------- icons
ICONS = {
    "clock": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    "compass": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>',
    "shield": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4.5 6v5.5c0 4.5 3.2 7.6 7.5 9.5 4.3-1.9 7.5-5 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/></svg>',
    "chart": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16M6 16V10M10 16V6M14 16v-4M18 16V8"/></svg>',
    "tree": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-6"/><path d="M8 15h8l-2-4h1l-3-5h-.5L8 11h1z"/><path d="M12 3v3"/></svg>',
    "home": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
    "table": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M10 10v9"/></svg>',
    "heart": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    "diamond": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12l4 5-10 11L2 9z"/><path d="M2 9h20M9 4l3 16M15 4l-3 16"/></svg>',
    "map": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s6-5.5 6-11a6 6 0 0 0-12 0c0 5.5 6 11 6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>',
    "mail": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    "phone": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    "calendar": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    "users": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 20a5 5 0 0 1 5-4.5"/></svg>',
    "balance": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M4 7h16M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/><path d="M8 21h8"/></svg>',
    "school": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c0 1.4 2.7 3 6 3s6-1.6 6-3v-5"/><path d="M22 9v6"/></svg>',
    "refresh": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/></svg>',
}
def icon(name, cls="icon"):
    return f'<div class="{cls}">{ICONS[name]}</div>'

# ----------------------------------------------------------------- layout
NAV = [("Home", "index.html"), ("Our Approach", "approach.html"), ("The Clock", "clock.html"),
       ("The Compass", "compass.html"), ("About", "about.html"), ("Team", "team.html"), ("Contact", "contact.html")]

def layout(page, title, description, body, active, extra_head="", body_class=""):
    nav_items = ""
    for label, href in NAV:
        cls = ' class="active"' if href == active else ""
        nav_items += f'<li><a href="{href}"{cls}>{label}</a></li>'
    canonical = SITE["url"].rstrip("/") + "/" + ("" if page == "index.html" else page)
    full_title = f"{title} | {SITE['name']}" if page != "index.html" else title
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(full_title)}</title>
<meta name="description" content="{html.escape(description)}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{SITE['name']}">
<meta property="og:title" content="{html.escape(full_title)}">
<meta property="og:description" content="{html.escape(description)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE['url'].rstrip('/')}/assets/img/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#162C49">
<link rel="icon" href="assets/img/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicon-32.png">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Raleway:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
{extra_head}
<link rel="stylesheet" href="assets/css/style.css">
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": "{SITE['name']}",
  "url": "{SITE['url']}",
  "email": "{SITE['email']}",
  "telephone": "{SITE['phone_tel']}",
  "image": "{SITE['url'].rstrip('/')}/assets/img/og-image.jpg",
  "address": {{
    "@type": "PostalAddress",
    "streetAddress": "{SITE['address_1']}",
    "addressLocality": "Mesa",
    "addressRegion": "AZ",
    "postalCode": "85206",
    "addressCountry": "US"
  }},
  "founder": {{ "@type": "Person", "name": "Eric Pettitt, CPFA", "jobTitle": "Founder & Wealth Manager" }}
}}
</script>
</head>
<body class="{body_class}">
<header class="site-header">
  <div class="container nav-wrap">
    <a class="brand" href="index.html" aria-label="{SITE['name']} home">
      <img src="assets/img/logo_white_horizontal.png" alt="{SITE['name']}" width="230" height="95">
    </a>
    <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">&#9776;</button>
    <ul class="nav-links">
      {nav_items}
      <li class="nav-cta"><a class="btn btn-gold btn-sm" href="contact.html">Start a Conversation</a></li>
    </ul>
  </div>
</header>
<main>
{body}
</main>
<footer class="site-footer">
  <div class="container">
    <div class="center"><a class="brokercheck" href="{SITE['brokercheck']}" target="_blank" rel="noopener noreferrer">Check the background of firms and investment professionals on FINRA&rsquo;s BrokerCheck</a></div>
    <div class="footer-grid">
      <div>
        <img class="footer-logo" src="assets/img/logo_white_horizontal.png" alt="{SITE['name']}" width="200" height="83">
        <p class="footer-tag">&ldquo;{SITE['tagline']}&rdquo; &mdash; Alan Lakein</p>
      </div>
      <div>
        <h4>Office</h4>
        <p>{SITE['address_1']}<br>{SITE['address_2']}</p>
        <p><a href="tel:{SITE['phone_tel']}">{SITE['phone']}</a><br><a href="mailto:{SITE['email']}">{SITE['email']}</a></p>
      </div>
      <div>
        <h4>Explore</h4>
        <ul>
          <li><a href="approach.html">Our Approach</a></li>
          <li><a href="about.html">About Pettitt Wealth</a></li>
          <li><a href="team.html">Our Team</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="privacy.html">Privacy Policy</a></li>
        </ul>
      </div>
    </div>
    <div class="disclosure">
      <p><strong>Disclosure for Pettitt Wealth.</strong> The content is developed from sources believed to be providing accurate information. The information in this material is not intended as tax or legal advice. Please consult legal or tax professionals for specific information regarding your individual situation. The opinions expressed and material provided are for general information and should not be considered a solicitation for the purchase or sale of any security.</p>
      <p>Fixed insurance services offered through Pettitt Wealth. Registered Representative, securities offered through Cambridge Investment Research, Inc., a Broker/Dealer, member <a href="https://www.finra.org/" target="_blank" rel="noopener noreferrer">FINRA</a> &amp; <a href="https://www.sipc.org/" target="_blank" rel="noopener noreferrer">SIPC</a>. Advisory Services offered through Cambridge Investment Research Advisers, Inc., a Registered Investment Adviser. Pettitt Wealth and Cambridge are not affiliated.</p>
      <p>This communication is strictly intended for individuals residing in the states of {SITE['states']}. No offers may be made or accepted from any resident outside the specific state(s) referenced. Cambridge does not offer tax or legal advice.</p>
    </div>
    <div class="footer-bottom">
      <span>&copy; <span id="year">{datetime.date.today().year}</span> {SITE['name']}. All rights reserved.</span>
      <span><a href="{SITE['form_crs']}" target="_blank" rel="noopener noreferrer">Cambridge Form CRS</a><a href="privacy.html">Privacy Policy</a></span>
    </div>
  </div>
</footer>
<script src="assets/js/main.js"></script>
</body>
</html>
"""

def page_hero(eyebrow, title, lead="", extra=""):
    return f"""
<section class="page-hero bg-deep on-dark">
  <div class="container">
    <div class="eyebrow">{eyebrow}</div>
    <h1>{title}</h1>
    {f'<p class="lead">{lead}</p>' if lead else ''}
    {extra}
  </div>
</section>"""

def cta_band(title="Let&rsquo;s Talk About What You&rsquo;re Building.",
             text=("Whether you&rsquo;re building wealth, preparing for retirement, navigating a business transition, or thinking about your family&rsquo;s future, the first step is getting to know your situation.",
                   "Let&rsquo;s talk about where you are, where you want to go, and whether PETTITT WEALTH is the right fit for you."),
             button="Start a Conversation"):
    paras = "".join(f'<p class="lead narrow">{t}</p>' for t in ((text,) if isinstance(text, str) else text))
    return f"""
<section class="cta-band">
  <div class="container">
    <div class="inner on-dark reveal">
      <div class="eyebrow">Let&rsquo;s Talk</div>
      <h2>{title}</h2>
      {paras}
      <div class="btn-group" style="justify-content:center;margin-top:1.4rem">
        <a class="btn btn-gold" href="contact.html">{button}</a>
        <a class="btn btn-outline" href="tel:{SITE['phone_tel']}">Call {SITE['phone']}</a>
      </div>
    </div>
  </div>
</section>"""

# ----------------------------------------------------------------- HOME
PILLARS = [
    ("chart", "Wealth Management &amp; Investment Management", "Develop a personalized approach to building and managing wealth, taking into account your goals, financial circumstances, time horizon, and risk considerations."),
    ("calendar", "Retirement Planning &amp; Distribution", "Prepare for retirement with a strategy that considers your desired timeline, income needs, financial resources, and plans for the years ahead."),
    ("shield", "Risk Management &amp; Insurance Review", "Evaluate financial risks and review existing insurance and annuity arrangements in the context of your broader financial picture."),
    ("tree", "Estate &amp; Legacy Planning", "Consider how your wealth fits into your long-term goals and coordinate with estate-planning professionals when appropriate."),
    ("table", "Business Retirement Plans &amp; Cash Management", "Explore retirement plan options for your business and consider how business cash reserves can be managed while accounting for operating expenses and liquidity needs."),
]
STEPS = [
    ("Understand Your Situation", "Start with a conversation about your financial circumstances, goals, priorities, concerns, and the timing of important decisions."),
    ("Examine the Details", "Review relevant financial information, identify planning considerations, and evaluate different scenarios and assumptions."),
    ("Develop a Personalized Strategy", "Build recommendations around your individual situation, objectives, time horizon, and risk considerations."),
    ("Coordinate the Moving Pieces", "When appropriate, work with your accountant, estate-planning attorney, or other professional advisors to coordinate related financial decisions."),
    ("Review as Life Changes", "Financial plans need to account for changing circumstances, goals, and market conditions. Ongoing reviews help determine whether adjustments may be appropriate."),
]

def home():
    pillars = "".join(f"""
      <div class="card card-gold reveal">
        {icon(ic)}
        <h3>{t}</h3>
        <p>{d}</p>
      </div>""" for ic, t, d in PILLARS)
    steps = "".join(f'<div class="step reveal"><h4>{t}</h4><p>{d}</p></div>' for t, d in STEPS)
    return f"""
<section class="hero on-dark">
  <video class="hero-video" autoplay muted playsinline preload="auto" poster="assets/img/hero-first.jpg" aria-hidden="true" tabindex="-1">
    <source src="assets/video/hero.webm" type="video/webm">
    <source src="assets/video/hero.mp4" type="video/mp4">
  </video>
  <div class="container hero-grid">
    <div class="hero-copy">
      <div class="eyebrow">Financial Planning &amp; Wealth Management in Mesa and Gilbert, Arizona</div>
      <h1>Go Beyond the Portfolio. Build Around <em>Your Life.</em></h1>
      <p class="lead">Your financial life is about more than investments. It includes your business, your family, your retirement, your goals, and the legacy you want to create.</p>
      <p>At PETTITT WEALTH, we work with entrepreneurs, business leaders, high-net-worth individuals, and people navigating important life transitions. Through personalized financial planning, investment management, and a thoughtful, data-driven approach, we help clients work through financial decisions with a clearer understanding of their options.</p>
      <div class="btn-group">
        <a class="btn btn-gold" href="contact.html">Start a Conversation</a>
        <a class="btn btn-outline" href="approach.html">Our Approach</a>
      </div>
      <div class="hero-values"><span>Dependable</span><span>Affluent</span><span>Strong</span></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container split">
    <div class="reveal">
      <div class="eyebrow">At Pettitt Wealth</div>
      <h2>Financial Planning for Entrepreneurs, Business Leaders &amp; Families</h2>
      <div class="rule left"></div>
      <p class="lead">Financial decisions often become more complex as your life and responsibilities evolve.</p>
      <p>You might be growing a business, accumulating wealth, preparing for retirement, navigating a business transition, funding education, or thinking about what you want to leave behind.</p>
      <p>PETTITT WEALTH works with entrepreneurs, business leaders, high-net-worth individuals, and people navigating significant life transitions to help them evaluate these decisions within the context of their broader financial goals.</p>
      <p>When appropriate, Eric collaborates with accountants and estate-planning attorneys to help coordinate the different professionals involved in your financial life.</p>
      <a class="btn btn-navy" href="about.html">About PETTITT WEALTH</a>
    </div>
    <div class="frame reveal"><img src="assets/img/eric.jpg" alt="Eric Pettitt, Founder &amp; Wealth Manager at PETTITT WEALTH" width="700" height="700"></div>
  </div>
</section>

<section class="section bg-navy on-dark">
  <div class="container">
    <div class="center narrow reveal">
      <div class="eyebrow">Two Instruments, One Plan</div>
      <h2>The Compass and the Clock.</h2>
      <div class="rule"></div>
      <p class="lead">A map shows the destination; the current hour dictates the pace. Our planning work is the <strong>Compass</strong> that keeps you pointed at true north, and our cycle-aware asset management is the <strong>Clock</strong> that sets the pace. No one can time the market &mdash; but we can adapt as the economic cycle transitions.</p>
    </div>

    <div class="split widget-split" style="margin-top:3.5rem">
      <div class="widget-frame reveal"><div data-widget="clock" data-theme="dark"></div></div>
      <div class="reveal">
        <div class="eyebrow">Asset Management</div>
        <h2>The <span class="gold">Clock</span> for active asset management.</h2>
        <div class="rule left"></div>
        <p class="lead">The engine of active management. We monitor historical business-cycle data to strive to align your allocation with current economic conditions &mdash; helping identify periods to pursue growth and periods to focus on preserving what you have.</p>
        <a class="btn btn-gold" href="clock.html">Explore the Clock</a>
      </div>
    </div>

    <div class="split widget-split reverse" style="margin-top:4.5rem">
      <div class="widget-frame reveal"><div data-widget="compass" data-theme="dark"></div></div>
      <div class="reveal">
        <div class="eyebrow">Financial Planning</div>
        <h2>The <span class="gold">Compass</span> for true north.</h2>
        <div class="rule left"></div>
        <p class="lead">Your destination is fixed, but the route needs care. The Compass is the human element: retirement analysis, estate and tax strategy, protection and legacy. It keeps your long-term trajectory aligned with your values regardless of market noise.</p>
        <a class="btn btn-gold" href="compass.html">Open the Compass Simulator</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="center narrow reveal">
      <div class="eyebrow">Beyond the Portfolio</div>
      <h2>A Comprehensive Approach to Building and Managing Wealth</h2>
      <div class="rule"></div>
      <p class="lead">Building wealth involves more than selecting investments. It means understanding how the different parts of your financial life work together.</p>
    </div>
    <div class="grid grid-center" style="margin-top:2.5rem">{pillars}</div>
    <div class="center" style="margin-top:2.4rem"><a class="btn btn-navy" href="approach.html#services">Explore Services &amp; Approach</a></div>
  </div>
</section>

<section class="section bg-white">
  <div class="container">
    <div class="center narrow reveal">
      <div class="eyebrow">Our Planning Process</div>
      <h2>How the PETTITT WEALTH Planning Process Works</h2>
      <div class="rule"></div>
    </div>
    <div class="wheel-wrap reveal" style="margin-top:1.5rem"><div data-widget="planning-wheel" data-theme="light"></div></div>
    <p class="small muted center">Hover or tap a segment to explore each step.</p>
    <noscript><div class="steps" style="margin-top:2.5rem">{steps}</div></noscript>
  </div>
</section>

<section class="section bg-navy on-dark">
  <div class="container center narrow reveal">
    <p class="quote">&ldquo;{SITE['tagline']}&rdquo;</p>
    <div class="quote-by">Alan Lakein</div>
  </div>
</section>

<section class="section">
  <div class="container split">
    <div class="reveal">
      <div class="eyebrow">The Fiduciary Standard</div>
      <h2>A Fiduciary Approach. A Personal Relationship.</h2>
      <div class="rule left"></div>
      <p class="lead">Eric believes financial planning should be built on integrity, transparency, and a genuine understanding of each client&rsquo;s circumstances.</p>
      <p>PETTITT WEALTH is intentional about the client relationships it takes on so Eric can dedicate meaningful time and attention to the people he serves.</p>
      <p>That means asking questions, explaining recommendations, and taking the time to understand what matters to you.</p>
      <p>You&rsquo;re not just an account number. You&rsquo;re a person with goals, responsibilities, and plans for the future.</p>
      <a class="btn btn-outline" href="about.html#eric">Meet Eric</a>
    </div>
    <div class="reveal">
      <div class="card">
        <div class="compliance">
          <a href="{SITE['brokercheck']}" target="_blank" rel="noopener noreferrer"><img src="assets/img/finra_brokercheck.png" alt="FINRA BrokerCheck" width="180" height="67"></a>
          <div class="crd">Verify on BrokerCheck<strong>Eric Pettitt, CPFA&reg;</strong></div>
        </div>
        <p class="small muted center" style="margin:1.4rem 0 0">Registered Representative with Cambridge Investment Research, Inc., member FINRA/SIPC. Advisory services through Cambridge Investment Research Advisers, Inc.</p>
      </div>
    </div>
  </div>
</section>

{cta_band()}
"""

# ----------------------------------------------------------------- APPROACH
STAGES = [
    ("Recovery", "The economy stabilizes after a recession. Earnings and consumer confidence begin a slow climb.", (55, 35, 10)),
    ("Early Expansion", "Growth accelerates as credit expands and production increases. A strong environment for risk assets.", (70, 25, 5)),
    ("Mid Expansion", "The economy reaches full stride. Profitability is high and credit is widely available.", (65, 30, 5)),
    ("Late Expansion", "Growth slows and inflation begins to rise. Risks shift as the cycle nears its historical peak.", (50, 35, 15)),
    ("Approaching Recession", "Indicators peak and begin to roll over. Transitioning to defensive positioning becomes critical.", (30, 40, 30)),
    ("Recession", "A period of contraction and peak uncertainty. Focus shifts to capital preservation and liquidity.", (20, 40, 40)),
]
# Our Approach service cards: (icon, title, blocks). A block is ("p", text), ("ul", [items]) or ("note", text);
# notes hold the service-specific qualifications from Karin's copy and must stay with their service.
PERSONAL_SERVICES = [
    ("chart", "Wealth Accumulation &amp; Investment Management", [
        ("p", "Building wealth requires a strategy that reflects your financial circumstances, objectives, time horizon, and tolerance for risk."),
        ("p", "Eric evaluates investment decisions within the context of the broader financial plan, incorporating detailed analysis and consideration of market and macroeconomic conditions."),
        ("p", "The aim is to develop an investment strategy aligned with your goals and circumstances, with ongoing attention to changing conditions and priorities.")]),
    ("calendar", "Retirement Planning", [
        ("p", "Retirement brings a different set of financial questions."),
        ("p", "When do you want to retire? What income might you need? How do your investments and other financial resources fit into your plans?"),
        ("p", "Eric works with clients to evaluate retirement scenarios, examine assumptions, and consider how their financial resources may support their retirement goals.")]),
    ("refresh", "Retirement Distribution", [
        ("p", "Moving from accumulating wealth to using it requires careful consideration."),
        ("p", "Retirement distribution planning examines income needs, withdrawal decisions, time horizons, and how assets may be used throughout retirement.")]),
    ("shield", "Risk Management", [
        ("p", "Financial risks can affect your ability to meet long-term goals."),
        ("p", "PETTITT WEALTH considers potential vulnerabilities within the broader financial plan and evaluates strategies for addressing them based on each client&rsquo;s situation.")]),
    ("balance", "Insurance &amp; Annuity Review", [
        ("p", "Insurance and annuities can play different roles in a financial strategy."),
        ("p", "Eric reviews existing arrangements and considers how coverage, costs, features, and potential limitations fit within the client&rsquo;s broader financial picture."),
        ("note", "Recommendations depend on individual circumstances and the services available through applicable providers.")]),
    ("school", "Educational Planning", [
        ("p", "Education funding can be an important family goal."),
        ("p", "Planning considers education costs alongside other priorities, including retirement, current cash flow, and long-term financial objectives.")]),
    ("tree", "Estate &amp; Legacy Planning Coordination", [
        ("p", "Estate and legacy considerations can influence how wealth is managed and transferred."),
        ("p", "Eric works with clients to incorporate their legacy objectives into the broader financial planning process and, when appropriate, coordinates with estate-planning attorneys and other professionals."),
        ("note", "PETTITT WEALTH does not provide legal advice or tax services on behalf of Cambridge.")]),
]
BUSINESS_SERVICES = [
    ("users", "Business Retirement Plans", [
        ("p", "A business retirement plan can affect employee benefits, business finances, and long-term planning for owners."),
        ("p", "PETTITT WEALTH can help business owners evaluate retirement plan options, including:"),
        ("ul", ["401(k) plans", "SEP IRAs", "SIMPLE IRAs"]),
        ("p", "The appropriate plan depends on the business structure, workforce, owner objectives, costs, and administrative requirements."),
        ("note", "Plan recommendations and implementation are subject to the firm&rsquo;s actual service capabilities and applicable provider arrangements.")]),
    ("table", "Business Cash Management", [
        ("p", "Business cash has a job to do. Some funds are needed for daily operations, while others may be set aside for future expenses or opportunities."),
        ("p", "PETTITT WEALTH helps business owners evaluate cash needs, liquidity requirements, time horizons, and financial objectives when considering options for business reserves."),
        ("p", "The goal is to understand how available cash can be managed while maintaining appropriate access to funds when the business needs them."),
        ("note", "Any cash-management strategy depends on the business&rsquo;s circumstances, the products or services selected, and the associated risks, costs, and liquidity terms.")]),
    ("diamond", "Business Transitions &amp; Wealth Planning", [
        ("p", "Business decisions and personal financial decisions are often closely connected."),
        ("p", "Growing a company, selling a business, changing ownership, or preparing for a transition can affect retirement planning, investment strategy, cash flow, and long-term wealth goals."),
        ("p", "Eric works with clients to examine these considerations together and coordinate with other professional advisors when appropriate.")]),
]

def service_cards(items):
    out = ""
    for ic, title, blocks in items:
        body = ""
        for kind, val in blocks:
            if kind == "p": body += f"<p>{val}</p>"
            elif kind == "ul": body += "<ul>" + "".join(f"<li>{v}</li>" for v in val) + "</ul>"
            elif kind == "note": body += f'<p class="note small muted">{val}</p>'
        out += f"""
      <div class="card card-gold service reveal">{icon(ic)}<h3>{title}</h3>{body}</div>"""
    return out

LOSSES = [(10, 11), (20, 25), (30, 43), (40, 67), (50, 100), (60, 150), (70, 233)]

def approach():
    stages = "".join(f"""
      <div class="stage reveal">
        <div class="n">0{i+1}</div><h4>{t}</h4><p>{d}</p>
        <div class="alloc" aria-hidden="true"><i class="eq" style="width:{a[0]}%"></i><i class="bd" style="width:{a[1]}%"></i><i class="cs" style="width:{a[2]}%"></i></div>
      </div>""" for i, (t, d, a) in enumerate(STAGES))
    rows = "".join(f"<tr><td>A {l}% loss</td><td>requires a {g}% gain</td></tr>" for l, g in LOSSES)
    return page_hero("Our Approach", "A Financial Strategy Built Around Your Bigger Picture.",
        "Financial planning involves more than managing investments. It requires understanding your goals, evaluating your options, and considering how decisions in one area may affect another.",
        extra="""<p>At PETTITT WEALTH, Eric Pettitt combines personalized financial planning, investment management, scenario analysis, and a data-driven perspective to help clients work through complex financial decisions.</p>
    <p>The process begins with understanding your situation and what you want your wealth to accomplish.</p>
    <div class="btn-group"><a class="btn btn-gold" href="contact.html">Start a Conversation</a></div>""") + f"""

<section class="section">
  <div class="container">
    <div class="center narrow reveal">
      <div class="eyebrow">Our Approach</div>
      <h2>Two Ways to Work With PETTITT WEALTH</h2>
      <div class="rule"></div>
    </div>
    <div class="grid grid-2" style="margin-top:2.5rem">
      <div class="card card-gold reveal">{icon("compass")}<h3>Clock and Compass</h3>
        <p>The Compass helps us plan around your goals. The Clock uses market and business cycles to inform investment decisions. Together, they offer one way to connect financial planning and investment management.</p>
        <div class="btn-group"><a class="btn btn-navy btn-sm" href="compass.html">Explore the Compass</a><a class="btn btn-outline btn-sm" href="clock.html">Explore the Clock</a></div>
      </div>
      <div class="card card-gold reveal">{icon("map")}<h3>A Strategy Shaped by Your Investment Philosophy</h3>
        <p>If you prefer a different way to invest, we can start with your goals, how you prefer to invest, and the risks you&rsquo;re comfortable taking. From there, we can explore a strategy suited to your circumstances.</p>
        <div class="btn-group"><a class="btn btn-outline btn-sm" href="contact.html">Start a Conversation</a></div>
      </div>
    </div>
  </div>
</section>

<section class="section bg-white">
  <div class="container narrow reveal">
    <div class="eyebrow">The Compass &middot; Financial Planning</div>
    <h2>A strategy based on now, then, and later.</h2>
    <div class="rule left"></div>
    <p class="lead">There is no one-size-fits-all approach to investing. We build plans for accumulation and for distribution, so we can serve clients from all walks of life.</p>
    <p>The Compass is the human side of the work: understanding your circumstances, selecting and prioritizing goals, analyzing the path you are on, and developing coordinated recommendations across retirement income, taxes, estate architecture, protection and legacy. We partner with your accountant and estate attorney so every aspect of your financial legacy is covered — with today&rsquo;s portfolio management strategies and asset-protection structures that let you keep more of your money where it belongs: in your hands.</p>
    <div class="btn-group"><a class="btn btn-gold" href="compass.html">Explore the Compass</a><a class="btn btn-outline" href="index.html#planning">Our planning process</a></div>
  </div>
</section>

<section class="section" id="services">
  <div class="container">
    <div class="center narrow reveal">
      <div class="eyebrow">Services</div>
      <h2>Personal Wealth Management</h2>
      <div class="rule"></div>
    </div>
    <div class="grid grid-center" style="margin-top:2.5rem">{service_cards(PERSONAL_SERVICES)}</div>
  </div>
</section>

<section class="section bg-white">
  <div class="container">
    <div class="center narrow reveal">
      <div class="eyebrow">Business Services</div>
      <h2>Business &amp; Executive Solutions</h2>
      <div class="rule"></div>
    </div>
    <div class="grid grid-3" style="margin-top:2.5rem">{service_cards(BUSINESS_SERVICES)}</div>
  </div>
</section>

<section class="section bg-deep on-dark">
  <div class="container">
    <div class="center narrow reveal">
      <div class="eyebrow">The Clock &middot; Asset Management</div>
      <h2>Navigating the business cycle.</h2>
      <div class="rule"></div>
      <p class="lead">Buy-and-hold is a static model subject to the whims of the market. We manage capital through the lens of the business cycle and strive to shift your positioning before the market forces your hand. Wealth isn&rsquo;t just about capturing the upside — it&rsquo;s about surviving the downside.</p>
    </div>
    <div class="stages" style="margin-top:2.5rem">{stages}</div>
    <div class="legend"><span><i class="eq"></i>Equities</span><span><i class="bd"></i>Bonds</span><span><i class="cs"></i>Cash</span></div>
    <p class="small center" style="margin-top:1.2rem;opacity:.7">Illustrative positioning by stage. Not a recommendation and not a guarantee of how any account will be allocated.</p>
    <div class="grid grid-2" style="margin-top:2.5rem">
      <div class="card on-dark reveal">{icon("refresh")}<h3>Dynamic Shifting</h3><p>We don&rsquo;t wait for market corrections to act. Early-warning signals in labor, production and consumption help us pivot from offense to defense with discipline rather than emotion.</p></div>
      <div class="card on-dark reveal">{icon("chart")}<h3>Data-Driven Discipline</h3><p>By quantifying where we are in the cycle, we strip emotion out of the investment process. Allocation decisions are rooted in economic data — so your legacy is protected by discipline, not hope.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container split">
    <div class="reveal">
      <div class="eyebrow">The Asymmetry of Risk</div>
      <h2>Recovering from large losses is harder than most investors think.</h2>
      <div class="rule left"></div>
      <p class="lead">Conventional wisdom says &ldquo;stay the course.&rdquo; Math says otherwise. Avoiding catastrophic losses is one of the most important factors in long-term compounding.</p>
      <p>A 50% loss requires a 100% gain just to break even. Catastrophic market losses are not random events — historically they are concentrated within economic recessions. That is why identifying the stage of the business cycle is our first priority: avoiding a recessionary drawdown can be the difference between consistent compounding and spending years merely trying to get back to even.</p>
    </div>
    <div class="reveal">
      <table class="table"><thead><tr><th>Portfolio decline</th><th>Return needed to recover</th></tr></thead><tbody>{rows}</tbody></table>
    </div>
  </div>
</section>

<section class="section bg-navy on-dark">
  <div class="container">
    <div class="center narrow reveal">
      <div class="eyebrow">Foundational Logic</div>
      <h2>The intertwined feedback loop.</h2>
      <div class="rule"></div>
      <p class="lead">Economic stability is driven by a self-reinforcing loop of income, consumption, production and employment. Our framework watches for the points where momentum shifts from expansion to inflection.</p>
    </div>
    <div class="loop" style="margin-top:2.5rem">
      <div class="card on-dark reveal"><h3 style="color:var(--gold)">Positive Feedback Loop</h3>
        <ul class="loop-list"><li>Rising income</li><li>More consumption</li><li>More production</li><li>More employment</li><li>Rising income &hellip; and the cycle reinforces itself</li></ul></div>
      <div class="card on-dark reveal"><h3 style="color:var(--gold)">Negative Feedback Loop</h3>
        <ul class="loop-list"><li>Falling income</li><li>Lower consumption</li><li>Lower production</li><li>Lower employment</li><li>Falling income &hellip; and contraction feeds on itself</li></ul></div>
    </div>
    <p class="center" style="margin-top:2rem"><strong>Does your current portfolio account for these loops?</strong></p>
    <div class="center" style="margin-top:1.2rem"><a class="btn btn-gold" href="clock.html">Explore the Clock in depth</a></div>
  </div>
</section>

<section class="section-tight">
  <div class="container narrow">
    <p class="small muted"><strong>Important:</strong> The business-cycle framework described here is for illustrative and educational purposes only. It relies on historical data, which is not a guarantee of future results, and should not be construed as a promise to predict market movements or time the market. Investing involves risk, including the possible loss of principal. No strategy assures success or protects against loss.</p>
  </div>
</section>

{cta_band("Let&rsquo;s Discuss Your Financial Goals.", "Whether you&rsquo;re managing personal wealth, preparing for retirement, evaluating a business retirement plan, or considering how to manage business cash reserves, the first step is understanding your situation.")}
"""

# ----------------------------------------------------------------- ABOUT
def about():
    return page_hero("Independent Branch", "About Pettitt Wealth",
        "Personal Financial Planning. Thoughtful Analysis. Genuine Relationships.") + f"""

<section class="section">
  <div class="container split">
    <div class="reveal">
      <div class="eyebrow">At Pettitt Wealth</div>
      <h2>Financial Planning Built Around You</h2>
      <div class="rule left"></div>
      <p class="lead">At PETTITT WEALTH, financial planning starts with understanding the person behind the numbers.</p>
      <p>We work with entrepreneurs, business leaders, high-net-worth individuals, and people navigating important life transitions. Our approach combines detailed financial analysis with personal attention, helping clients evaluate their options in the context of their individual goals and circumstances.</p>
      <p>The philosophy is straightforward: take the time to understand the situation, dig into the details, and build a strategy around what matters most.</p>
    </div>
    <div class="reveal">
      <div class="card on-dark bg-deep" style="padding:2.5rem">
        <img src="assets/img/logo_gold_stacked.png" alt="PETTITT WEALTH" style="width:180px;margin:0 auto" width="180" height="236">
      </div>
    </div>
  </div>
</section>

<section class="section bg-white">
  <div class="container">
    <div class="center narrow reveal">
      <div class="eyebrow">Our Values</div>
      <h2>The Values Behind the Relationship</h2>
      <div class="rule"></div>
    </div>
    <div class="grid grid-center" style="margin-top:2.5rem">
      <div class="card card-gold reveal">{icon("shield")}<h3>Fiduciary Integrity</h3><p>Approach financial advice with integrity, transparency, and attention to each client&rsquo;s circumstances and objectives.</p></div>
      <div class="card card-gold reveal">{icon("users")}<h3>Intentional Focus</h3><p>Work with a select group of clients to support meaningful personal attention and direct communication.</p></div>
      <div class="card card-gold reveal">{icon("diamond")}<h3>Transparency &amp; Clarity</h3><p>Make financial conversations approachable and recommendations understandable, so clients can ask questions and participate in decisions.</p></div>
      <div class="card card-gold reveal">{icon("compass")}<h3>Comprehensive Planning</h3><p>Consider how investments, retirement, business finances, insurance, and estate considerations fit together rather than viewing each decision in isolation.</p></div>
      <div class="card card-gold reveal">{icon("heart")}<h3>Personal Relationships</h3><p>Build long-term relationships through listening, honest conversations, and an understanding of what matters to each client.</p></div>
    </div>
  </div>
</section>

<section class="section bg-navy on-dark">
  <div class="container narrow center reveal">
    <h2>A Financial Planning Relationship Built Around You</h2>
    <div class="rule"></div>
    <p class="lead">PETTITT WEALTH is built on the belief that clients deserve to be understood as individuals.</p>
    <p>That means taking the time to ask questions, examine the details, discuss options, and consider how financial decisions connect to the bigger picture.</p>
    <p>When appropriate, Eric collaborates with accountants and estate-planning attorneys to help coordinate the professionals involved in a client&rsquo;s financial life.</p>
    <p><strong>Every client is different. Every financial plan should be personal.</strong></p>
  </div>
</section>

<section class="section" id="eric">
  <div class="container">
    <div class="eyebrow center">About Eric Pettitt</div>
    <h2 class="center">Meet Eric Pettitt</h2>
    <div class="rule"></div>
    <div class="bio" style="margin-top:2.5rem">
      <div class="reveal">
        <img src="assets/img/eric.jpg" alt="Eric Pettitt, Founder &amp; Wealth Manager at PETTITT WEALTH" width="700" height="700">
        <div class="card" style="margin-top:1.2rem;padding:1.4rem 1.6rem">
          <div class="eyebrow" style="margin-bottom:.4rem">Eric Pettitt, CPFA&reg;</div>
          <p class="small muted" style="margin:0">Founder &amp; Wealth Manager</p>
          <p class="small" style="margin:.8rem 0 0"><a href="mailto:{SITE['email']}">{SITE['email']}</a><br><a href="tel:{SITE['phone_tel']}">{SITE['phone']}</a></p>
        </div>
      </div>
      <div class="reveal">
        <p class="lead">Eric Pettitt helps individuals, families, entrepreneurs, and business leaders evaluate financial decisions in the context of their goals, responsibilities, and plans.</p>
        <p>He starts by asking about your business, family, values, and concerns. Then he models scenarios, tests assumptions, and considers the broader economic environment to help you understand your options.</p>
        <p>Eric has more than a decade of experience advising clients on financial decisions. He combines detailed analysis with personal attention so recommendations reflect what matters to you.</p>
        <h3>Connected to the Arizona Business Community</h3>
        <p>Eric believes relationships and service extend beyond financial planning.</p>
        <p>He is actively involved with organizations including:</p>
        <ul>
          <li>Gilbert Chamber of Commerce, including its Public Policy Committee</li>
          <li>West and Southeast REALTORS&reg; of the Valley (WeSERV)</li>
          <li>Above Par Networking</li>
          <li>Elite Business Alliance</li>
        </ul>
        <p>Through these organizations, Eric connects with local professionals and business leaders across Arizona. His commitment to relationship-building and community involvement carries into his work with clients.</p>
        <div class="compliance" style="justify-content:flex-start;margin-top:1.6rem">
          <a href="{SITE['brokercheck']}" target="_blank" rel="noopener noreferrer"><img src="assets/img/finra_brokercheck.png" alt="FINRA BrokerCheck" width="160" height="59"></a>
          <span class="small muted">Check Eric&rsquo;s background on FINRA&rsquo;s BrokerCheck.</span>
        </div>
      </div>
    </div>
  </div>
</section>

{cta_band("Let&rsquo;s Get to Know Each Other.", "If you&rsquo;re looking for a financial planning relationship that combines personal attention, detailed analysis, and an understanding of your goals, let&rsquo;s start with a conversation.", button="Contact Eric")}
"""

# ----------------------------------------------------------------- TEAM
TEAM = [
    ("eric.jpg", "Eric Pettitt, CPFA&reg;", "Founder &amp; Wealth Manager",
     "Eric Pettitt is a fiduciary Financial Planner and Certified Plan Fiduciary Advisor (CPFA) with more than a decade of experience advising individuals, families, entrepreneurs, and business leaders.",
     [("mailto:" + SITE["email"], SITE["email"]), ("tel:" + SITE["phone_tel"], SITE["phone"])], "Mesa, AZ", "about.html#eric"),
    ("aaron.jpg", "Aaron Soderstrom", "Chief Investment Strategist &middot; Advisory Partner",
     "Architect of the cycle-aware investment framework behind the Clock, blending quantitative rigor with behavioral insight to navigate market cycles.",
     [], "Keller, TX", None),
    ("danielle.jpg", "Danielle Noonan, FPQP&trade;", "Chief Operations Officer",
     "Orchestrating the Pettitt Wealth client experience &mdash; committed to white-glove service and fostering deep, lasting client relationships.",
     [("mailto:dn@pettittwealth.com", "dn@pettittwealth.com"), ("tel:+14809335277", "(480) 933-5277")], "Mesa, AZ", None),
    ("chet.jpg", "Chet Teichman, CFP&reg;, ChFC&reg;, AIF&reg;", "Trader &middot; Advisory Partner",
     "Executes the portfolio strategy with discipline, bringing holistic planning experience and financial clarity across every stage of life&rsquo;s transitions.",
     [], "Keller, TX", None),
]
def team():
    cards = ""
    for img, name, role, desc, contacts, loc, link in TEAM:
        c = "".join(f'<a href="{h}">{t}</a>' for h, t in contacts)
        nm = f'<a href="{link}">{name}</a>' if link else name
        cards += f"""
      <div class="card member reveal">
        <img src="assets/img/{img}" alt="{html.unescape(name)}" width="180" height="180">
        <div class="role">{role}</div>
        <h3 style="margin:0 0 .5rem">{nm}</h3>
        <p class="small muted">{desc}</p>
        <div class="contact">{c}<span>{loc}</span></div>
      </div>"""
    return page_hero("Our Team", "The people behind your plan.",
        "A small, hands-on team in Mesa, Arizona, supported by advisory partners who bring investment research and planning depth to every relationship.") + f"""
<section class="section">
  <div class="container">
    <div class="team-grid">{cards}</div>
    <p class="small muted center" style="margin-top:2rem">To reach any member of the team, contact Pettitt Wealth at <a href="mailto:{SITE['email']}">{SITE['email']}</a> or <a href="tel:{SITE['phone_tel']}">{SITE['phone']}</a>.</p>
  </div>
</section>
{cta_band("Let&rsquo;s Start a Conversation.", "Whether you are building wealth, preparing for retirement, or planning for your family&rsquo;s future, the first step is getting to know your situation.")}
"""

# ----------------------------------------------------------------- CONTACT
def contact():
    return page_hero("Contact PETTITT WEALTH", "Let&rsquo;s Talk About Your Financial Goals.",
        "Whether you&rsquo;re building wealth, preparing for retirement, navigating a business transition, or thinking about your family&rsquo;s future, the first step is getting to know your situation.",
        extra="<p>Call or email Eric directly, or use the form below to prepare an email request.</p>") + f"""
<section class="section-tight">
  <div class="container contact-cards">
    <div class="contact-card reveal">{icon("map")}<div><div class="label">Primary Office</div><a href="{SITE['map_link']}" target="_blank" rel="noopener noreferrer">{SITE['address_1']}<br>{SITE['address_2']}</a></div></div>
    <div class="contact-card reveal">{icon("mail")}<div><div class="label">Email</div><a href="mailto:{SITE['email']}">{SITE['email']}</a></div></div>
    <div class="contact-card reveal">{icon("phone")}<div><div class="label">Phone</div><a href="tel:{SITE['phone_tel']}">{SITE['phone']}</a></div></div>
  </div>
</section>

<section class="section">
  <div class="container split" style="align-items:start">
    <div class="reveal">
      <div class="eyebrow">Start a Conversation</div>
      <h2>Tell Us What You&rsquo;d Like to Discuss.</h2>
      <div class="rule left"></div>
      <p class="muted">Complete the details below, then select &ldquo;Open Email Request.&rdquo; Your email app will open a message to Eric. Review it and press Send in your email app to deliver your request.</p>
      <form id="appointment-form" class="form" data-to="{SITE['email']}" novalidate>
        <div class="form-row">
          <div><label for="f-name">Full name</label><input id="f-name" name="name" type="text" autocomplete="name" required></div>
          <div><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
        </div>
        <div class="form-row">
          <div><label for="f-phone">Phone (optional)</label><input id="f-phone" name="phone" type="tel" autocomplete="tel"></div>
          <div><label for="f-topic">What would you like to discuss?</label>
            <select id="f-topic" name="topic">
              <option>General consultation</option>
              <option>Financial planning</option>
              <option>Retirement income</option>
              <option>Investment management</option>
              <option>Insurance &amp; protection</option>
              <option>Estate &amp; legacy planning</option>
              <option>Second opinion on my current plan</option>
            </select></div>
        </div>
        <div><label for="f-when">Preferred dates / times</label><input id="f-when" name="when" type="text" placeholder="e.g. Tuesday or Thursday afternoons"></div>
        <div><label for="f-message">Anything else we should know?</label><textarea id="f-message" name="message"></textarea></div>
        <div><button class="btn btn-gold" type="submit">{ICONS['mail'].replace('<svg','<svg width="18" height="18"')} Open Email Request</button></div>
        <p id="form-status" class="form-note" aria-live="polite">If your email app does not open, email <a href="mailto:{SITE['email']}">{SITE['email']}</a> or call <a href="tel:{SITE['phone_tel']}">{SITE['phone']}</a>.</p>
      </form>
    </div>
    <div class="reveal">
      <div class="map"><iframe title="Map to Pettitt Wealth office" src="{SITE['map_embed']}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
      <div class="card" style="margin-top:1.4rem">
        <h4>What to expect</h4>
        <p class="small muted">The first step is a conversation about where you are, where you want to go, and whether PETTITT WEALTH is the right fit for you.</p>
        <p class="small muted" style="margin:0">We serve clients residing in {SITE['states']}.</p>
      </div>
    </div>
  </div>
</section>
"""

# ----------------------------------------------------------------- PRIVACY
def privacy():
    return page_hero("Legal", "Privacy Policy", "Effective date: September 21, 2026") + f"""
<section class="section">
  <div class="container narrow prose">
    <h2>1. Introduction</h2>
    <p>Pettitt Wealth (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains what we collect, how we use it, and the choices you have. Securities are offered through Cambridge Investment Research, Inc., member FINRA/SIPC; advisory services are offered through Cambridge Investment Research Advisers, Inc., a Registered Investment Adviser. Cambridge and Pettitt Wealth are not affiliated.</p>

    <h2>2. Information We Collect</h2>
    <h3>Website Data</h3>
    <p>This website is a static informational site. It does not use contact forms that transmit data to us, and it does not set tracking cookies of its own. Our web host may automatically log IP addresses, browser type, device information and pages visited for security and operational purposes. Embedded third-party content (for example a map) is governed by that provider&rsquo;s privacy policy.</p>
    <h3>Personal Information</h3>
    <p>When you email us, call us, schedule a meeting, become a client, or otherwise communicate with us, we may collect information such as your name, postal address, email address, phone number, employment information, and financial information necessary to provide our services.</p>
    <h3>Communication Data</h3>
    <p>We collect and store the content of communications with you &mdash; including emails and <strong>SMS/text-message conversations</strong> &mdash; for regulatory compliance, recordkeeping, supervision, and legitimate business purposes. By communicating with us through these channels, you acknowledge that your messages will be retained.</p>

    <h2>3. How We Use Your Information</h2>
    <p>We use the information we collect to deliver and administer our services, respond to your inquiries, schedule and conduct meetings, provide market and account-related updates, comply with legal and regulatory obligations, supervise and audit communications, and detect and prevent fraud or unauthorized activity.</p>

    <h2>4. Mobile Messaging (SMS) Disclosure</h2>
    <p>If you provide us with a mobile phone number, you authorize Pettitt Wealth to send SMS/text messages to that number.</p>
    <ul>
      <li><strong>Purpose.</strong> Messages may include informational alerts, appointment confirmations and reminders, account-related notices, and operational communications related to the services we provide.</li>
      <li><strong>Frequency.</strong> Message frequency varies based on your account activity and the topics you have requested.</li>
      <li><strong>Costs.</strong> Message and data rates may apply. Your wireless carrier&rsquo;s standard rates and fees will apply to any messages you send or receive.</li>
      <li><strong>Opt-Out and Help.</strong> You may opt out at any time by replying <strong>STOP</strong> to any message. For assistance, reply <strong>HELP</strong> or contact us at <a href="mailto:{SITE['email']}">{SITE['email']}</a> or {SITE['phone']}.</li>
      <li><strong>Consent.</strong> Your consent to receive SMS messages is not a condition of purchasing any product or service. Carriers are not liable for delayed or undelivered messages.</li>
    </ul>
    <p class="small muted">We do not share mobile opt-in data or consent information with third parties or affiliates for their marketing purposes.</p>

    <h2>5. Regulatory Archiving Notice</h2>
    <p>Communications between you and Pettitt Wealth &mdash; including email, text messages, and other electronic correspondence &mdash; are subject to regulatory oversight by FINRA, the SEC, state regulators, and our broker-dealer (Cambridge Investment Research, Inc.). These communications are captured, retained, and supervised in compliance with applicable books-and-records and recordkeeping rules.</p>

    <h2>6. Third-Party Sharing</h2>
    <p><strong>We do not sell your personal information.</strong> We share information only as needed to operate our business, including with:</p>
    <ul>
      <li>Our broker-dealer and registered investment adviser, Cambridge Investment Research, and its affiliates, for supervision, clearing, and recordkeeping.</li>
      <li>Service providers under written confidentiality obligations &mdash; for example, our CRM, email and messaging platforms, archiving and compliance vendors, custodians, and IT/hosting providers &mdash; solely to perform services on our behalf.</li>
      <li>Regulators, law enforcement, courts, and other parties when required by law, subpoena, or to protect our legal rights.</li>
    </ul>

    <h2>7. Your Choices</h2>
    <p>You may opt out of marketing emails by following the unsubscribe link in any message, opt out of SMS by replying STOP, and request access to or correction of your personal information by contacting us. Note that recordkeeping and regulatory rules may require us to retain certain information even after you ask us to delete it.</p>

    <h2>8. Contact Us</h2>
    <p>Pettitt Wealth<br>{SITE['address_1']}, {SITE['address_2']}<br><a href="mailto:{SITE['email']}">{SITE['email']}</a> &middot; {SITE['phone']}</p>

    <h2>9. Changes to This Policy</h2>
    <p>We may update this Privacy Policy from time to time. The &ldquo;Effective Date&rdquo; above indicates when the policy was last revised. Material changes will be communicated through the website or, where appropriate, by direct notice.</p>
  </div>
</section>
"""

TOOL_HEAD = """<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">"""

def tool_page(kind):
    """Mount point for the interactive React page (built by tools/ into docs/tools/app.js)."""
    return f"""
<div id="tool-root" data-page="{kind}" data-mailto="{MAILTO}"></div>
<noscript><section class="section center"><div class="container narrow"><p class="lead">This interactive page needs JavaScript. Please enable it, or <a href="contact.html">contact us</a> and we will walk you through it in person.</p></div></section></noscript>
<script src="tools/app.js" defer></script>"""

def clock(): return tool_page("clock")
def compass(): return tool_page("compass")

def notfound():
    return f"""
<section class="section center" style="min-height:50vh">
  <div class="container narrow">
    <div class="eyebrow">404</div>
    <h1>We couldn&rsquo;t find that page.</h1>
    <p class="lead">The link may be out of date. Head back home or get in touch and we will point you in the right direction.</p>
    <div class="btn-group" style="justify-content:center"><a class="btn btn-navy" href="index.html">Back to Home</a><a class="btn btn-outline" href="contact.html">Contact Us</a></div>
  </div>
</section>"""

# ----------------------------------------------------------------- build
PAGES = [
    ("index.html", "Pettitt Wealth | Financial Planning & Wealth Management, Mesa & Gilbert AZ",
     "PETTITT WEALTH provides financial planning and wealth management in Mesa and Gilbert, Arizona for entrepreneurs, business leaders, high-net-worth individuals and families.", home),
    ("approach.html", "Our Approach", "How PETTITT WEALTH approaches financial planning and investment management, with personal wealth management and business services for owners and executives.", approach),
    ("clock.html", "The Clock: Cycle-Aware Asset Management", "The Clock is how Pettitt Wealth reads the business cycle: six economic stages, the asymmetry of losses, and the feedback loops that drive markets.", clock),
    ("compass.html", "The Compass: Retirement Planning Simulator", "The Compass is Pettitt Wealth's interactive planning simulator: design your blueprint, run Monte Carlo projections, and see the probability of meeting your goals.", compass),
    ("about.html", "About Pettitt Wealth & Eric Pettitt", "Learn about PETTITT WEALTH, the values behind our client relationships, and founder and wealth manager Eric Pettitt of Mesa, Arizona.", about),
    ("team.html", "Our Team", "Meet Eric Pettitt, Danielle Noonan and the advisory partners behind Pettitt Wealth.", team),
    ("contact.html", "Contact", "Start a conversation with PETTITT WEALTH in Mesa, AZ. Call (480) 933-5277 or email eric@pettittwealth.com.", contact),
    ("privacy.html", "Privacy Policy", "How Pettitt Wealth collects, uses and protects client information.", privacy),
    ("404.html", "Page Not Found", "The page you requested could not be found.", notfound),
]

BRAND_RX = re.compile(r"Pettitt Wealth", re.I)

def brandify(doc):
    """Force the firm name to PETTITT WEALTH everywhere. In visible text it is wrapped in
    <span class="brand-name"> (logo serif, letter-spaced); in attributes, <title>, scripts
    and styles it is plain upper-case."""
    out, plain = [], False
    for seg in re.split(r"(<[^>]*>)", doc):
        if seg.startswith("<"):
            tag = seg[1:].split()[0].lower().strip("/>") if len(seg) > 1 else ""
            if tag in ("title", "script", "style"): plain = True
            if seg.startswith("</") and tag in ("title", "script", "style"): plain = False
            out.append(BRAND_RX.sub("PETTITT WEALTH", seg))
        else:
            out.append(BRAND_RX.sub("PETTITT WEALTH" if plain else '<span class="brand-name">PETTITT WEALTH</span>', seg))
    return "".join(out)

def main():
    os.makedirs(OUT, exist_ok=True)
    for fname, title, desc, fn in PAGES:
        body = fn()
        if fname == "index.html":
            body = body.replace('<section class="section bg-white">', '<section class="section bg-white" id="planning">', 1)
        active = fname if fname != "404.html" else ""
        is_tool = fname in ("clock.html", "compass.html")
        if fname == "index.html":
            body += '\n<script src="tools/widgets.js" defer></script>' 
        with open(os.path.join(OUT, fname), "w", encoding="utf-8") as f:
            f.write(brandify(layout(fname, title, desc, body, active,
                           extra_head=TOOL_HEAD if is_tool else "", body_class="tool-page" if is_tool else "")))
        print("wrote", fname)
    base = SITE["url"].rstrip("/")
    with open(os.path.join(OUT, "sitemap.xml"), "w") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for fname, *_ in PAGES:
            if fname == "404.html": continue
            loc = base + "/" + ("" if fname == "index.html" else fname)
            f.write(f"  <url><loc>{loc}</loc><lastmod>{datetime.date.today()}</lastmod></url>\n")
        f.write("</urlset>\n")
    with open(os.path.join(OUT, "robots.txt"), "w") as f:
        f.write(f"User-agent: *\nAllow: /\nSitemap: {base}/sitemap.xml\n")
    open(os.path.join(OUT, ".nojekyll"), "w").close()
    print("done ->", OUT)

if __name__ == "__main__":
    main()
