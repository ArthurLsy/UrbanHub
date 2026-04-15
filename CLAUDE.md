# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

```bash
# Backend (Java/Spring Boot 4 / Java 21)
./gradlew build          # build the project
./gradlew test           # run all tests (generates JaCoCo report in build/reports/jacoco/)
./gradlew test --tests "caensup.eadl.urbanhub.controller.MeasureControllerTest.getMeasuresShouldReturnMeasureList"  # run single test
./gradlew bootRun        # run the application

# Frontend (React/Vite)
cd front && npm install   # install dependencies
cd front && npm run dev   # run dev server
cd front && npm run build # production build (tsc then vite)
cd front && npm run lint  # run ESLint
```

## Architecture Overview

### Backend — Spring Boot + TimescaleDB

**Three ingest paths:**
1. **HTTP** (`POST /ingest/measures`) — `IngestMeasureController` → `MeasureIngestServiceImpl`
2. **MQTT** — `MqttMeasureSubscriber` subscribes to `urbanhub/sensors/#` on connect; enabled via `mqtt.enabled=true` (controlled by `MQTT_ENABLED` env var, defaults to true). Uses `@ConditionalOnProperty` so it is absent during tests.
3. **Seed data** — `DataSeeder` (`config/DataSeeder.java`) runs on startup and populates 60 sensors (4 types × 15 locations around Caen) with 97 measurements each (48h at 30-min intervals).

**Consultation API:**
- `GET /api/measures` — filter by `sensor_id`, also `/count`, `/by-day`, `/by-date-range`
- `GET /api/zones` — CRUD (GET/POST/PUT/DELETE) via `ZoneController`
- `GET /api/sensor-types` — read-only via `SensorTypeController`

**Key architectural points:**
- **TimescaleDB hypertable**: `measure` table partitioned by `timestamp`. `TimescaleDbInitializer` converts the Hibernate-managed table into a hypertable via `create_hypertable()` at startup.
- **Composite key**: `Measure` uses `MeasureId` as `@EmbeddedId` with `(timestamp, sensor_uuid)`.
- **Measure domain model**: `types/measures/MeasureBase` is the abstract base; concrete types (`AirMeasure`, `NoiseMeasure`, `TrafficMeasure`, `WeatherMeasure`) provide `type()` and `validate()` — domain rules live here, not in services.
- **Auto-registration**: `MeasureIngestServiceImpl.ingestMeasure()` creates `Sensor` and `SensorType` entities on-the-fly if they don't exist.
- **Location format**: ingest accepts `lat,lon` or `lat;lon` in the `location` field.
- **Naming conflict**: JPA entity `Measure` ≠ domain base class `MeasureBase`.
- **Tests use H2**: `testRuntimeOnly 'com.h2database:h2'` — the TimescaleDB-specific `create_hypertable()` call is skipped in tests.

**Backend package structure:**
```
entity/            — JPA entities (Sensor, Measure, MeasureId, SensorType, Zone)
repository/        — Spring Data JPA repositories
controller/        — MeasureController, ZoneController, SensorTypeController
ingest/api/        — IngestMeasureController + IngestMeasureJson DTO
ingest/mqtt/       — MqttMeasureSubscriber (Eclipse Paho v3)
ingest/service/    — MeasureIngestService interface + MeasureIngestServiceImpl
ingest/exception/  — InvalidMeasureException, SensorNotFoundException, GlobalExceptionHandler
service/           — MeasureQueryService, ZoneService, SensorTypeService
types/measures/    — MeasureBase, MeasureFactory, MeasureType, Air/Noise/Traffic/WeatherMeasure
dto/               — MeasureDto, ZoneDto, SensorDto, SensorTypeDto, CreateZoneDto, UpdateZoneDto
config/            — TimescaleDbInitializer, DataSeeder
```

### Frontend — React + Vite + Tailwind + Recharts + Leaflet

**Stack:** React 19, Vite, TypeScript, Tailwind CSS v4, Recharts, Leaflet/react-leaflet, React Query v5, React Router v7, Radix UI primitives, shadcn/ui-style components, Sonner (toasts)

**Routes (`App.tsx`):**
- `/` — Dashboard (aggregated stats and graphs)
- `/capteurs` — Sensor list with status
- `/capteurs/:id` — Sensor detail with measure graph
- `/zones` — Zone list
- `/types-capteur` — Sensor type list
- `/comparaison` — Multi-sensor comparison chart
- `/carte` — Map view (Leaflet)
- `/kpis` — KPI page

**Package structure (front/src):**
```
pages/             — Page components
components/        — Sidebar, DataGraph, ComparisonChart; ui/ for shadcn-style primitives
queries/           — React Query hooks (measureQueries.ts, zoneQueries.ts)
services/          — API calls (measureService.ts, zoneService.ts)
types/             — TypeScript types (Measure, Sensor, SensorType, Zone)
App.tsx            — Router setup
index.css          — Tailwind + CSS variables
```

**Important conventions:**
- French labels in UI (user-facing text in French)
- API field names in English (`sensor_id`, `timestamp`, etc.)
- CSS variables for fonts: `--font-display`, `--font-body`, `--font-mono`
- Dark theme base: `#0d0f14` background, `#00e5a0` accent
