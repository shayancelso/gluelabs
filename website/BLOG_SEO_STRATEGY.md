# Gloo Blog & SEO Strategy

**Goal:** page-one Google for (a) agencies that build custom go-to-market tools for sales, account management, and customer success teams, and (b) Lovable agency / Lovable partner searches.

**Written:** 2026-07-31. Based on live SERP checks, not keyword-tool estimates. Re-check the SERPs quarterly — both clusters are young and moving.

---

## 1. What the live SERPs actually look like

### Cluster A — custom GTM tooling ("who can build this for us?")

Searched: *custom sales tools development agency*, *build internal tools for sales teams*, *RevOps agency custom dashboards*.

**Who ranks today:** almost no agencies. Page one is owned by two groups:

1. **Platform content marketing** — ToolJet (`blog.tooljet.com/guide-to-internal-tools`), Superblocks (`/blog/internal-tools-examples`), WeWeb (`/blog/internal-tools-development-complete-guide`), Drapcode, gainhq. These are no-code/low-code vendors publishing giant guides to capture the category.
2. **"Best tools" listicles** — forecastio, Warmly, LaGrowthMachine, ORM, AutoRFP for RevOps queries. Vendor-funded roundups.

The only real agency on page one was **Airdev** (`airdev.co/products/sales-tools`), ranking with a *productised service page*, not a blog post.

**What this means:**
- **The commercial-intent queries are soft.** There is no incumbent agency with topical authority here. A small agency with genuine operator credibility and real case studies can take these.
- **The broad informational head terms are hard** ("internal tools", "RevOps tools"). Vendors with dedicated content teams own them. Do not attack head-on. Attack the slices they write generically about and Gloo knows specifically: sales, AM, CS.
- **Format matters:** the one agency that ranks did it with a service page. So blog posts alone won't finish the job — see §5.

### Cluster B — Lovable agency (the real opportunity)

Searched: *Lovable agency*, *hire Lovable expert / developer / partner*.

**Who ranks today:** an active, crowded, and beatable set of exact-match pages:

| Ranking page | What it is |
|---|---|
| `lovable.dev/experts` | Lovable's own partner directory |
| `lovable.dev/blog/introducing-hire-a-lovable-partner` | Lovable's program announcement |
| `duogeeks.com/lovable-agency` | Agency, ~2,300 words, H1 "Your Expert Lovable Agency" |
| `rapidevelopers.com/lovable-ai-developers` | Dev shop |
| `techavidus.com/lovable-ai-developer` | Offshore dev shop |
| `gaincafe.com/hire-lovable-expert` | Claims "Official Lovable Partner" |
| `concettolabs.com/hire-lovable-ai-developer` | Offshore dev shop |
| `lovablexperts.com` | "First agency fully specialised in Lovable worldwide" |

**Competitor teardown (Duogeeks, the strongest):** ~2,300 words, keyword-stuffed ("Lovable agency" 50+ times), 4-step process, pain points, portfolio thumbnails, 3 video testimonials, 6 FAQs, contact form. **No pricing. No schema markup. No named case study with numbers. Generic positioning — "we build apps 10× faster".**

**Why Gloo wins here:**
1. **Verifiable partner status.** Gloo is a Lovable **Select** *and* **Certified** Partner. Most of this page-one set are generic dev shops with no partner relationship at all.
2. **A niche none of them have.** They all sell "MVPs and SaaS platforms". Gloo sells GTM tooling for sales/AM/CS. That's a defensible sub-niche of the Lovable ecosystem with zero competition.
3. **A real case study with numbers** (150+ store franchise, 170% more demos, 89% adoption) versus their portfolio thumbnails.
4. **They've left schema on the table.** Structured markup is a free advantage.

### The Lovable directory is a ranking asset, not just a lead source

`lovable.dev/experts` listings show: company + logo, locations, languages, **times hired** ("25× hired"), **partner since** date, **hourly rate**, **minimum budget**, service categories, and portfolio projects. Filter categories are: Websites, Ecom stores, Web apps, Mobile apps, Custom backend, Custom design, **Content & SEO**, Marketing setup.

**Actions:** make sure Gloo's listing is live, complete, and carries the portfolio + rate fields (blank fields lose the click). "Web apps", "Custom backend", and "Content & SEO" are the categories that match Gloo. The listing also earns a link from a high-authority domain in exactly the right topic — worth more than a dozen directory links.

---

## 2. Keyword → URL map

Priority: **P1** ship now, **P2** next, **P3** backlog.

### Cluster B — Lovable

| Query | Intent | Target URL | P |
|---|---|---|---|
| lovable agency · hire lovable agency | commercial | `/blog/how-to-hire-a-lovable-agency` → later `/lovable-agency` service page | **P1** |
| hire lovable developer · lovable expert · lovable partner | commercial | same | **P1** |
| lovable vs claude code | comparison | `/blog/lovable-vs-claude-code` | **P1** |
| what is a lovable certified partner · lovable select partner | informational | `/blog/how-to-hire-a-lovable-agency` (section + FAQ) | P1 |
| lovable for internal tools · lovable for sales teams | long-tail commercial | `/blog/custom-gtm-tools-guide` (section) | P2 |
| is lovable production ready · lovable security | objection | dedicated post | P2 |
| lovable pricing vs agency cost | commercial | pricing post | P3 |

### Cluster A — GTM tooling

| Query | Intent | Target URL | P |
|---|---|---|---|
| custom go-to-market tools · GTM tooling | commercial | `/blog/custom-gtm-tools-guide` (pillar) | **P1** |
| custom sales tools development agency · agency to build sales tools | commercial | `/blog/build-vs-buy-sales-tools` → later service page | **P1** |
| build vs buy sales software | comparison | `/blog/build-vs-buy-sales-tools` | **P1** |
| customer success dashboard · CS dashboard metrics | info + commercial | `/blog/customer-success-dashboard` | **P1** |
| account management tools · AM dashboard | commercial | pillar (section) | P2 |
| QBR automation · automated business review deck | long-tail | dedicated post | P2 |
| whitespace analysis tool · account expansion analysis | long-tail | dedicated post (they already have the tool) | P2 |
| renewal tracker · account health scoring | long-tail | dedicated posts | P3 |
| internal tools agency | commercial, hard | pillar, long game | P3 |

**Long-tail first wins** (near-zero competition, exact-match Gloo):
`custom tools for account management teams` · `agency that builds internal tools for customer success` · `lovable agency for sales teams` · `build a QBR deck automatically` · `custom forecasting dashboard for sales teams`

---

## 3. AEO / AI-search requirements (2026)

A large share of "find me an agency" research now happens inside ChatGPT, Perplexity, and AI Overviews. Getting *cited* is a separate discipline from ranking, with different plumbing:

- **Let the AI crawlers in, explicitly:** `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Bingbot`. A bare `User-agent: * / Allow: /` works, but explicit allows survive future edits by someone who doesn't know the stakes. Done in `robots.txt`.
- **Submit to Bing Webmaster Tools.** ChatGPT Search and Perplexity both lean on Bing's index. If Bing can't see the page, AI search can't cite it. **This is a manual step — not yet done.**
- **Open every page with a 2–3 sentence direct answer** before any storytelling. Every article here does.
- **Write liftable claims** — standalone sentences that survive being quoted with no surrounding context. Short paragraphs, real numbers, no "as we discussed above".
- **FAQPage schema on every article**, phrased as the questions buyers actually type.

**Expected latency:** Perplexity days · ChatGPT Search 1–3 weeks · AI Overviews 4–8 weeks. Do not judge this work before six weeks have passed.

---

## 4. What shipped

| File | Purpose |
|---|---|
| `blog/index.html` | Blog home, `Blog` + `BreadcrumbList` schema, category filters |
| `blog/how-to-hire-a-lovable-agency.html` | Cluster B money post |
| `blog/lovable-vs-claude-code.html` | Cluster B comparison |
| `blog/custom-gtm-tools-guide.html` | Cluster A pillar |
| `blog/build-vs-buy-sales-tools.html` | Cluster A comparison |
| `blog/customer-success-dashboard.html` | Cluster A long-tail |
| `blog/blog.css` | Blog styles, extends the site's tokens |
| `feed.xml` | RSS |
| `sitemap.xml`, `robots.txt` | Updated for the blog + AI crawlers |

Every article carries: `BlogPosting` + `BreadcrumbList` + `FAQPage` schema, canonical, OG/Twitter cards, a direct-answer lede, internal links to the pillar and to two related posts, and a CTA.

---

## 5. The gap this blog does not close

**Blog posts rank for research queries. Service pages rank for hiring queries.** The one agency on page one for Cluster A got there with a productised service page, and every Cluster B competitor uses an exact-match service page (`/lovable-agency`, `/hire-lovable-expert`).

To actually own the money terms, Gloo needs two more pages that are *not* blog posts:

1. **`/lovable-agency`** — H1 "Lovable Agency for Go-To-Market Teams", the Select + Certified badges above the fold, the franchise case study, pricing bands, FAQs, `ProfessionalService` + `FAQPage` schema. Target: *lovable agency*, *hire lovable developer*.
2. **`/custom-gtm-tools`** — H1 naming sales, AM, and CS explicitly. Target: *custom sales tools agency*, *internal tools for revenue teams*.

The blog then links up into both, passing topical relevance. Recommend building these next.

**Other open items, in order:**
1. Bing Webmaster Tools submission (gates all AI citation).
2. Google Search Console — confirm the blog is submitted and indexing.
3. Complete the `lovable.dev/experts` listing (rate, minimum, portfolio, categories).
4. Publishing cadence: one post per week beats five posts then silence. The P2 list is the queue.
5. Get the case study client to allow a named logo. "One of Canada's largest pizza chains" converts far worse than a name.

---

## 6. Cluster C — Forward Deployed Engineer (added 2026-08-01)

Live SERP checked, not estimated. This cluster behaves differently from A and B, and the difference decides the strategy.

**The head term is a trap.** `forward deployed engineer` is owned by Wikipedia, the Pragmatic Engineer newsletter, a16z's *services-led growth* essay, fde.academy, MindStudio and Perspective AI. Extremely high authority, and — more importantly — **the intent is mostly job-seekers**: salary, interviews, "should I go for it". Ranking there brings traffic that will never buy. Do not chase it head-on.

**The buyer-intent slice is owned by staffing, not agencies.** Search `hire forward deployed engineers` and you get WorkGenius, Uplers, ISHIR, HireOverseas, Betts, Paraform. Every one of them sells **a person** — "vetted profile in 48 hours", "90% less overseas". None sells the outcome.

**The gap is the comparison.** Nobody credibly owns *FDE vs agency* — the query a buyer types immediately before choosing, where Gloo is literally one side of the comparison. One thin page exists on it today.

| Query | Intent | Target URL | P |
|---|---|---|---|
| forward deployed engineer vs agency | comparison, decision-stage | `/blog/forward-deployed-engineer-vs-agency` | **P1** |
| what is a forward deployed engineer | definitional (AI Overview bait) | same, via the direct-answer lede | P1 |
| should we hire a forward deployed engineer | commercial | same | P1 |
| forward deployed engineer as a service | commercial | future service page | P2 |
| forward deployed engineering for GTM teams | long-tail, uncontested | future | P2 |

**Honest expectation:** this cluster converts worse than A and B because the term's gravity is career content. It earns its place for two other reasons — the a16z framing legitimises the model with the founders and GTM leaders Gloo sells to, and the term is rising fast enough that ranking early is cheap. Treat it as top-of-funnel that feeds the pillar, not as a money page.

**Positioning note worth keeping straight:** Gloo is *not* an FDE shop in Palantir's original sense, because FDEs deploy their employer's own product into a customer. Gloo uses the same method for a different purpose: the client's internal tools. The post says this explicitly, and it should stay that way — claiming the label outright would be inaccurate and easy to pick apart.

---

## 7. Cluster D — Small-business owner queries (added 2026-08-14)

Sourced from a live sweep of r/smallbusiness, r/hwstartups, r/CRM, and r/growmybusiness distress threads (last 30 days), not keyword tools. These are the questions owners type *before* they know an agency is the answer — the buyer is an owner/operator, not a RevOps leader, so the intent is earlier-stage but the competition is near zero and the language is exact.

The five recurring thread archetypes (stable month over month, so they double as monitoring keywords for outbound):

1. "how do I build a custom X for my business" (client portal, booking tool, job tracker)
2. "we've outgrown Excel / running the business on Sheets"
3. "what does custom software cost / got quotes spanning 10×"
4. "AI app builder vs hiring a developer"
5. "paid someone / built it with AI, now worried it isn't production-grade"

| Query | Intent | Target URL | P |
|---|---|---|---|
| how much does custom software cost | commercial | `/blog/custom-software-cost` + `/software-cost-calculator` | **P1 — shipped** |
| custom software cost calculator / app cost estimate | commercial, tool-seeking | `/software-cost-calculator` | **P1 — shipped** |
| outgrown excel · replace spreadsheets with an app | commercial | `/blog/outgrown-excel` | **P1 — shipped** |
| custom client portal (esp. professional services) | commercial, scoped project | `/blog/custom-client-portal` | **P1 — shipped** |
| ai app builder vs hiring a developer | comparison, decision-stage | `/blog/ai-app-builder-vs-hiring-developer` | **P1 — shipped** |
| is lovable production ready · ai app security audit | objection + rescue | `/blog/ai-app-production-ready` | **P1 — shipped** (closes the §2 P2 gap) |

**The calculator is the hub.** Every Cluster D post links into `/software-cost-calculator`; the calculator's lead form reuses `#ctaForm` so estimates land in the same Supabase → email pipeline as the contact page, with the visitor's selections auto-appended to the message. It is also the artifact Reddit/community answers can link to without being spam ("free estimator, no email required").

### Shipped 2026-08-14

| File | Purpose |
|---|---|
| `software-cost-calculator.html` | Interactive estimator: 5 project types × integrations/auth/extras → range + timeline + DIY/Gloo/traditional-agency comparison; `WebApplication` + `FAQPage` schema; lead form wired to the existing pipeline |
| `blog/custom-software-cost.html` | Cluster D money post (price bands, 10× quote spread, 4 vetting questions) |
| `blog/outgrown-excel.html` | Spreadsheet-to-app archetype |
| `blog/custom-client-portal.html` | Scoped-project archetype (portals; security non-negotiables) |
| `blog/ai-app-builder-vs-hiring-developer.html` | Decision-stage comparison; validate-then-harden sequence |
| `blog/ai-app-production-ready.html` | 10-point checklist; rescue/audit funnel entry |
| `blog/index.html`, `sitemap.xml`, `feed.xml`, `contact.html` | Cards, schema, RSS items, calculator cross-link |

**Open items for this cluster:** submit new URLs in Google Search Console + Bing Webmaster Tools (Bing still gates AI citation — see §3); consider a `/app-rescue` productised service page once the audit offer has a fixed public price (same logic as §5: blog posts rank for research, service pages rank for hiring).
