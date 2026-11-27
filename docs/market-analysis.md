# Market analysis: AI voice companion for older adults (Poland → CEE/EU)

_Draft, 2026-11-27. Written to serve both as an internal sanity check and as raw material for a
pitch/grant application. Figures are sourced at the bottom; anything marked **(est.)** is our own
back-of-envelope estimate and should be replaced with harder data before it goes into a deck._

## 1. The product in one paragraph

A phone number an older person can call — from any landline or "dumb" mobile — to talk to an AI
that remembers them. It answers questions ("what's this medicine for?", "who won the match?"),
takes notes, sets reminders, and keeps them company. It also calls _them_: scheduled check-ins,
medication reminders, a chat in the evening. Their family gets an app to see how things are going,
receive alerts, and shape the experience (topics, reminders, people and facts to remember).

Four jobs, one channel:

| Job | Who cares most | Closest existing substitute |
|---|---|---|
| **Access to AI** for people without smartphones | Senior | Asking a grandchild; nothing |
| **Stateful assistant** (notes, reminders, Q&A) | Senior, family | Paper notes, family phone calls |
| **Companionship** against loneliness | Senior, family, public sector | Family, volunteers, TV/radio |
| **Monitoring & wellbeing signals** | Family, care providers, public sector | Telecare SOS wristbands, daily phone calls by family |

## 2. Why now, why Poland

**Demographics.** Poland is one of the fastest-ageing societies in the EU.
- 65+ is ~21% of the population (≈7.8–7.9M people) as of end-2025; GUS put it at 20.6% / 7.7M in 2024.
- 60+ was 26.6% in 2024 and is projected to reach **38.3% by 2060**.
- One-person households rose from 22% (2006) to 35% (2025). Over-65s living with their children
  fell from 15% to 6% over the same period. The multigenerational household that used to absorb
  eldercare is disappearing.
- Share of 65+ living alone: PIE/Eurostat put it at 13% (≈1M people). Census-based (NSP 2021)
  sources suggest a higher figure. **Get the exact NSP table before pitching.**
- Poland is short more than 20,000 elderly caregivers (per an NCBR-funded project), and help often
  takes several days to arrive.

**The digital gap is the opportunity.** This is the strongest data point for the "democratise AI"
thesis (CBOS, May 2026):
- Only **8%** of Poles 65+ used generative AI in the last 3 months, against 81% of 18–24s.
- **46%** of Polish seniors don't use the internet at all.
- Among 65+ non-users, **44%** say they _don't know how_ to use AI. Only 64% say "no need", so a
  substantial minority would try it given an accessible interface.
- Seniors who _do_ use AI use it relationally: **43%** of 65+ AI users use it weekly for
  companionship or entertainment (24% of all users). **17%** talk to it about personal matters or
  emotions (9% of all users).

The interface (a phone call) is the product insight. Our users already own the device, already
know how to use it, and already trust it as a way to talk to people.

**Loneliness.** Polish surveys measure loneliness differently, so headline numbers vary. Roughly
1 in 5 people 65+ report feeling lonely (ARC Rynek i Opinia for Mali Bracia), and that share rises
steeply above 80. The MANKO 2025 study (n≈1,756, age 60+) found evenings are the hardest time for
40% of seniors. Evenings are a natural slot for outbound calls.

**Tech readiness.** Real-time STT/TTS with natural Polish (ElevenLabs was founded by Poles and
Polish quality is strong), sub-second LLM responses, and telephony at a cent per inbound minute
made this feasible only in the last ~18 months. The POC in this repo is the proof.

## 3. Competitive landscape

The category is **crowded in the US, emerging in Western Europe, and nearly empty in Poland/CEE.**
Almost every competitor is positioned as a _companion/check-in_ service. Hardly any is positioned
as a _general AI assistant over the phone_. That is our gap.

### 3.1 Direct: AI calls the senior on an ordinary phone

| Player | Market | Model / price | Notes |
|---|---|---|---|
| **Meela** | US (works internationally) | ~$40/mo, B2C | Bain Capital Ventures-backed; scheduled outbound calls; discloses it's AI |
| **ElderVoice** | US | $49/mo, 7-day trial | Outbound calls, reminders, family alerts on worrying signals |
| **JoyCalls**, **Loved (Kindable)**, **koecall.ai** | US | B2C subs | Daily calls + family summaries; koecall added outbound only in Sep 2026 |
| **CareYaya QuikTok** | US | B2C/B2B | Adds early screening for cognitive decline & depression |
| **inTouch "Mary"** | FR, UK (US from Nov 2026) | €29.90/mo | Partnered with **HMD/Nokia**: dedicated button on a feature phone. Family app with mood tracker. No Polish |
| **SilverFriend** | DACH | B2C, grant-funded | Ordinary-phone calls; 2026 pilot with UK charity Re-engage |
| **Opiekunek.pl** | **Poland** | ~40–100 PLN/mo, free tier | AI check-in calls + SMS medication reminders + evening email report to family. Check-in focused, no family app described |
| HackYeah 2026 "telefon-do-seniora" | Poland | Prototype | Shows the idea is "in the air" in PL |

### 3.2 Adjacent

- **Device-based companions.** ElliQ (US only, $30–60/mo plus a $250 enrollment fee), Ato (US,
  1,300+ devices), Amical AI (AI built into a senior phone). They require new hardware, which is
  the friction we avoid. They validate willingness to pay $30–60/mo in the US.
- **Telecare/SOS wristbands (PL).** Sidly (medical wristband with a basic voice assistant,
  reimbursed in France since 2025), Comarch Life (powers the "Małopolski Tele-Anioł" programme,
  10,000 residents), and the wristbands bought by gminy under _Korpus Wsparcia Seniorów_. They have
  the procurement relationships, the monitoring centres, and the public money, but no
  conversational AI. **Partners more than competitors.**
- **Human companionship.** Volunteer befriending calls (e.g. Mali Bracia Ubogich) and human
  companion services (Papa in the US, now funded through health plans). They show what buyers will
  pay for, and are a possible hybrid escalation path.
- **Big tech assistants.** ChatGPT voice, Gemini, and Alexa all need a smartphone or smart speaker
  plus setup, and none is designed around memory, families, or check-ins for this group. The real
  long-term threat is **telcos**: Deutsche Telekom showed an AI call assistant with ElevenLabs at
  MWC 2026. In Poland, Orange/Play/Plus/T-Mobile could bundle something similar, which also makes
  them a channel.

### 3.3 Where we can win

1. **Polish-first, then CEE languages.** US players won't localise for PL/CZ/SK/HU/RO soon, and
   local quality (dialect, idioms, names, Polish cultural context) is a real moat with seniors.
2. **"AI for everyone" rather than "check-in robot".** Two-way: the senior calls _in_ whenever they
   want, for anything, and it remembers. Competitors mostly do family-scheduled outbound calls,
   which feels like being monitored. Ours feels like a useful service the senior chose. That
   matters for adoption and for dignity.
3. **Family-shaped memory.** The family can seed facts ("grandson Kuba starts university in
   October"), approve reminders, and set topics. This makes conversations personal from day one,
   and it ties the payer (the child) to the user's (the parent's) experience.
4. **Scam defence as a feature.** The "na wnuczka" (grandchild impostor) scam is notorious in
   Poland, and AI voice cloning makes it worse. An assistant that the senior trusts and can ask "I
   just got a strange call, is this a scam?" turns a trust _barrier_ into a selling point.

### 3.4 Lessons from the US market

The US is 2–3 years ahead on both products and, more importantly, on **who pays**. What
transfers to Poland and the EU:

1. **The state pays, the senior gets it free, and demand exceeds supply.** The New York State
   Office for the Aging (NYSOFA) gives ElliQ devices to isolated seniors for free under a
   ~$2.1M, three-year contract. 900+ seniors have received one, **3,500+ applied in 2025 alone**,
   and there is a waitlist. Self-reported results: 94–95% feel less lonely (co-published with the
   vendor, so not independent). In March 2026 **Washington State made ElliQ a covered Medicaid
   service** for at-home long-term care, piloted through a local Area Agency on Aging.
   → _Polish analogue:_ KWS and MOPS already buy SOS wristbands for 60+. "AI calls" should be
   pitched as a line item in the same budget. A phone-based service needs no hardware logistics,
   which makes it an easier buy than a device.
2. **Human telephone reassurance programmes are being automated.** US Area Agencies on Aging have
   long run human-staffed daily "are you OK?" calls. Vendors (BenAdaptive, Blooming Health) now
   sell AI wellness calls with escalation to these agencies, and AAAs are running AI outreach
   pilots (e.g. Senior Connection / Rooted Care).
   → _Polish analogue:_ volunteer phone befriending (NGOs, parishes, Uniwersytety Trzeciego
   Wieku) and MOPS social workers. Sell to them as a force multiplier, not a replacement: the AI
   does the daily call and humans handle the flags.
3. **Insurers pay for companionship when it lowers costs.** 65+ Medicare Advantage plans pay
   **Papa** a per-member monthly fee for companionship as a supplemental benefit, and members pay
   nothing. It also drew a US Senate Aging Committee letter about quality complaints, so expect
   scrutiny.
   → _EU analogue:_ there's no direct equivalent in NFZ. The closest are **Germany's DiPA**
   (digital care applications reimbursable by long-term care insurance; verify current cap and
   listing process before relying on it) and Polish private medical subscriptions and employer
   benefits (Medicover, Lux Med, PZU Zdrowie, Enel-Med). "A caregiver benefit for employees with
   ageing parents" is an untested B2B2C channel in PL.
4. **The big money is B2B workforce augmentation, not B2C companionship.** Hippocratic AI raised
   $126M at a $3.5B valuation ($404M total) for voice agents that make non-diagnostic calls (intake,
   chronic-care follow-up, Medicare Advantage outreach) for health systems and payers. Sensi.AI
   raised a $45M Series C for audio AI sold to home-care agencies, and claims 80%+ of the largest
   North American networks as customers. Investors fund products that save care-worker hours.
   → For us: the call transcripts and wellbeing trends we produce are worth more to a care agency
   or telecare operator than to a family. Design the data model so B2B dashboards are an
   extension, not a rewrite.
5. **B2C companions are converging and commoditising.** Meela, ElderVoice, JoyCalls, Loved, and
   koecall all offer scheduled outbound calls, reminders, and family summaries for $30–50/mo.
   Differentiation is moving to **distribution**: inTouch × HMD/Nokia feature phones, telcos,
   health plans. → Don't expect features alone to win. Secure one distribution partner early
   (telco, telecare operator, or a big NGO).
6. **Heavy engagement is real, and it is a cost.** ElliQ users interact 30+ times a day, 6 days a
   week. Great for retention, but on a per-minute voice stack it is exactly the unit-economics trap
   in §6.
7. **Evidence is a selling point.** NYSOFA's loneliness numbers are weak methodologically, but they
   were enough to renew and expand a state contract. A small, well-run Polish pilot with a
   university partner could do the same for gminy and voivodeships.

## 4. Customers and revenue streams

Every payer type is viable, but they move at very different speeds. Suggested order:

| # | Segment | Who pays | Why they buy | Sales cycle | Notes |
|---|---|---|---|---|---|
| 1 | **Adult children, 35–60, of parents 75+** | Child (B2C sub) | Guilt + worry + distance; "I can't call every day" | Days | **Beachhead.** Includes the **Polish diaspora** in UK/DE/IE/NL, who are highly motivated, pay in GBP/EUR, and are reachable via diaspora media/Facebook groups |
| 2 | **Seniors themselves** | Senior (sub, or pay per call via premium number/telco bill) | Curiosity, usefulness, company | Days | Lower willingness to pay (pensions), but an inbound-only cheap tier is a growth funnel |
| 3 | **Gminy / MOPS / regional programmes** | Public money | Loneliness and "remote support" are explicit policy goals | 6–18 months, tenders | _Korpus Wsparcia Seniorów_: 65M PLN in 2025, of which the remote-support module is ~30M PLN; renewed for 2026. Also EU cohesion funds (regional "tele-angel"-type programmes) |
| 4 | **Care providers / telecare operators** | B2B white-label, per-seat | Adds daily engagement to SOS wristbands; replaces manual well-being calls | 3–9 months | Sidly, Comarch, private home-care agencies, care homes (night-time companionship) |
| 5 | **Telcos** | Revenue share / bundle | Senior tariffs, ARPU, ESG story | 9–18 months | Distribution at scale; also the main platform risk |
| 6 | **Insurers / NFZ / employers** | Later | Preventive care, caregiver benefit | Long | Needs outcome evidence first (see §7). US model: Papa × Medicare Advantage. EU hooks: German DiPA, Polish private medical subscriptions, employer caregiver benefits (§3.4) |

**Pricing benchmarks.** US: $30–50/mo (Meela, ElderVoice, ElliQ). EU: €29.90/mo (inTouch). PL:
40–100 PLN/mo (Opiekunek). A plausible Polish ladder **(est.)**:

| Tier | Price | Includes |
|---|---|---|
| Free / Senior | 0–19 PLN | Inbound calls with a fair-use cap, notes, reminders |
| Family | 59–79 PLN | Daily outbound check-in, family app, weekly summary, alerts |
| Care | 129–159 PLN | 2×/day calls, wellbeing trends, priority alerts, more minutes |
| Diaspora | €15–25 | Family tier priced for EUR/GBP payers |

## 5. Market sizing

Back-of-envelope **(est.)**, USD at ~3.7 PLN:

- **TAM, Poland:** ≈7.9M people 65+. At ~60 PLN/mo that is ≈5.7B PLN/yr (≈$1.5B). This is a
  theoretical ceiling.
- **SAM, Poland:** seniors 70+ who live alone or have limited daily contact, have an adult child
  able and willing to pay, and are not already in residential care. Roughly **1.5–2M people**
  → **1.1–1.4B PLN/yr (≈$300–390M)**.
- **SOM, 3 years:** 1–2% of SAM → **15–40k paying seniors → 11–29M PLN ARR (≈$3–8M)**, plus
  public-sector pilots. Public money is small in absolute terms (KWS ≈65M PLN/yr nationally) but
  good for credibility and reference customers.
- **Expansion, CEE + EU:** about 98M people 65+ in the EU (~22% of 450M). CEE alone (CZ, SK, HU,
  RO, Baltics, plus Ukrainian/Russian-speaking communities) has a similar profile to Poland: fast
  ageing, low senior internet use, and emigrated children.

Treat these as directional only. Before a pitch, replace the SAM assumptions with survey data:
willingness to pay among adult children, and the share of 75+ living alone (NSP 2021).

## 6. Unit economics: the trap to avoid

This is the most important internal finding. **Lonely users talk a lot.** A user who talks 30
min/day uses ~900 min/month.

Rough cost per minute for the current stack (Twilio + ElevenLabs STT/TTS + Claude) **(est.)**:

| Component | Inbound (senior calls us) | Outbound (we call senior) |
|---|---|---|
| Telephony (Twilio PL) | ~$0.01/min | ~$0.07/min to mobile (EEA origin) up to ~$0.165; ~$0.03–0.07 to fixed |
| STT + TTS | ~$0.03–0.08/min (ElevenLabs bundled agent rate is $0.08 as a ceiling) | same |
| LLM | ~$0.005–0.03/min, depending on model and context size | same |
| **Total** | **~$0.05–0.12/min** | **~$0.11–0.28/min** |

So a 900-min/month user costs **$45–110/month** (≈170–400 PLN), which is more than any Polish B2C
price point. Implications:
- **Design for minute economics from day one.** Use cheaper models (Haiku) for small talk and
  escalate to bigger ones only for real questions. Cache the system prompt and memory, and keep
  context compact.
- **Use a Polish SIP trunk** instead of Twilio list prices for outbound, and **prefer inbound
  calls**. Most Polish mobile and landline plans have unlimited calls, so dialling in costs the
  senior nothing and costs us ~1 cent per minute in telephony.
- **Fair-use minutes per tier**, with a gentle in-call nudge ("let's continue tomorrow"). This is
  also good for preventing dependency (§7).
- Track **cost per active user** as a first-class metric next to retention.

## 7. Risks and hard questions

| Risk | Why it matters | Mitigation |
|---|---|---|
| **Thin efficacy evidence** | Reviews find AI _may_ reduce loneliness, but trials are small and short, and a 2026 pilot of AI wellness calls showed no significant change. B2G and insurers will ask for outcomes | Measure from day one (UCLA-3 loneliness scale, engagement). Partner with a university (e.g. a gerontology unit) for a controlled pilot. That evidence is itself a moat |
| **EU AI Act** | Art. 50 transparency (users must know they're talking to AI) applies from Aug 2026. Art. 5 bans manipulation that exploits age-related vulnerability. Emotional-dependency design patterns are a legal _and_ ethical risk | Disclose AI on every call, no dark patterns, no engagement-maximising prompts, document the design choices |
| **GDPR special-category data** | "Psychological assessment" and health reminders are health data (Art. 9). Family dashboards raise consent questions, especially with cognitive decline | Explicit senior consent, a DPIA, data minimisation, a senior-controlled "don't tell my family" switch, EU data residency |
| **Medical device regulation (MDR)** | Claiming to _detect_ depression or dementia can make the software a medical device (class IIa+) | Launch framed as wellbeing and trends, not diagnosis. Treat clinical claims as a separate, later track |
| **Safety-critical moments** | Suicide risk among older Polish men is high. Callers may describe a medical emergency | Hard-coded escalation flows (112, family, Telefon Zaufania), human-in-the-loop for alerts, red-team tests in Polish |
| **Trust & scams** | Seniors are taught to distrust unknown voices on the phone. A cloned "assistant" voice could be abused | A fixed, known number and voice, a family-introduced onboarding call, and a verbal passphrase |
| **Payer ≠ user** | The child pays and the parent uses. If the parent feels surveilled, they stop answering | The senior-first product principle (§3.3.2). Families get summaries, not transcripts, by default |
| **Churn by design** | Users move to care homes, lose hearing, or die. B2C lifetime value is capped | B2B/B2G contracts where the seat survives the individual. Family referrals |
| **Platform risk** | Telcos or big AI labs bundle "AI by phone" | Move fast on Polish/CEE quality, family features, and B2G references. Make telcos a channel |
| **Unit economics** | See §6 | See §6 |

## 8. Recommended go-to-market (first 12–18 months)

1. **Closed beta, 30–50 families** (friends, family, diaspora groups). Goal: retention of the
   _senior_ after 8 weeks, minutes per day, cost per active user, and the WTP of the child.
2. **Launch B2C in Poland plus the diaspora** with a Family tier. Channels: diaspora Facebook
   groups, Polish media in the UK/DE, pharmacies, parishes, Uniwersytety Trzeciego Wieku, local
   radio (seniors' medium).
3. **2–3 gmina pilots** using KWS remote-support money or MOPS budgets. Partner with a telecare
   operator that already wins those tenders (Sidly, Comarch) rather than competing with them.
4. **Evidence track:** an academic partner, a pre-registered pilot, and a published report. This
   unlocks insurers and NFZ, and is great grant material (NCBR, PARP, EU cohesion and Horizon
   "healthy ageing" calls; verify current calls).
5. **Second country:** Czechia or Slovakia (similar ageing curve, small markets underserved by US
   players). Alternatively, follow the diaspora to UK Polish speakers first.

## 9. Open questions for the team

- **Positioning:** do we lead with "AI for grandma" (assistant/access) or "never lonely"
  (companion)? The data supports access as the differentiator and companionship as the retention
  engine.
- **Persona:** one consistent named voice per user, or one brand persona? Can families pick?
- **Escalation:** where is the line between "tell the family" and the senior's privacy?
- **Hybrid:** is there a paid human tier (volunteers or students) for escalations and for the
  loneliest users?
- **Validation:** what is the WTP survey with 100 adult children that would validate §4–5 cheaply?

## Sources

Demographics & society
- Eurostat via Trading Economics, share of population 65+, Poland: https://tradingeconomics.com/poland/proportion-of-population-aged-65-over-eurostat-data.html
- CBOS, "Polish Senior Citizens in 2025" (60+ share, 2060 projection, activity trends): https://cbos.pl/EN/publications/cbos_news_text.php?no=29/2025
- Notes from Poland / PIE, one-person households and seniors living alone (June 2026): https://notesfrompoland.com/2026/06/25/over-a-third-of-households-in-poland-now-consist-of-one-person-amid-demographic-change/
- GUS, ageing in light of NSP 2021: https://stat.gov.pl/spisy-powszechne/nsp-2021/nsp-2021-wyniki-ostateczne/starzenie-sie-ludnosci-polski-w-swietle-wynikow-narodowego-spisu-powszechnego-ludnosci-i-mieszkan-2021,3,1.html
- Polsat News on CBOS "Korzystanie ze sztucznej inteligencji" (fieldwork May 2026): https://www.polsatnews.pl/ciekawostki/2026-08-18/seniorzy-znalezli-nietypowe-zastosowanie-dla-ai-badanie-cbos-mowi-jasno/
- MANKO 2025 report (Głos Seniora): https://glosseniora.pl/wp-content/uploads/Raport-2025-MANKO-wersja-cyfrowa.pdf
- mp.pl, "Samotność seniora": https://www.mp.pl/pacjent/aktualnosci/187233,samotnosc-seniora

Public programmes & telecare
- MRPiPS, Korpus Wsparcia Seniorów 2025: https://www.gov.pl/web/rodzina/145-mln-zl-na-wsparcie-seniorow-w-2025-roku
- KWS 2026 edition: https://www.gov.pl/web/dolnoslaski-uw/program-korpus-wsparcia-seniorow-na-2026-rok
- Sejm committee transcript (remote-support module): https://api.sejm.gov.pl/sejm/term10/committees/PSN/sittings/69/pdf
- Sidly / NCBR project: https://www.gov.pl/web/ncbr-en/development-of-an-intelligent-telemedicine-system-with-a-fall-prediction-function
- Sidly reimbursement in France: https://xyz.pl/opaska-sidly-objeta-refundacja-we-francji-polska-spolka-stawia-na-ekspansje/
- Comarch Life Wristband / Tele-Anioł: https://www.comarch.com/healthcare/products/remote-medical-care/remote-care-services/wristband/

Competitors
- Meela launch: https://www.businesswire.com/news/home/20250911525548/en/Meela-Launches-Personalized-AI-Companion-to-Combat-Loneliness-Epidemic-Among-Seniors
- ElderVoice: https://www.eldervoice.com/
- JoyCalls: https://joycalls.ai/
- CareYaya QuikTok: https://www.careyaya.org/resources/news/quiktok
- inTouch "Mary": https://intouch.family/en
- SilverFriend: https://www.silverfriend.de/en
- Amical AI: https://amical-ai.com/en/
- Ato: https://www.prweb.com/releases/ato-is-the-voice-first-ai-companion-to-combat-senior-loneliness-and-empower-family-caregivers-302756517.html
- ElliQ pricing: https://elliq.com/products/annual-subscription and https://elliq.com/pages/faqs
- Opiekunek.pl: https://opiekunek.pl/blog/ai-w-opiece-nad-seniorami
- HackYeah 2026 prototype: https://github.com/BK006/telefon-do-seniora
- Papa: https://www.theseniorlist.com/home-care/papa-pals/

US market & payers
- NYSOFA ElliQ initiative: https://aging.ny.gov/elliq-proactive-care-companion-initiative
- NYSOFA 2023 results (95% claim): https://aging.ny.gov/news/nysofas-rollout-ai-companion-robot-elliq-shows-95-reduction-loneliness
- Boston Globe on ElliQ / NYSOFA contract (June 2026): https://www.bostonglobe.com/2026/06/28/opinion/seniors-loneliness-robots-relationship-elliq/
- AOL, free ElliQ demand in NY (2025 applicants): https://www.aol.com/articles/ai-robots-moving-lonely-elderly-115800155.html
- Washington State Medicaid covers ElliQ (Mar 2026): https://briefglance.com/articles/washington-taps-ai-companion-to-bolster-at-home-medicaid-care
- ACL/NCSC July 2026 webinar takeaways (AAA AI outreach pilot): https://acl.gov/sites/default/files/NCSC/ncsc-july-2026-webinar-takeaways-technology.pdf
- Blooming Health for AAAs: https://gobloominghealth.com/area-agencies-on-aging-2
- KFF Health News, Medicare Advantage plans pay Papa: https://kffhealthnews.org/news/article/medicare-advantage-plans-senior-companions-profits/
- Senate Aging Committee letter re Papa: https://www.aging.senate.gov/imo/media/doc/letter_to_cms_re_papa_inc.pdf
- Hippocratic AI Series C: https://hitconsultant.net/2025/11/03/hippocratic-ai-raises-126m-to-accelerate-generative-ai-healthcare-agents
- Sensi.AI Series C: https://www.newswire.com/news/sensi-ai-raises-45m-series-c-extending-its-dominance-of-care-22653210

Evidence & regulation
- Systematic review, AI applications to reduce loneliness in older adults: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11898439/
- Voice-assistant modalities study: https://pmc.ncbi.nlm.nih.gov/articles/PMC10961806/
- Cloned-voice wellness-call pilot (preprint): https://preprints.jmir.org/preprint/110849
- AI Act Art. 5 (Commission service desk): https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-5
- FPF on manipulation & vulnerability under the AI Act: https://fpf.org/blog/red-lines-under-the-eu-ai-act-understanding-manipulative-techniques-and-the-exploitation-of-vulnerabilities/

Costs
- Twilio Voice pricing, Poland: https://www.twilio.com/en-us/voice/pricing/pl
- ElevenLabs agent pricing guide: https://elevenlabs.io/blog/ai-voice-agent-pricing-guide
