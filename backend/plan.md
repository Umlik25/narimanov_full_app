# Smart Urban Governance Platform — Final Architecture Summary

## Overview

A municipal operations and urban governance platform for Narimanov District in Baku focused on:

* issue reporting,
* territorial monitoring,
* municipal coordination,
* operational response,
* analytics,
* historical replay.

The platform is designed not just as an issue reporting tool, but as a district operational intelligence and coordination system.

---

# 1. Core Workflow

## Citizen / Inspector Reporting

Users can:

* upload photos,
* attach geolocation,
* select issue category,
* add descriptions,
* report directly from mobile devices.

Supported issue categories include:

* flooding,
* garbage,
* lighting,
* roads,
* water,
* electricity,
* gas,
* public space damage,
* emergency situations.

---

# 2. Validation & Moderation Layer

Reports are not immediately visible publicly.

Workflow:

```text
Submitted
→ Under Review
→ Accepted / Rejected
```

Administrators can:

* validate reports,
* reject spam,
* merge duplicates,
* correct categories,
* manage visibility.

Only verified issues become visible on the operational map.

---

# 3. Operational Lifecycle

Issue lifecycle:

```text
Submitted
→ Accepted
→ Assigned
→ In Progress
→ Resolved
→ Archived
```

Additional states:

```text
Rejected
Duplicate
Needs More Info
Escalated
```

Each issue contains:

* priority,
* deadline,
* responsible department,
* assigned executor/team,
* SLA tracking status.

---

# 4. GIS / Mapping System

## Frontend Stack

* React
* Tailwind
* Leaflet
* OpenStreetMap

## Features

* live issue map,
* clustering,
* heatmaps,
* filtering,
* operational overlays,
* worker tracking,
* historical replay.

---

# 5. Scalable Spatial Architecture

## Low Zoom Levels

Backend returns aggregated clusters.

## High Zoom Levels

Backend returns individual issue markers.

This prevents:

* excessive payload sizes,
* browser freezing,
* expensive frontend rendering.

Possible future improvements:

* H3/geohash aggregation,
* precomputed cluster tables,
* advanced GIS indexing.

---

# 6. Database Architecture

## Main Operational Table

```sql
issues
```

Stores:

* current issue state,
* coordinates,
* category,
* severity,
* timestamps,
* assignments,
* workflow status.

---

# 7. Audit Log System

## Append-Only Event Table

```sql
issue_events
```

Tracks:

* approvals,
* assignments,
* priority changes,
* deadline modifications,
* status transitions,
* escalations,
* archival actions.

Purpose:

* accountability,
* transparency,
* operational replay,
* governance integrity.

---

# 8. Historical Time Travel

Historical replay is implemented using daily temporal snapshots.

## Current State

```sql
issues
```

## Historical State

```sql
issue_snapshots
```

Snapshots contain:

* issue state,
* coordinates,
* status,
* priority,
* timestamps.

Frontend can query:

```text
GET /issues?time=...
```

Minimal frontend/backend changes are required.

---

# 9. Snapshot Strategy

A scheduled worker creates daily snapshots of operational data.

Advantages:

* fast historical queries,
* simple implementation,
* avoids expensive event replay.

PostgreSQL MVCC provides consistent snapshot reads.

---

# 10. SQL Optimization

Optimization strategy:

* one primary issues table,
* partial indexes,
* spatial filtering,
* aggregation queries.

Example:

```sql
WHERE status != 'archived'
```

Archived issues remain queryable historically without affecting operational query performance.

---

# 11. Object Storage / Photos

Use S3-compatible object storage.

Recommended:

* MinIO for development and hackathon deployment.

## Storage Structure

```text
issues/{issue_id}/original/{photo_id}.jpg
issues/{issue_id}/thumb/{photo_id}.jpg
```

Database stores:

* object keys,
* metadata,
* ownership,
* visibility.

Workflow state is stored in the database, not in S3 paths.

---

# 12. Real-Time Worker Tracking

Field workers periodically send:

* GPS position,
* activity state,
* operational status.

Frontend displays:

* live worker markers,
* inspection crews,
* emergency responders.

Uses:

* WebSockets,
* incremental updates,
* viewport-based subscriptions.

Worker tracking is treated as real-time streaming data rather than static GIS data.

---

# 13. Smart Escalation System

Automatic escalation rules:

Examples:

```text
Critical issue unresolved for 24h
→ automatic escalation
```

```text
Multiple duplicate reports
→ priority increase
```

Supports:

* SLA enforcement,
* accountability,
* operational responsiveness.

---

# 14. Nearby Incident Correlation

The platform detects:

* repeated nearby complaints,
* spatial incident clusters,
* possible infrastructure failures.

Example:

```text
Many nearby water complaints
→ possible pipe rupture
```

Provides:

* proactive coordination,
* smarter dispatching,
* preventive maintenance insights.

---

# 15. Weather-Aware Operations

Weather integration supports:

* flood alerts,
* storm monitoring,
* utility preparation,
* operational risk visualization.

Example:

```text
Heavy rain forecast
→ highlight flood-prone zones
```

Supports emergency coordination workflows.

---

# 16. Priority Scoring Engine

Dynamic priority scoring based on:

* issue type,
* location,
* nearby infrastructure,
* duplicate reports,
* severity,
* issue age.

Example:

```text
Gas leak near school
→ critical priority
```

Supports smarter dispatch and operational prioritization.

---

# 17. Offline Field Inspection Support

PWA-based offline support:

* issue capture without internet,
* local caching,
* delayed synchronization.

Useful for:

* poor connectivity,
* field inspections,
* emergency response.

---

# 18. Operational Command Dashboard

Live operational dashboard displaying:

* active incidents,
* worker locations,
* overdue issues,
* alerts,
* heatmaps,
* escalations,
* department performance.

Designed to resemble municipal command center software.

---

# 19. Historical Replay Mode

Timeline slider enables:

* replay of district state,
* issue appearance/disappearance,
* worker movement,
* evolving heatmaps,
* operational history visualization.

Provides both analytical and presentation value.

---

# 20. Analytics Dashboard

Core KPIs:

* open vs resolved issues,
* average resolution time,
* SLA violations,
* issue hotspots,
* recurring infrastructure failures,
* department performance,
* issue category distribution,
* trends over time.

---

# 21. Recommended Tech Stack

## Frontend

* React
* Tailwind
* Leaflet

## Backend

* Axum or Actix Web (Rust)

## Database

* PostgreSQL

## Object Storage

* MinIO

## Real-Time Communication

* WebSockets

---

# Final Positioning

This project is not just an issue reporting application.

It is a municipal operational intelligence and coordination platform focused on:

* transparency,
* accountability,
* spatial intelligence,
* coordinated response,
* historical analysis,
* smart urban governance.
