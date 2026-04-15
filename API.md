# UrbanHub — API Reference

Base URL : `http://localhost:8080`

---

## Mesures

### GET /api/measures
Retourne toutes les mesures. Filtrable par capteur via `sensor_id`.

**Paramètres (optionnels)**
| Nom | Type | Description |
|---|---|---|
| `sensor_id` | string | Identifiant métier du capteur |

**Exemples**
```
GET /api/measures
GET /api/measures?sensor_id=CAPTEUR_01
```

**Réponse**
```json
[
  {
    "uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "measureId": null,
    "timestamp": "2026-04-14T10:30:00Z",
    "value": 42.5,
    "unit": "µg/m³",
    "sensorId": "CAPTEUR_01",
    "latitude": 49.1829,
    "longitude": -0.3707,
    "sensorStatus": true,
    "zoneId": "CENTRE",
    "sensorTypeId": "AIR"
  }
]
```

---

### GET /api/measures/count
Retourne le nombre total de mesures en base.

```
GET /api/measures/count
```

**Réponse**
```json
1042
```

---

### GET /api/measures/by-day
Retourne toutes les mesures d'une journée donnée (00:00:00 → 23:59:59 UTC).

**Paramètres**
| Nom | Type | Description |
|---|---|---|
| `date` | string | Date au format `yyyy-MM-dd` |

```
GET /api/measures/by-day?date=2026-04-14
```

**Réponse** : même structure que `/api/measures`

---

### GET /api/measures/by-date-range
Retourne les mesures comprises entre deux dates (inclusif).

**Paramètres**
| Nom | Type | Description |
|---|---|---|
| `from` | string | Date de début `yyyy-MM-dd` |
| `to` | string | Date de fin `yyyy-MM-dd` |

```
GET /api/measures/by-date-range?from=2026-04-01&to=2026-04-14
```

**Réponse** : même structure que `/api/measures`

---

### POST /ingest/measures
Ingère une nouvelle mesure depuis un capteur.

**Body**
```json
{
  "sensor_id": "CAPTEUR_01",
  "type": "AIR",
  "timestamp": "2026-04-14T10:30:00Z",
  "location": "49.1829;-0.3707",
  "value": 42.5,
  "unit": "µg/m³"
}
```

| Champ | Obligatoire | Description |
|---|---|---|
| `sensor_id` | oui | Identifiant métier du capteur |
| `type` | oui | Type de capteur (`AIR`, `NOISE`, `TRAFFIC`, `WEATHER`) |
| `timestamp` | oui | ISO 8601 |
| `location` | non | Coordonnées `"lat;lon"` |
| `value` | oui | Valeur mesurée |
| `unit` | oui | Unité de mesure |

**Réponse** : `200 OK` (pas de body)

---

## Zones

### GET /api/zones
Retourne toutes les zones.

```
GET /api/zones
```

**Réponse**
```json
[
  {
    "uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "zoneId": "CENTRE"
  }
]
```

---

### GET /api/zones/count
Retourne le nombre total de zones.

```
GET /api/zones/count
```

**Réponse**
```json
5
```

---

### GET /api/zones/by-id
Retourne une zone par son identifiant métier. Retourne `404` si introuvable.

**Paramètres**
| Nom | Type | Description |
|---|---|---|
| `zone_id` | string | Identifiant métier de la zone |

```
GET /api/zones/by-id?zone_id=CENTRE
```

**Réponse**
```json
{
  "uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "zoneId": "CENTRE"
}
```

---

## Types de capteur

### GET /api/sensor-types
Retourne tous les types de capteur.

```
GET /api/sensor-types
```

**Réponse**
```json
[
  {
    "uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "sensorTypeId": "AIR"
  }
]
```

---

### GET /api/sensor-types/count
Retourne le nombre total de types de capteur.

```
GET /api/sensor-types/count
```

**Réponse**
```json
4
```

---

### GET /api/sensor-types/by-id
Retourne un type de capteur par son identifiant métier. Retourne `404` si introuvable.

**Paramètres**
| Nom | Type | Description |
|---|---|---|
| `sensor_type_id` | string | Identifiant métier du type |

```
GET /api/sensor-types/by-id?sensor_type_id=AIR
```

**Réponse**
```json
{
  "uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "sensorTypeId": "AIR"
}
```

---

## Tendances

### GET /api/trends/sensor/latest-vs-previous
Retourne la tendance du dernier point (N) par rapport au point précédent (N-1) pour un capteur donné.

**Paramètres**
| Nom | Type | Description |
|---|---|---|
| `sensor_id` | string | Identifiant métier du capteur |

```
GET /api/trends/sensor/latest-vs-previous?sensor_id=sensor-centre-1
```

**Réponse** : objet TrendDto
```json
{
  "sensorId": "sensor-centre-1",
  "zoneId": "CENTRE",
  "timestamp": "2026-04-15T11:00:00Z",
  "value": 10.0,
  "previousValue": 8.0,
  "changeAbsolute": 2.0,
  "changePercent": 25.0,
  "comparedTo": "N-1"
}
```

> Remarque : si le capteur n'a pas au moins deux mesures, la route renvoie `null` (implémentation actuelle).

---

### GET /api/trends/sensor/latest-vs-24h
Compare le dernier point (N) au point le plus proche situé à ~24 heures avant (N-24h).

**Paramètres**
| Nom | Type | Description |
|---|---|---|
| `sensor_id` | string | Identifiant métier du capteur |

```
GET /api/trends/sensor/latest-vs-24h?sensor_id=sensor-centre-1
```

**Réponse** : objet TrendDto
```json
{
  "sensorId": "sensor-centre-1",
  "zoneId": "CENTRE",
  "timestamp": "2026-04-15T11:00:00Z",
  "value": 10.0,
  "previousValue": 6.0,
  "changeAbsolute": 4.0,
  "changePercent": 66.666664,
  "comparedTo": "N-24h"
}
```

> Logique : le service recherche la mesure la plus proche de `timestamp - 24h` (avant ou après) et l'utilise comme référence.

---

### GET /api/trends/zone/period
Calcule, pour chaque capteur d'une zone sur une période donnée, la tendance entre la dernière et la précédente mesure présentes dans cette fenêtre temporelle (pas de moyenne, seulement différences).

**Paramètres**
| Nom | Type | Description |
|---|---|---|
| `zone_id` | string | Identifiant métier de la zone |
| `start` | string (ISO) | Début de la période (ex: `2026-04-14T10:00:00Z`) |
| `end` | string (ISO) | Fin de la période (ex: `2026-04-15T12:00:00Z`) |

```
GET /api/trends/zone/period?zone_id=CENTRE&start=2026-04-14T10:00:00Z&end=2026-04-15T12:00:00Z
```

**Réponse** : liste d'objets TrendDto
```json
[
  {
    "sensorId": "sensor-centre-1",
    "zoneId": "CENTRE",
    "timestamp": "2026-04-15T11:00:00Z",
    "value": 10.0,
    "previousValue": 8.0,
    "changeAbsolute": 2.0,
    "changePercent": 25.0,
    "comparedTo": "period-last-vs-previous"
  },
  {
    "sensorId": "sensor-centre-2",
    "zoneId": "CENTRE",
    "timestamp": "2026-04-15T11:00:00Z",
    "value": 70.0,
    "previousValue": 65.0,
    "changeAbsolute": 5.0,
    "changePercent": 7.6923075,
    "comparedTo": "period-last-vs-previous"
  }
]
```

> Remarque : un capteur doit avoir au moins deux mesures dans la période pour apparaître dans la réponse.

---

## Codes d'erreur

| Code | Cas |
|---|---|
| `400 Bad Request` | Format de date invalide |
| `404 Not Found` | Ressource introuvable (`zone_id`, `sensor_type_id`) |
| `422 Unprocessable Entity` | Mesure invalide lors de l'ingestion |
