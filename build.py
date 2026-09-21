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
    "mailto:{email}?subject=Appointment%20Request%20%E2%80%94%20Pettitt%20Wealth"
    "&body=Hello%20Eric%2C%0A%0AI%20would%20like%20to%20schedule%20an%20appointment%20with%20Pettitt%20Wealth.%0A%0A"
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
  "founder": {{ "@type": "Person", "name": "Eric Pettitt, CPFA", "jobTitle": "Financial Advisor" }}
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
      <li class="nav-cta"><a class="btn btn-gold btn-sm" href="{MAILTO}">Schedule an Appointment</a></li>
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
          <li><a href="contact.html">Contact &amp; Scheduling</a></li>
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

def page_hero(eyebrow, title, lead=""):
    return f"""
<section class="page-hero bg-deep on-dark">
  <div class="container">
    <div class="eyebrow">{eyebrow}</div>
    <h1>{title}</h1>
    {f'<p class="lead">{lead}</p>' if lead else ''}
  </div>
</section>"""

def cta_band(title="Ready to start the conversation?", text="A first meeting is simply a conversation about where you are, where you want to go, and whether we are the right fit to help you get there.", button="Schedule an Appointment"):
    return f"""
<section class="cta-band">
  <div class="container">
    <div class="inner on-dark reveal">
      <div class="eyebrow">Let&rsquo;s Talk</div>
      <h2>{title}</h2>
      <p class="lead narrow">{text}</p>
      <div class="btn-group" style="justify-content:center;margin-top:1.4rem">
        <a class="btn btn-gold" href="{MAILTO}">{button}</a>
        <a class="btn btn-outline" href="tel:{SITE['phone_tel']}">Call {SITE['phone']}</a>
      </div>
    </div>
  </div>
</section>"""

# ----------------------------------------------------------------- HOME
PILLARS = [
    ("home", "Estate Planning", "Coordinate wealth-transfer strategies so that what you have built survives for generations, not just years."),
    ("table", "Tax Strategy", "Identify proactive tax opportunities to help maximize your net-spendable wealth at every stage of the cycle."),
    ("shield", "Risk Protection", "Insurance and protection structures that help defend your core assets from market and liability hazards."),
    ("chart", "Retirement Analysis", "Quantitative modeling to help your lifestyle endure regardless of longevity or market volatility."),
    ("heart", "Legacy &amp; Giving", "Put your family values and charitable impact into a structured, values-based plan."),
    ("diamond", "Special Situations", "Tailored strategies for liquidity events, concentrated stock positions, and non-traditional assets."),
]
STEPS = [
    ("Understanding Your Circumstances", "We gather the quantitative and qualitative facts — cash flow, assets, liabilities, taxes, and just as importantly your values, family dynamics and expectations."),
    ("Identifying &amp; Selecting Goals", "Goals often compete. We define and prioritize them together, and weigh the trade-offs between them."),
    ("Analyzing Your Current Path", "We evaluate the course you are on against the alternatives, looking for both the advantages and the fatal flaws."),
    ("Developing Recommendations", "Specific, coordinated strategies designed to raise your probability of success — each measured by its contribution to your goals."),
    ("Presenting the Roadmap", "A clear, visual review of the proposed plan, the assumptions behind it, and the probabilities it implies."),
    ("Implementing", "Execution through shared responsibility, coordinating with your accountant, attorney and other specialists."),
    ("Monitoring &amp; Updating", "Life changes and so do markets. Periodic reviews keep the plan calibrated to both."),
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
      <div class="eyebrow">Independent Financial Planning &middot; Mesa, Arizona</div>
      <h1>Wealth planning built around <em>your</em> life, not a product.</h1>
      <p class="lead">Pettitt Wealth offers impartial, objective guidance and a completely integrated approach to building, protecting and passing on your wealth — from a true fiduciary who listens first.</p>
      <div class="btn-group">
        <a class="btn btn-gold" href="{MAILTO}">Schedule an Appointment</a>
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
      <h2>We grasp the intricacies of financial markets — and guide you through them with assurance.</h2>
      <div class="rule left"></div>
      <p class="lead">We offer impartial, objective guidance alongside a variety of investment and insurance products customized to your needs and aspirations. Through thorough financial planning, we help you define your objectives, devise strategies, and make well-informed choices for your financial well-being.</p>
      <p>Our investment strategy merges macroeconomic scrutiny with strategic asset allocation, leveraging data-driven insights to enhance portfolios and manage risk. Emphasizing risk management, we help safeguard your investments during market declines while aiming to position you for growth during recoveries. Whether you are an individual or an institution, we deliver tailored solutions that resonate with your specific aims and risk tolerance — because every client is unique.</p>
      <a class="btn btn-navy" href="about.html">About Pettitt Wealth</a>
    </div>
    <div class="frame reveal"><img src="assets/img/eric.jpg" alt="Eric Pettitt, Financial Advisor" width="700" height="700"></div>
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
      <h2>Comprehensive wealth planning.</h2>
      <div class="rule"></div>
      <p class="lead">Wealth management at this level means applying the same care to every facet of your financial life. We secure the foundation so you can build the legacy.</p>
    </div>
    <div class="grid grid-3" style="margin-top:2.5rem">{pillars}</div>
  </div>
</section>

<section class="section bg-white">
  <div class="container">
    <div class="center narrow reveal">
      <div class="eyebrow">Our Planning Process</div>
      <h2>Seven steps, repeated for life.</h2>
      <div class="rule"></div>
      <p class="lead">True financial planning is not a one-time event but a continuous cycle of discovery, analysis and execution. We follow a rigorous protocol so your plan is resilient to real-world complexity.</p>
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
      <h2>Your interests come first. Always.</h2>
      <div class="rule left"></div>
      <blockquote class="pull-quote">
        <p>&ldquo;When you do the right things in the right way, you have nothing to lose because you have nothing to fear.&rdquo;</p>
        <cite>Zig Ziglar</cite>
      </blockquote>
      <p class="lead">Eric has the knowledge and background to be a true fiduciary, and prides himself on looking out for his clients&rsquo; best interests. You will always know who is building your strategy — because the person who designs it is the person you talk to.</p>
      <a class="btn btn-outline" href="team.html">Meet the Team</a>
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
LOSSES = [(10, 11), (20, 25), (30, 43), (40, 67), (50, 100), (60, 150), (70, 233)]

def approach():
    stages = "".join(f"""
      <div class="stage reveal">
        <div class="n">0{i+1}</div><h4>{t}</h4><p>{d}</p>
        <div class="alloc" aria-hidden="true"><i class="eq" style="width:{a[0]}%"></i><i class="bd" style="width:{a[1]}%"></i><i class="cs" style="width:{a[2]}%"></i></div>
      </div>""" for i, (t, d, a) in enumerate(STAGES))
    rows = "".join(f"<tr><td>A {l}% loss</td><td>requires a {g}% gain</td></tr>" for l, g in LOSSES)
    return page_hero("Our Approach", "Planning for true north. Managing for the hour.",
        "Two instruments working together: the Compass, which is our planning discipline, and the Clock, which is our cycle-aware approach to managing your assets.") + f"""

<section class="section">
  <div class="container split">
    <div class="reveal">
      <div class="eyebrow">The Compass &middot; Financial Planning</div>
      <h2>A strategy based on now, then, and later.</h2>
      <div class="rule left"></div>
      <p class="lead">There is no one-size-fits-all approach to investing. We build plans for accumulation and for distribution, so we can serve clients from all walks of life.</p>
      <p>The Compass is the human side of the work: understanding your circumstances, selecting and prioritizing goals, analyzing the path you are on, and developing coordinated recommendations across retirement income, taxes, estate architecture, protection and legacy. We partner with your accountant and estate attorney so every aspect of your financial legacy is covered — with today&rsquo;s portfolio management strategies and asset-protection structures that let you keep more of your money where it belongs: in your hands.</p>
      <div class="btn-group"><a class="btn btn-gold" href="compass.html">Open the Compass Simulator</a><a class="btn btn-outline" href="index.html#planning">The seven-step process</a></div>
    </div>
    <div class="reveal">
      <div class="grid" style="gap:1rem">
        <div class="card card-navy" style="padding:1.4rem 1.6rem">{icon("home","icon navy")}<h4 style="margin-top:.6rem">Estate Architecture</h4><p class="small muted">Generational wealth transfer</p></div>
        <div class="card card-navy" style="padding:1.4rem 1.6rem">{icon("balance","icon navy")}<h4 style="margin-top:.6rem">Tax Strategy</h4><p class="small muted">Efficiency at every cycle stage</p></div>
        <div class="card card-navy" style="padding:1.4rem 1.6rem">{icon("chart","icon navy")}<h4 style="margin-top:.6rem">Retirement Analysis</h4><p class="small muted">Accumulation through distribution</p></div>
      </div>
    </div>
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

{cta_band("Want to know where you stand?", "Bring your current statements and we will walk through how your portfolio and plan line up with the cycle — no obligation.")}
"""

# ----------------------------------------------------------------- ABOUT
def about():
    return page_hero("Independent Branch", "About Pettitt Wealth",
        "An independent financial planning practice in Mesa, Arizona, built on listening, math, and doing right by the people we serve.") + f"""

<section class="section">
  <div class="container split">
    <div class="reveal">
      <div class="eyebrow">At Pettitt Wealth</div>
      <h2>Guidance you can rely on, at every step of the journey.</h2>
      <div class="rule left"></div>
      <p class="lead">We grasp the intricacies of financial markets and are committed to guiding clients through their financial journey with assurance. We offer impartial, objective guidance alongside a variety of investment and insurance products customized to individual client needs and aspirations.</p>
      <p>Through our thorough financial planning services, we assist clients in defining their objectives, devising strategies, and making well-informed choices for their financial well-being. Our investment strategy merges macroeconomic scrutiny with strategic asset allocation, leveraging data-driven insights to enhance portfolios and manage risks effectively.</p>
      <p>Emphasizing risk management, we help safeguard your investments during market declines while aiming to position you for growth during market recoveries. Whether you&rsquo;re an individual or an institution, our seasoned professionals are dedicated to delivering tailored investment solutions that resonate with your specific aims and risk tolerance. We acknowledge the uniqueness of each client and advocate for a personalized approach.</p>
    </div>
    <div class="reveal">
      <div class="card on-dark bg-deep" style="padding:2.5rem">
        <img src="assets/img/logo_gold_stacked.png" alt="Pettitt Wealth" style="width:180px;margin:0 auto 1.6rem" width="180" height="236">
        <p class="quote" style="font-size:1.35rem">&ldquo;{SITE['tagline']}&rdquo;</p>
        <div class="quote-by">Alan Lakein</div>
      </div>
    </div>
  </div>
</section>

<section class="section bg-white">
  <div class="container">
    <div class="center narrow reveal">
      <div class="eyebrow">How We Work Together</div>
      <h2>A collaborative wealth management process.</h2>
      <div class="rule"></div>
      <p class="lead">Our collaborative process empowers you to achieve your financial goals through personalized strategies, ongoing monitoring, and a commitment to your financial well-being.</p>
    </div>
    <div class="grid grid-4" style="margin-top:2.5rem">
      <div class="card card-gold reveal">{icon("users")}<h3>Listen</h3><p>We start by truly understanding you — your circumstances, values, family and goals.</p></div>
      <div class="card card-gold reveal">{icon("compass")}<h3>Plan</h3><p>We design a unique plan and portfolio, with strategies for accumulation and for distribution.</p></div>
      <div class="card card-gold reveal">{icon("balance")}<h3>Coordinate</h3><p>We work alongside your accountant and estate attorney so nothing falls between the cracks.</p></div>
      <div class="card card-gold reveal">{icon("refresh")}<h3>Monitor</h3><p>Life and markets change. We review, recalibrate and keep you informed along the way.</p></div>
    </div>
  </div>
</section>

<section class="section" id="eric">
  <div class="container">
    <div class="eyebrow center">About Eric Pettitt</div>
    <h2 class="center">A little about Eric.</h2>
    <div class="rule"></div>
    <div class="bio" style="margin-top:2.5rem">
      <div class="reveal">
        <img src="assets/img/eric.jpg" alt="Eric Pettitt" width="700" height="700">
        <div class="card" style="margin-top:1.2rem;padding:1.4rem 1.6rem">
          <div class="eyebrow" style="margin-bottom:.4rem">Eric Pettitt, CPFA&reg;</div>
          <p class="small muted" style="margin:0">Financial Advisor &middot; Wealth Manager &middot; Financial Life Planner</p>
          <p class="small" style="margin:.8rem 0 0"><a href="mailto:{SITE['email']}">{SITE['email']}</a><br><a href="tel:{SITE['phone_tel']}">{SITE['phone']}</a></p>
        </div>
      </div>
      <div class="reveal">
        <p class="lead">Just as oak trees grow from acorns, it is possible to grow small things into something much larger.</p>
        <p>As a Financial Planner, it&rsquo;s my job to help you grow that tree. I have a deep passion for the intricacies of a financial situation, diving into the math and evaluating variables for a multitude of scenarios. By truly listening to my clients and understanding their needs, I can build a unique plan to set them on the path to success. I have the knowledge and background to be a true fiduciary, and I pride myself on looking out for my clients&rsquo; best interests. There is no one-size-fits-all approach to investing. With a strategy based on now, then, and later, as well as plans for accumulation and distribution, I can serve clients from all walks of life. I approach my work in an organic way, with the knowledge that by doing right by others, success and blessings will materialize for all parties involved. Moreover, we&rsquo;ll have fun in the process, and you become part of the family. My passion for what I do runs deeper than what is typically expected of our industry &mdash; and it shows in the deep relationships we build with our clients.</p>
        <p>My clients know I have their backs and that I&rsquo;m not here simply to sell a product. Pettitt Wealth partners with clients looking for a true financial planner, well versed in developing plans as unique as they are. I have 10 years of experience advising high-net-worth individuals, as well as partnering with accountants and estate attorneys to cover all aspects of creating a financial legacy. I have created a company that provides a completely integrated approach to building your wealth, including utilizing today&rsquo;s most creative portfolio management strategies and asset protection structures enabling you to keep more of your money where it belongs &mdash; in your hands. After all, you&rsquo;ve earned it!</p>
        <h3>Community</h3>
        <p>I believe that being involved in the community and giving back is important and is part of who I am. I am very involved in Gilbert&rsquo;s Chamber of Commerce and serve on their public policy committee. I serve on the government affairs committee for West and Southeast REALTORS&reg; of the Valley and am a part of their business affiliate group. I am a member of Above Par Networking and serve on the membership committee for Elite Business Alliance.</p>
        <div class="compliance" style="justify-content:flex-start;margin-top:1.6rem">
          <a href="{SITE['brokercheck']}" target="_blank" rel="noopener noreferrer"><img src="assets/img/finra_brokercheck.png" alt="FINRA BrokerCheck" width="160" height="59"></a>
          <span class="small muted">Check Eric&rsquo;s background on FINRA&rsquo;s BrokerCheck.</span>
        </div>
      </div>
    </div>
  </div>
</section>

{cta_band("Let&rsquo;s grow your tree.", "Schedule a conversation with Eric — we will talk about where you are today and what you want your wealth to do for you and your family.")}
"""

# ----------------------------------------------------------------- TEAM
TEAM = [
    ("eric.jpg", "Eric Pettitt, CPFA&reg;", "Financial Advisor &middot; Wealth Manager, Financial Life Planner",
     "Fusing advanced market analysis with financial life planning to build resilient portfolios that support your aspirations. A true fiduciary who listens first.",
     [("mailto:" + SITE["email"], SITE["email"]), ("tel:" + SITE["phone_tel"], SITE["phone"])], "Mesa, AZ", "about.html#eric"),
    ("aaron.jpg", "Aaron Soderstrom", "Chief Investment Strategist &middot; Advisory Partner",
     "Architect of the cycle-aware investment framework behind the Clock, blending quantitative rigor with behavioral insight to navigate market cycles.",
     [], "Keller, TX", None),
    ("danielle.jpg", "Danielle Noonan, FPQP&trade;", "Client Experience Director",
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
{cta_band("Ready to collaborate?", "Whether you are planning for retirement, a liquidity event, or the next generation, the conversation starts with a simple appointment.")}
"""

# ----------------------------------------------------------------- CONTACT
def contact():
    return page_hero("Contact &amp; Scheduling", "Let&rsquo;s schedule a conversation.",
        "Request an appointment below and your email app will open with the details pre-filled — or simply call or email us directly.") + f"""
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
      <div class="eyebrow">Schedule an Appointment</div>
      <h2>Request a time that works for you.</h2>
      <div class="rule left"></div>
      <p class="muted">Fill in what you can. When you press the button, your email program will open a message to Eric with your request — nothing is stored on this website.</p>
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
        <div><button class="btn btn-gold" type="submit">{ICONS['calendar'].replace('<svg','<svg width="18" height="18"')} Send Appointment Request</button></div>
        <p id="form-status" class="form-note" aria-live="polite">Prefer to write your own message? Email <a href="{MAILTO}">{SITE['email']}</a>.</p>
      </form>
    </div>
    <div class="reveal">
      <div class="map"><iframe title="Map to Pettitt Wealth office" src="{SITE['map_embed']}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
      <div class="card" style="margin-top:1.4rem">
        <h4>What to expect</h4>
        <p class="small muted" style="margin:0">A first meeting is a no-obligation conversation, typically 45&ndash;60 minutes, in person at our Mesa office or by video. Bring any current statements you would like reviewed. We serve clients residing in {SITE['states']}.</p>
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
    ("index.html", "Pettitt Wealth | Independent Financial Planning & Wealth Management, Mesa AZ",
     "Pettitt Wealth is an independent financial planning and wealth management practice in Mesa, Arizona. Fiduciary advice, cycle-aware investing, and plans built around your life.", home),
    ("approach.html", "Our Approach", "How Pettitt Wealth plans (the Compass) and manages assets through the business cycle (the Clock).", approach),
    ("clock.html", "The Clock: Cycle-Aware Asset Management", "The Clock is how Pettitt Wealth reads the business cycle: six economic stages, the asymmetry of losses, and the feedback loops that drive markets.", clock),
    ("compass.html", "The Compass: Retirement Planning Simulator", "The Compass is Pettitt Wealth's interactive planning simulator: design your blueprint, run Monte Carlo projections, and see the probability of meeting your goals.", compass),
    ("about.html", "About Pettitt Wealth & Eric Pettitt", "Learn about Pettitt Wealth, our collaborative process, and financial advisor Eric Pettitt of Mesa, Arizona.", about),
    ("team.html", "Our Team", "Meet Eric Pettitt, Danielle Noonan and the advisory partners behind Pettitt Wealth.", team),
    ("contact.html", "Contact & Schedule an Appointment", "Schedule an appointment with Pettitt Wealth in Mesa, AZ. Call (480) 933-5277 or email eric@pettittwealth.com.", contact),
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
