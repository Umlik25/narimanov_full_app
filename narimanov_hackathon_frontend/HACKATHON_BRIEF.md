# Narimanov Hackathon Brief

Source: `/Users/muradhajiyev/Downloads/Openwave x Internal.pdf`

## Core Challenge

Build a mechanism for identifying, recording, prioritizing, and monitoring the resolution of territory-level problems in Narimanov district.

The expected solution is an electronic application/platform that enables systematic field inspections, quick problem registration, responsible-agency routing, monitoring, reporting, and auditability.

## Expected Capabilities

- Planned, systematic, route-based inspection of district territory.
- Fast registration of detected problems with detailed information.
- Mobile reporting with photo, geolocation, and problem category.
- Oversight and routing for representatives of relevant agencies and responsible persons.
- A live district "situation map".
- Interactive dashboard for reporting and management.
- Digital archive and audit trail.
- Priority assignment for reported issues.
- Assignment of executor and responsible person for each task.
- Objective deadline setting and status tracking until full resolution.
- Automatic alerts when deadlines are missed.
- Coordination of municipal/utility organizations across water, gas, electricity, weather-related incidents, treefall, flooding, road icing, and similar operational cases.
- Preventive and operational activity planning using weather forecasts and other incoming information sources.

## Problem Categories Mentioned

- Faded paint, damaged facade material, and other current repair needs on fences, residential buildings, and non-residential buildings.
- Yellowing, destruction, or delayed mowing of green areas.
- Delayed cleanup after treefall caused by weather or other reasons.
- Delayed response to flooding after heavy rainfall.
- Icing on sidewalks and streets during snowy or frosty weather.
- Cleanliness problems on streets, avenues, and sidewalks.
- Problems with garbage container condition.
- Delayed asphalt restoration after utility line excavation for water, gas, and other communications.
- Streets and avenues needing asphalt renewal.
- Poor condition of advertising boards.
- Poor storefront/window appearance for catering, trade, institutions, and organizations.
- Broken playground/sports equipment and benches in renovated yards and parks not repaired on time.
- Fountain operability problems.
- Unsatisfactory condition of sidewalks and curbs.
- Poor appearance of construction site fences.
- Problems with light poles and special lighting zones.

## Judging Criteria

| Criterion | Points | What Judges Will Look For |
| --- | ---: | --- |
| Problem solution and relevance | 20 | Whether the chosen case is fully addressed and solves a real Narimanov district problem. |
| Technical execution / working prototype | 30 | Whether the team delivers a working product or prototype, plus appropriate code quality and technology choices. |
| Innovation and creativity | 15 | Whether the idea is new, differentiated from traditional or market solutions, and creatively uses advanced technology such as AI. |
| UX/UI | 15 | Whether the platform is clear, visually clean, and easy to use for citizens and Executive Authority employees. |
| Feasibility | 10 | Whether the project can realistically be deployed in Narimanov district from technical and financial perspectives, and integrated by a government body. |
| Presentation skill | 10 | Whether the team explains the project clearly in 5 minutes and handles Q&A convincingly. |

## Strategic Implications

- The highest-value slice is a working prototype, because technical execution is worth 30 points.
- The product should visibly serve two audiences: citizens/field inspectors who report issues, and authority staff who triage, assign, monitor, and close them.
- A map-centered workflow is strongly aligned with the brief.
- AI should be practical, not decorative: for example, category/severity suggestion from photo and description, duplicate detection, priority scoring, deadline-risk prediction, or summary generation for officials.
- The demo should show the full lifecycle: report -> map marker -> priority -> assignment -> deadline -> status changes -> dashboard metrics -> audit trail.
- Feasibility matters: use deployable, common technology and explain how the district can adopt it with minimal integration risk.

## MVP Recommendation

Build a web app with responsive mobile reporting rather than separate native mobile apps. This gives the team one codebase while still satisfying mobile photo/geolocation needs.

Core demo flow:

1. Reporter opens mobile-friendly issue form.
2. Reporter adds photo, category, description, and location.
3. System suggests category, priority, duplicate risk, and deadline.
4. Issue appears on live map and dashboard.
5. Admin assigns responsible organization/person.
6. Status and deadline are tracked.
7. Overdue items trigger visible alerts.
8. Dashboard shows category counts, SLA/overdue metrics, map density, and recent actions.

## 48-Hour Build Priorities

1. Working end-to-end issue lifecycle.
2. Map and dashboard that look credible in a 5-minute demo.
3. AI-assisted triage features that are easy to explain.
4. Clean UX for both reporter and admin.
5. Seeded demo data matching Narimanov-style categories.
6. Pitch narrative and Q&A preparation.
