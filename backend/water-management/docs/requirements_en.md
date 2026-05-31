# Hackathon Requirements — "OpenWave"

> **Project context:** Narimanov District (Baku). The challenge is to build a digital system for the **identification, recording, prioritization, and resolution-monitoring** of territorial (municipal / urban-maintenance) problems within the district.
>
> *This document is a full English translation of the original Azerbaijani hackathon rules PDF (`Hackathon_Rules.pdf`). Everything from the source is included.*

---

## 1. The Challenge / Case

**Build a mechanism for identifying, recording, prioritizing, and monitoring the resolution of territorial problems.**

The solution must cover the full lifecycle of an urban problem — from the moment a citizen or inspector spots it, through assignment and tracking, to verified resolution and archiving.

### 1.1 Core Functional Requirements

The system must provide:

1. **Systematic, planned, and route-based inspection of the territory.**
   - Ensure the district can be surveyed in an organized, scheduled, route-optimized way.

2. **An electronic application for operative problem registration.**
   - Allow detailed information about identified problems to be recorded quickly.
   - Provide monitoring and appropriate routing/dispatching capabilities for representatives of relevant institutions and other responsible persons.

3. **Accessible information and management via a mobile app.**
   - Mobile application must support: **photo + geolocation + problem category**.

4. **A live "situation map" of the district.**
   - A real-time map showing the current state of problems across Narimanov.

5. **A management dashboard for interactive reporting.**
   - Substantial management/analytics capabilities for decision-makers (Dashboard).

6. **A digital archive and audit-trail mechanism.**
   - Keep a digital record and audit log of all actions for traceability.

7. **Prioritization.**
   - Ability to determine and rank the priority of problems.

8. **Task assignment and status tracking.**
   - Assign an executor and a responsible person to each task.
   - Set objective deadlines.
   - Track status until the problem is fully resolved.

9. **Automatic alerts for deadline delays.**
   - When a deadline is missed/at risk, the system must send automatic notifications.

10. **Coordination of communal & utility services operating in the district.**
    - A systematic action plan covering **preventive and operational measures**, taking into account:
      - accidents or interruptions in water, gas, and electricity supply;
      - tree falls caused by weather conditions;
      - flooding;
      - road icing;
      - and other such cases — incorporating **weather-forecast data and information from other sources**.

---

## 2. What Counts as a "Territorial Problem"

The following situations are explicitly defined as territorial problems the system should handle:

1. **Fences & building facades** — fading paint, peeling facade material, and other cases on residential and non-residential buildings that need routine repair.
2. **Green zones** — yellowing, dying vegetation, and problems caused by failure to mow/maintain on time.
3. **Fallen trees** — problems observed when consequences of tree falls (weather or other causes) are not cleared in time.
4. **Flooding** — problems observed when consequences of flooding during intensive rainfall are not cleared in time.
5. **Icing** — problems on sidewalks and streets during sharp snowy/frosty weather.
6. **Street cleanliness** — observed cleanliness problems on streets, avenues, and sidewalks.
7. **Garbage containers** — problems related to the condition of waste containers.
8. **Dug-up asphalt** — failure to restore asphalt on time after laying water, gas, or other utility lines.
9. **Road resurfacing** — issues with renewing asphalt on streets and avenues that need repair.
10. **Advertising boards** — unsatisfactory appearance of ad boards.
11. **Storefronts/showcases** — appearance problems of public-catering and trade objects, enterprises, and organizations.
12. **Parks & playgrounds** — broken children's/sports attractions and benches in neighborhoods and parks not repaired on time.
13. **Fountains** — problems with the functionality of fountains.
14. **Sidewalks & curbs** — unsatisfactory condition of sidewalk covering and curbs.
15. **Construction-site fences** — unsatisfactory appearance of construction-site barriers.
16. **Lighting** — problems with light poles and specially illuminated zones.

---

## 3. Judging Criteria (Total: 100 Points)

| # | Criterion | Points | What the judges assess |
|---|-----------|:------:|------------------------|
| 1 | **Problem Solving & Relevance** | **20** | Does the solution fully answer the chosen case/topic? Does it genuinely solve one of the *real* problems of Narimanov district? |
| 2 | **Technical Implementation (Working Prototype)** | **30** | Did the team deliver not just an idea but a **working product / prototype**? Is the code quality good and are the chosen technologies appropriate? |
| 3 | **Innovation & Creativity** | **15** | Is the idea new? How does it differ from existing traditional solutions or other apps on the market? Are advanced technologies like **AI** used creatively? |
| 4 | **UX/UI (User Experience)** | **15** | Is the platform/app understandable, visually clean, and easy to use — for both **citizens** and **Executive Authority staff**? |
| 5 | **Feasibility** | **10** | Can this project realistically be deployed in Narimanov district, technically and financially? Could a government institution easily integrate it into its existing systems? |
| 6 | **Presentation Skills** | **10** | Could the team clearly explain the project within **5 minutes**? Did they give solid answers to the jury's questions in the **Q&A** session? |

---

## 4. Key Things to Know / Takeaways

- **Two user types must be served:**
  1. **Citizens** — report problems easily (mobile: photo + geolocation + category).
  2. **Executive Authority / municipal staff** — manage, assign, prioritize, and resolve problems (dashboard, map, audit, alerts).

- **Biggest point weight is on the working prototype (30 pts).** A functioning product beats a slide-only idea — make sure something actually runs.

- **AI is explicitly encouraged** (Innovation criterion) — e.g., auto-categorizing problems from photos, prioritization, routing optimization, predictive/preventive maintenance using weather data.

- **Feasibility matters (10 pts):** design with real-world government integration in mind. Keep it technically and financially realistic.

- **Presentation:** prepare a **5-minute** pitch and be ready for **Q&A**.

- **Suggested core components to build:**
  - 📱 Citizen **mobile app** (photo + GPS + category submission)
  - 🗺️ Live **situation map** of the district
  - 📊 Management **dashboard** (analytics + interactive reporting)
  - ✅ **Task lifecycle**: assign → deadline → status tracking → resolution
  - 🔔 **Automatic deadline/delay alerts**
  - 🗄️ **Digital archive + audit trail**
  - 🌦️ **Coordination module** integrating weather forecasts & utility-service data for preventive action

---

*Translated from the original Azerbaijani source. Project / event name in the PDF: **OpenWave**.*
