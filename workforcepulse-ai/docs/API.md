# API Reference

Base URL during local development:

```txt
http://localhost:4000
```

## Health

```http
GET /api/health
```

Returns service status and timestamp.

## Dashboard Summary

```http
GET /api/analytics/summary
```

Returns KPI cards used by the dashboard.

## Occupations

```http
GET /api/analytics/occupations
GET /api/analytics/occupations?region=VIC
GET /api/analytics/occupations?category=Data
```

Returns structured labour market records.

## Forecast

```http
GET /api/analytics/forecast/fs-dev
```

Returns historical demand and six future forecast points for a selected occupation.

## Skills

```http
GET /api/analytics/skills
```

Returns skill gap ranking with demand, supply, gap score, and priority.

## Insights

```http
GET /api/analytics/insights
```

Returns simple AI-style recommendations generated from skill gap data.

## Scenario Simulator

```http
POST /api/analytics/scenario
Content-Type: application/json

{
  "occupationIds": ["fs-dev", "ml-eng"],
  "trainingSeats": 120,
  "months": 12,
  "region": "VIC"
}
```

Returns estimated filled roles, remaining gap, ROI score, and affected skills.
