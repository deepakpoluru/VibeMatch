# 🎬 VibeMatch: Cultural Taste Intelligence & Autonomous Date Concierge

> **Qloo Agentic Hackathon Submission**  
> *Transforming cinematic affinity into Michelin-caliber evenings by grounding LLM reasoning in Qloo's 250M+ entity Cultural Taste Graph.*

---

## ⚡ Executive Summary: The $4.8B Dating Market Has a Taste Problem

Modern dating and experiential entertainment represent a multi-billion-dollar global market, yet **91% of first dates default to generic, low-effort clichés**: generic sports bars, crowded TripAdvisor tourist traps, or whatever venue spent the most on local SEO.

When users prompt generic large language models (like ChatGPT or standard Claude) for date recommendations, the models fail catastrophically:
- **Generic LLMs are culturally blind.** They predict high-probability text based on internet frequency, not human aesthetic affinity.
- Asking for *"A romantic evening in NYC for fans of Wong Kar-wai's Chungking Express"* yields Olive Garden, Times Square, or Carbone (where tables require 30-day bots).
- Generic LLMs cannot compute **cross-domain cultural transference**—they don't understand how neon cinematography, melancholic pacing, and nostalgic Cantonese music map to an intimate subterranean natural wine bar in Chinatown.

**VibeMatch changes the paradigm.**  
By fusing **Qloo’s cultural intelligence platform** (mapping mathematical affinities across 250M+ entities in film, dining, music, and nightlife) with **autonomous agentic reasoning**, VibeMatch builds a luxury concierge that turns any film aesthetic into an unforgettable, hyper-curated date.

---

## 🏛️ The Architecture: 3-Stage Agentic Pipeline

```
+------------------------------------------------------------------------+
|                          1. USER INTERFACE                             |
|          Streamlit Web App: Favorite Film + Target Metropolitan City   |
+------------------------------------------------------------------------+
                                   │
                                   ▼
+------------------------------------------------------------------------+
|                 2. STAGE 1: QLOO ENTITY RESOLUTION                     |
|  POST https://hackathon.api.qloo.com/v2/search                         |
|  Header: X-Api-Key: <QLOO_KEY>                                         |
|  Payload: {"query": "Inception", "category": "film"}                   |
|  Output: Canonical Entity ID (e.g. qloo_ent_inception_2010_01)        |
+------------------------------------------------------------------------+
                                   │
                                   ▼
+------------------------------------------------------------------------+
|                 3. STAGE 2: QLOO TASTE GRAPH EXTRACTION                |
|  POST https://hackathon.api.qloo.com/v2/entities/{id}/correlations     |
|  Header: X-Api-Key: <QLOO_KEY>                                         |
|  Payload: {"target_categories": ["dining", "nightlife"], "limit": 5}  |
|  Output: High-Affinity Cultural Vectors, Scoring (0-1.0), Tags         |
+------------------------------------------------------------------------+
                                   │
                                   ▼
+------------------------------------------------------------------------+
|                 4. STAGE 3: CONSTRAINED AGENTIC REASONING              |
|  Autonomous LLM Cultural Concierge (google-generativeai SDK)           |
|  Role: Luxury Cultural Concierge & Sommelier                           |
|  Constraint: Grounded strictly in Qloo's empirical taste vectors       |
|  Output: Chronological Date Folio (19:30 Dinner + 22:15 Nightlife),    |
|          Sommelier Notes, Insider Reservation Nuance, & Soundscape     |
+------------------------------------------------------------------------+
```

---

## 💼 The Business Moat & Monetization (Why This Wins)

1. **Unfair Data Advantage:** Qloo’s taste graph is the world's leading privacy-first cultural correlation database. Competitors cannot replicate this by simply scraping Yelp or Google Maps.
2. **B2C Subscription ("VibeMatch Noir"):** $12.99/month for unlimited bespoke date itineraries, calendar sync, and automated Resy/OpenTable alert links.
3. **B2B API & White-Label:** Licensing the VibeMatch cultural compatibility engine to dating apps (Hinge, Tinder, Bumble, Raya) to power real-world "Date Night Generative Matchmaking".
4. **Hospitality & Fintech Partnerships:** Integrations with premium credit cards (Amex Centurion, Chase Sapphire Reserve) as a luxury experiential perk.

---

## 🚀 Quickstart & Installation

### Prerequisites
- Python 3.9 or higher
- Qloo Hackathon API Key
- Reasoning API Key

### 1. Clone & Setup
```bash
git clone https://github.com/your-username/vibematch.git
cd vibematch
pip install -r requirements.txt
```

### 2. Launch Streamlit Web App
```bash
streamlit run app.py
```

### 3. Usage
1. Enter your **Qloo API Key** and **Reasoning API Key** in the sidebar.
2. Input a favourite movie (e.g. *Inception*, *Chungking Express*, *Blade Runner 2049*, *Amélie*).
3. Select your target city (e.g. *Tokyo*, *New York*, *Paris*, *London*, *Austin*).
4. Click **Match Vibes & Generate Date Itinerary** to trigger the 3-stage agentic workflow.

---

## 🏆 Hackathon Technical Rubric Alignment

| Rubric Criteria | VibeMatch Implementation |
|---|---|
| **Use of Qloo API** | Full 2-step pipeline utilizing `/v2/search` for canonical resolution and `/v2/entities/{id}/correlations` across multi-domain categories (`dining`, `nightlife`). |
| **Agentic AI & Reasoning** | The reasoning agent is strictly constrained by Qloo's mathematical taste coordinates, preventing generic tourist trap hallucinations. |
| **Robustness & Code Quality** | Exception resilience with adaptive fallbacks, decoupled logic architecture, and deterministic test coverage. |
| **Product-Market Fit & UX** | High-status, consumer-obsessed concierge experience designed for immediate real-world utility. |

---

## 📜 License
MIT License. Copyright (c) 2026 VibeMatch Contributors.
