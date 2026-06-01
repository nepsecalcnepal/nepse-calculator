# 📈 NEPSE Calculator Nepal

A complete, production-ready NEPSE (Nepal Stock Exchange) calculator website built with **pure HTML5, CSS3, and vanilla JavaScript** — no frameworks, no build tools, no dependencies (except Google Fonts).

## ✨ Features

- 📊 **4 calculators in one**: Buy/Sell, Brokerage, Capital Gains Tax, Weighted Average Cost (WACC)
- 🇳🇵 **2025 NEPSE rates** — tiered brokerage, SEBON fee, DP charge, CGT
- 📱 **Fully responsive** — mobile, tablet, desktop
- 🌙 **Dark mode toggle** with localStorage persistence
- ♿ **Accessible** — semantic HTML, ARIA labels, keyboard-friendly
- 🔍 **SEO-optimized** — meta tags, Open Graph, Schema.org markup
- 💾 **localStorage** — saves your last calculation
- 💰 **AdSense-ready** — placeholder ad slots for monetization
- 📝 **5 pages**: Home, About, Contact, Privacy Policy, Terms of Service

---

## 📁 Project Structure

```
nepse-calculator/
├── index.html              # Main homepage with calculators
├── css/
│   ├── variables.css       # CSS custom properties (colors, fonts, spacing)
│   ├── style.css           # Main stylesheet
│   └── responsive.css      # Media queries for mobile/tablet
├── js/
│   ├── utils.js            # Helper functions (formatters, validators)
│   ├── calculator.js       # Pure NEPSE calculation logic
│   └── main.js             # DOM bindings and event handlers
├── images/                 # Place your logo/icons here
├── pages/
│   ├── about.html
│   ├── contact.html
│   ├── privacy-policy.html
│   └── terms.html
└── README.md
```

---

## 🚀 Getting Started

### Open in VS Code

1. Download / unzip the project folder
2. Open VS Code → **File → Open Folder** → select `nepse-calculator`
3. Install the **Live Server** extension (by Ritwick Dey)
4. Right-click `index.html` → **"Open with Live Server"**
5. Site will open at `http://127.0.0.1:5500/`

That's it — no `npm install`, no build step.

### Or just double-click

You can also simply double-click `index.html` to open it in any browser. Everything works locally.

---

## 🎨 Customization

### Change the color scheme

Edit `css/variables.css`:

```css
:root {
  --color-primary: #2563eb;       /* main brand blue */
  --color-primary-dark: #1d4ed8;
  --color-profit: #16a34a;        /* green */
  --color-loss: #dc2626;          /* red */
}
```

All colors used across the site reference these variables.

### Change calculator rates

Edit the top of `js/calculator.js`:

```js
const NEPSE_RATES = {
  brokerage: [
    { max: 50000,    rate: 0.36 },
    { max: 500000,   rate: 0.33 },
    // ... edit here
  ],
  sebonFee: 0.015,
  dpCharge: 25,
  cgt: { shortTerm: 7.5, longTerm: 5, institution: 10 }
};
```

### Add a new page

1. Copy `pages/about.html` → rename it (e.g. `blog.html`)
2. Update the `<title>`, content, and breadcrumb
3. Add a link to it in the navbar of every page (search/replace `<ul class="navbar__menu">`)

### Replace the logo

Drop your logo file into `images/` and replace this in every HTML file:

```html
<a href="index.html" class="navbar__logo">
  <span class="navbar__logo-icon">📈</span>
  <span>NEPSE Calc</span>
</a>
```

with:

```html
<a href="index.html" class="navbar__logo">
  <img src="images/logo.png" alt="NEPSE Calc" height="40">
</a>
```

Also update the favicon — replace the `<link rel="icon" ...>` line.

---

## 💰 Adding Google AdSense

1. Get approved for AdSense and find your client ID (`ca-pub-XXXXXXXX`)
2. In `index.html`, find the comment block `<!-- ADSENSE PLACEHOLDER -->` in `<head>`, uncomment it, paste your ID
3. Find `<div class="ad-slot">` blocks and replace with real `<ins class="adsbygoogle">` tags:

```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXX"
     data-ad-slot="YOUR-SLOT-ID"
     data-ad-format="auto"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

---

## 📊 Adding Google Analytics

1. Get your GA4 Measurement ID (`G-XXXXXXXXXX`)
2. In `index.html`, find the `GOOGLE ANALYTICS PLACEHOLDER` comment block in `<head>`
3. Uncomment it and replace `G-XXXXXXXXXX` with your real ID

---

## 🌐 Deployment

### Netlify (easiest, free)
1. Push the folder to a GitHub repo
2. Go to [netlify.com](https://netlify.com) → "Add new site" → "Import from Git"
3. Pick your repo. Leave build command empty. Publish directory: `/`
4. Done! You get a free `*.netlify.app` URL.

### Vercel (also free)
1. `npm i -g vercel` (one time)
2. In the project folder, run `vercel`
3. Follow the prompts.

### GitHub Pages (free)
1. Push to GitHub
2. Repo Settings → Pages → Source: `main` branch, root folder
3. Site goes live at `username.github.io/repo-name`

### Hostinger / cPanel hosting
1. Zip the entire `nepse-calculator` folder
2. In cPanel → File Manager → `public_html`
3. Upload the zip, then "Extract"
4. Move all files (not the parent folder) into `public_html` root.

---

## 🧪 Test Cases

Verify the calculator works correctly with these:

### Test 1 — Long-term profit
- 100 shares @ Rs 500 buy, Rs 700 sell, **long-term**
- Expected gross gain: Rs 20,000
- Expected CGT (5%): Rs 1,000
- Expected net profit: **Rs 18,556.80** (+36.98%)

### Test 2 — Short-term loss
- 200 shares @ Rs 1,000 buy, Rs 850 sell, **short-term**
- Buy total: Rs 2,00,000
- Sell total: Rs 1,70,000
- Gross loss: Rs 30,000 → no CGT (only on profit)
- Expected net loss: **-Rs 31,268.20** (-15.58%)

### Test 3 — Brokerage tier check
- Transaction Rs 100,000 → 0.33% rate → Rs 330 brokerage
- Transaction Rs 6,00,000 → 0.31% rate → Rs 1,860 brokerage
- Transaction Rs 50,00,000 → 0.27% rate → Rs 13,500 brokerage

---

## 📝 NEPSE Rates Reference (2025)

| Charge | Rate |
|---|---|
| Brokerage ≤ Rs 50,000 | 0.36% |
| Brokerage Rs 50,001–5,00,000 | 0.33% |
| Brokerage Rs 5,00,001–20,00,000 | 0.31% |
| Brokerage Rs 20,00,001–1 Cr | 0.27% |
| Brokerage > 1 Cr | 0.24% |
| SEBON Fee (buy + sell) | 0.015% |
| DP Charge (sell only) | Rs 25 |
| CGT — Short term (< 365 days) | 7.5% |
| CGT — Long term (≥ 365 days) | 5% |
| CGT — Institutions | 10% |

---

## 📜 License

MIT License — free to use, modify, and distribute.

## ⚠️ Disclaimer

This calculator is for educational purposes only. Always verify with your licensed broker before making investment decisions. We are not liable for any errors or omissions.
