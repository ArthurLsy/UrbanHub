# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

```bash
# Backend (Java/Spring)
./gradlew build          # build the project
./gradlew test           # run all tests
./gradlew test --tests "caensup.eadl.urbanhub.controller.MeasureControllerTest.getMeasuresShouldReturnMeasureList"  # run single test
./gradlew bootRun        # run the application

# Frontend (React/Vite)
cd front && npm install   # install dependencies
cd front && npm run dev  # run dev server
cd front && npm run build  # production build
```

## Architecture Overview

### Backend — Spring Boot + TimescaleDB

**Two main workflows:**
1. **Ingest** (`POST /ingest/measures`) — receives sensor measurements (Air, Noise, Traffic, Weather) via `IngestMeasureController`, validates through `MeasureBase` subclasses, persists to TimescaleDB via `MeasureIngestServiceImpl`
2. **Consultation** (`GET /api/measures`) — queries persisted measurements via `MeasureController` and `MeasureQueryService`

**Key architectural points:**
- **TimescaleDB hypertable**: `measure` table partitioned by `timestamp`. `TimescaleDbInitializer` converts Hibernate table into hypertable via `create_hypertable()` at startup.
- **Composite key**: `Measure` uses `MeasureId` as `@EmbeddedId` with `(timestamp, sensor_uuid)`.
- **Measure domain model**: `types/measures/MeasureBase` is the abstract base; concrete types (`AirMeasure`, `NoiseMeasure`, etc.) provide `type()` and `validate()` — domain rules live here, not in services.
- **Auto-registration**: `MeasureIngestServiceImpl.ingestMeasure()` creates `Sensor` entities on-the-fly if they don't exist.
- **Two service layers**: `MeasureIngestServiceImpl` (ingest) and `MeasureQueryService` (consultation) are separate.
- **Naming conflict**: JPA entity `Measure` ≠ domain base class `MeasureBase`.

**Backend package structure:**
```
entity/           — JPA entities (Sensor, Measure, MeasureId, SensorType, Zone)
repository/       — Spring Data JPA repositories
controller/      — MeasureController (consultation API)
ingest/api/       — IngestMeasureController + IngestMeasureJson DTO
ingest/service/   — MeasureIngestService interface + MeasureIngestServiceImpl
ingest/exception/ — InvalidMeasureException, SensorNotFoundException, GlobalExceptionHandler
service/          — MeasureQueryService (consultation)
types/measures/   — MeasureBase, MeasureFactory, MeasureType, Air/Noise/Traffic/WeatherMeasure
dto/              — MeasureDto
config/           — TimescaleDbInitializer
```

### Frontend — React + Vite + Tailwind + Recharts

**Stack:** React 19, Vite, Tailwind CSS v4, Recharts, React Query, React Router v7

**Key pages:**
- `/mesures` — Dashboard with aggregated stats and graphs
- `/capteurs` — Sensor list with status (online/offline)
- `/capteurs/:id` — Sensor detail with measure graph
- `/zones` — Zone list
- `/types-capteur` — Sensor type list

**Package structure (front/src):**
```
pages/             — Page components (MeasuresPage, SensorsPage, etc.)
components/        — Reusable components (Sidebar, DataGraph)
queries/           — React Query hooks (useMeasures, useMeasuresBySensor)
services/          — API calls (measureService.ts)
types/            — TypeScript types (Measure, Sensor, SensorType, Zone)
App.tsx           — Router setup
index.css         — Tailwind + CSS variables (dark theme by default)
```

**Important conventions:**
- French labels in UI (user-facing text in French)
- API field names in English (sensor_id, timestamp, etc.)
- CSS variables for fonts: `--font-display`, `--font-body`, `--font-mono`
- Dark theme base: `#0d0f14` background, `#00e5a0` accent
