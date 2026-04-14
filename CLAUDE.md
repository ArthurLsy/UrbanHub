# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

```bash
./gradlew build          # build the project
./gradlew test           # run all tests
./gradlew test --tests "caensup.eadl.urbanhub.controller.MeasureControllerTest.getMeasuresShouldReturnMeasureList"  # run single test
./gradlew bootRun        # run the application
```

## Architecture Overview

### Two main workflows

1. **Ingest** (`/ingest/measures`) — receives sensor measurements (Air, Noise, Traffic, Weather) via `IngestMeasureController`, validates them through domain-specific `MeasureBase` subclasses, and persists to TimescaleDB via `MeasureIngestServiceImpl`
2. **Consultation** (`/api/measures`) — queries persisted measurements via `MeasureController` and `MeasureQueryService`

### Key architectural points

- **TimescaleDB hypertable**: The `measure` table is partitioned by `timestamp`. `TimescaleDbInitializer` converts the Hibernate-created table into a hypertable via `create_hypertable()` at startup.
- **Composite key**: `Measure` uses `MeasureId` as `@EmbeddedId` with `(timestamp, sensor_uuid)`.
- **Measure domain model**: `types/measures/MeasureBase` is the abstract base; concrete types (`AirMeasure`, `NoiseMeasure`, etc.) provide `type()` and `validate()` — domain rules live in these classes, not in services.
- **Auto-registration**: `MeasureIngestServiceImpl.ingestMeasure()` creates `Sensor` entities on-the-fly if they don't exist.
- **Two service layers**: `MeasureIngestServiceImpl` (ingest, implements `MeasureIngestService`) and `MeasureQueryService` (consultation) are separate — avoid coupling them.
- **Naming conflict**: The JPA entity `Measure` is separate from the domain base class `MeasureBase` — do not confuse them.

### Package structure

```
entity/           — JPA entities (Sensor, Measure, MeasureId, SensorType, Zone)
repository/       — Spring Data JPA repositories (SensorRepository, MeasureRepository, SensorTypeRepository, ZoneRepository)
controller/      — MeasureController (consultation)
ingest/api/       — IngestMeasureController and DTOs (IngestMeasureJson)
ingest/service/   — MeasureIngestService interface + MeasureIngestServiceImpl
ingest/exception/ — InvalidMeasureException, SensorNotFoundException, GlobalExceptionHandler
service/          — MeasureQueryService (consultation business logic)
types/measures/   — Domain model (MeasureBase, MeasureFactory, MeasureType, AirMeasure, NoiseMeasure, TrafficMeasure, WeatherMeasure)
dto/              — MeasureDto
config/           — TimescaleDbInitializer
```
