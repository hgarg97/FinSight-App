"""Merchant name normalizer — maps raw bank description strings to clean merchant names."""

import re

# Each entry: (compiled regex, clean display name)
_PATTERNS: list[tuple[re.Pattern, str]] = [
    # ── E-commerce & tech ─────────────────────────────────────────────────
    (re.compile(r"AMZN|AMAZON", re.I), "Amazon"),
    (re.compile(r"APPLE\.COM|APPLE\.COM/BILL|ITUNES|APP STORE", re.I), "Apple"),
    (re.compile(r"GOOGLE\s*(PLAY|STORAGE|ONE|LLC|SERVICES)?", re.I), "Google"),
    (re.compile(r"MICROSOFT|MSFT|XBOX", re.I), "Microsoft"),
    (re.compile(r"NETFLIX", re.I), "Netflix"),
    (re.compile(r"SPOTIFY", re.I), "Spotify"),
    (re.compile(r"HULU", re.I), "Hulu"),
    (re.compile(r"DISNEY\+|DISNEY PLUS|DISNEYPLUS", re.I), "Disney+"),
    (re.compile(r"HBO\s*(MAX|NOW)?", re.I), "HBO Max"),
    (re.compile(r"AMAZON PRIME|PRIMEVIDEO|PRIME VIDEO", re.I), "Amazon Prime"),
    (re.compile(r"YOUTUBE\s*(PREMIUM|TV)?", re.I), "YouTube"),
    (re.compile(r"DROPBOX", re.I), "Dropbox"),
    (re.compile(r"GITHUB", re.I), "GitHub"),
    (re.compile(r"SLACK", re.I), "Slack"),
    (re.compile(r"ZOOM", re.I), "Zoom"),
    (re.compile(r"ADOBE", re.I), "Adobe"),
    (re.compile(r"OPENAI|CHATGPT", re.I), "OpenAI"),
    # ── Ride-share & delivery ──────────────────────────────────────────────
    (re.compile(r"UBER\s*(EATS)?", re.I), "Uber"),
    (re.compile(r"LYFT", re.I), "Lyft"),
    (re.compile(r"DOORDASH|DOOR DASH", re.I), "DoorDash"),
    (re.compile(r"GRUBHUB|GRUB HUB", re.I), "Grubhub"),
    (re.compile(r"POSTMATES", re.I), "Postmates"),
    (re.compile(r"INSTACART", re.I), "Instacart"),
    (re.compile(r"GOPUFF|GO PUFF", re.I), "GoPuff"),
    # ── Grocery & warehouse ───────────────────────────────────────────────
    (re.compile(r"WFM|WHOLEFDS|WHOLE FOODS", re.I), "Whole Foods"),
    (re.compile(r"TRADER JOE", re.I), "Trader Joe's"),
    (re.compile(r"COSTCO", re.I), "Costco"),
    (re.compile(r"TARGET", re.I), "Target"),
    (re.compile(r"WALMART|WAL-MART|WAL MART", re.I), "Walmart"),
    (re.compile(r"KROGER", re.I), "Kroger"),
    (re.compile(r"SAFEWAY", re.I), "Safeway"),
    (re.compile(r"PUBLIX", re.I), "Publix"),
    (re.compile(r"ALDI", re.I), "Aldi"),
    (re.compile(r"HEB\b|H-E-B", re.I), "H-E-B"),
    (re.compile(r"SPROUTS", re.I), "Sprouts"),
    # ── Fast food & coffee ────────────────────────────────────────────────
    (re.compile(r"STARBUCKS|SBUX", re.I), "Starbucks"),
    (re.compile(r"CHIPOTLE", re.I), "Chipotle"),
    (re.compile(r"MCDONALD|MC DONALD|MCG\b", re.I), "McDonald's"),
    (re.compile(r"CHICK-FIL-A|CHICKFILA|CHICK FIL", re.I), "Chick-fil-A"),
    (re.compile(r"TACO BELL|TACOBELL", re.I), "Taco Bell"),
    (re.compile(r"SUBWAY\b", re.I), "Subway"),
    (re.compile(r"DOMINO'?S|DOMINOS PIZZA", re.I), "Domino's"),
    (re.compile(r"PIZZA HUT", re.I), "Pizza Hut"),
    (re.compile(r"DUNKIN|DUNKIN.DONUTS", re.I), "Dunkin'"),
    (re.compile(r"PANDA EXPRESS", re.I), "Panda Express"),
    (re.compile(r"PANERA", re.I), "Panera Bread"),
    (re.compile(r"FIVE GUYS", re.I), "Five Guys"),
    (re.compile(r"SHAKE SHACK", re.I), "Shake Shack"),
    (re.compile(r"IN-N-OUT|IN N OUT", re.I), "In-N-Out"),
    # ── Pharmacy & health ─────────────────────────────────────────────────
    (re.compile(r"\bCVS\b", re.I), "CVS"),
    (re.compile(r"WALGREEN", re.I), "Walgreens"),
    (re.compile(r"RITE AID|RITEAID", re.I), "Rite Aid"),
    # ── Gas & auto ────────────────────────────────────────────────────────
    (re.compile(r"\bSHELL\b", re.I), "Shell"),
    (re.compile(r"CHEVRON", re.I), "Chevron"),
    (re.compile(r"EXXON|EXXONMOBIL", re.I), "ExxonMobil"),
    (re.compile(r"BP\b|BRITISH PETROLEUM", re.I), "BP"),
    (re.compile(r"MARATHON", re.I), "Marathon"),
    (re.compile(r"\bCITGO\b", re.I), "Citgo"),
    (re.compile(r"SPEEDWAY", re.I), "Speedway"),
    # ── Payment & peer-to-peer ────────────────────────────────────────────
    (re.compile(r"VENMO", re.I), "Venmo"),
    (re.compile(r"ZELLE", re.I), "Zelle"),
    (re.compile(r"PAYPAL", re.I), "PayPal"),
    (re.compile(r"CASH\s*APP|CASHAPP", re.I), "Cash App"),
    (re.compile(r"SQUARE\b", re.I), "Square"),
    (re.compile(r"STRIPE", re.I), "Stripe"),
    # ── Travel & lodging ─────────────────────────────────────────────────
    (re.compile(r"AIRBNB", re.I), "Airbnb"),
    (re.compile(r"MARRIOTT", re.I), "Marriott"),
    (re.compile(r"HILTON", re.I), "Hilton"),
    (re.compile(r"HYATT", re.I), "Hyatt"),
    (re.compile(r"EXPEDIA", re.I), "Expedia"),
    (re.compile(r"BOOKING\.COM", re.I), "Booking.com"),
    (re.compile(r"DELTA\b|DL\s+\d", re.I), "Delta Air Lines"),
    (re.compile(r"UNITED\s*AIR|UA\s+\d", re.I), "United Airlines"),
    (re.compile(r"AMERICAN\s*AIR|AA\s+\d", re.I), "American Airlines"),
    (re.compile(r"SOUTHWEST\s*AIR|WN\s+\d", re.I), "Southwest Airlines"),
    # ── Utilities & services ─────────────────────────────────────────────
    (re.compile(r"\bUSPS\b|US POSTAL", re.I), "USPS"),
    (re.compile(r"\bUPS\b", re.I), "UPS"),
    (re.compile(r"\bFEDEX\b|FED EX", re.I), "FedEx"),
    (re.compile(r"AT&T|ATT\b", re.I), "AT&T"),
    (re.compile(r"VERIZON", re.I), "Verizon"),
    (re.compile(r"T-MOBILE|TMOBILE", re.I), "T-Mobile"),
    (re.compile(r"COMCAST|XFINITY", re.I), "Comcast/Xfinity"),
    (re.compile(r"SPECTRUM\b", re.I), "Spectrum"),
    # ── Retail & home ────────────────────────────────────────────────────
    (re.compile(r"HOME DEPOT|HOMEDEPOT", re.I), "Home Depot"),
    (re.compile(r"LOWE'?S|LOWES\b", re.I), "Lowe's"),
    (re.compile(r"IKEA", re.I), "IKEA"),
    (re.compile(r"BEST BUY|BESTBUY", re.I), "Best Buy"),
    (re.compile(r"\bGAP\b", re.I), "Gap"),
    (re.compile(r"OLD NAVY|OLDNAVY", re.I), "Old Navy"),
    (re.compile(r"H&M\b", re.I), "H&M"),
    (re.compile(r"ZARA\b", re.I), "Zara"),
    (re.compile(r"NIKE\b", re.I), "Nike"),
    (re.compile(r"ADIDAS\b", re.I), "Adidas"),
    # ── Fitness ───────────────────────────────────────────────────────────
    (re.compile(r"PLANET FITNESS", re.I), "Planet Fitness"),
    (re.compile(r"EQUINOX", re.I), "Equinox"),
    (re.compile(r"PELOTON", re.I), "Peloton"),
]


def normalize_merchant(raw_name: str) -> str:
    """Return a clean merchant name for *raw_name*.

    Tries regex patterns first; falls back to basic cleanup (strip trailing
    reference numbers, trim whitespace, title-case).
    """
    if not raw_name:
        return raw_name

    text = raw_name.strip()
    for pattern, clean in _PATTERNS:
        if pattern.search(text):
            return clean

    # Fallback: strip trailing digits / reference codes, title-case
    cleaned = re.sub(r"[\s#*]+\d[\d\s\-*#]+$", "", text).strip()
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    return cleaned.title() if cleaned else text.title()
