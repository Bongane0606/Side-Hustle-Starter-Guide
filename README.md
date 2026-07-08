# Side Hustle Starter Guide

![Static Site](https://img.shields.io/badge/site-static_HTML-E4A93B?style=for-the-badge)
![No Build Step](https://img.shields.io/badge/build-none-1F8A5F?style=for-the-badge)
![Local First](https://img.shields.io/badge/data-local_first-C1442D?style=for-the-badge)
![Responsive](https://img.shields.io/badge/design-responsive-15181B?style=for-the-badge)

A practical, no-fluff website for people who want to start a small side hustle and turn the idea into a simple business plan. It covers hair styling, catering, tutoring, and reselling, then gives users a fill-in ledger that calculates startup costs, pricing, profit, and break-even numbers.

Built for **MordecaiTechSolutions** with plain HTML, CSS, and JavaScript.

## Highlights

- Multi-page static website: home, guide, and business-plan ledger.
- Four side hustle deep-dives with startup costs, launch checklists, and common mistakes.
- Interactive ledger that updates totals and calculators as the user types.
- Local autosave using `localStorage`, so plan data stays in the browser.
- Print / Save as PDF flow for finished business plans.
- Download as Word feature for a portable plan document.
- Dark mode toggle with saved theme preference.
- Mobile-friendly navigation and responsive layouts.
- Extra planning tools: profit calculator, South African pricing calculator, side hustle quiz, and business name generator.

## Pages

| Page | File | What it does |
| --- | --- | --- |
| Home | `index.html` | Introduces the guide, compares the four hustles, and sends users into the guide or ledger. |
| The Guide | `guide.html` | Gives detailed startup advice for hair, catering, tutoring, and reselling. |
| Business Plan | `ledger.html` | Lets users fill in a business plan and calculate costs, profit, and break-even numbers. |

## Quick Start

No install. No build step. Just open the site.

```bash
git clone <your-repo-url>
cd Side-Hustle-Starter-Guide
```

Then open `index.html` in your browser.

If you prefer using a local server:

```bash
python3 -m http.server 8000
```

Visit:

```text
http://localhost:8000
```

## Project Structure

```text
Side-Hustle-Starter-Guide/
|-- index.html      # Landing page and hustle overview
|-- guide.html      # Full side hustle guide
|-- ledger.html     # Interactive business plan ledger
|-- styles.css      # Shared visual system and responsive layout
|-- script.js       # Shared navigation and theme behavior
`-- README.md       # Project documentation
```

## Feature Preview

### Business Plan Ledger

The ledger helps users move from "I have an idea" to "I know my numbers."

It includes:

- Startup cost rows with live totals.
- Profit per sale calculation.
- Monthly break-even estimate.
- Weekly break-even estimate.
- Startup cost recovery estimate.
- Cost split chart.
- Profit snapshot chart.
- Autosave status.

### Side Hustle Guide

Each hustle section includes:

- Estimated starting budget.
- Practical cost breakdown.
- Launch checklist.
- Month-one mistakes to avoid.
- Direct link into the ledger.

### Local-First Privacy

The business plan is not uploaded to a server. Form data is saved in the browser with `localStorage`, which keeps the experience simple and private.

## Customize It

To change the brand colors, edit the CSS variables in `styles.css`:

```css
:root {
  --ink: #15181B;
  --paper: #F1ECD8;
  --gold: #E4A93B;
  --jade: #1F8A5F;
  --rust: #C1442D;
}
```

To add another hustle:

1. Add a new card to `index.html`.
2. Add a new guide section in `guide.html`.
3. Add the hustle option to the select field in `ledger.html`.
4. Update any quiz or calculator logic that should recommend it.

## Roadmap Ideas

- [ ] Add screenshots or a short demo GIF.
- [ ] Add more hustle categories.
- [ ] Add reusable print templates.
- [ ] Add export to CSV for startup costs.
- [ ] Add multilingual support for local audiences.
- [ ] Add optional example plans that users can load into the ledger.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`
- Google Fonts

## Credits

Created for **MordecaiTechSolutions** as a practical starter guide for small business builders.

## License

Add your preferred license here before publishing the project publicly.
