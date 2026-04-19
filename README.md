# Production Monitoring Dashboard

A production monitoring dashboard built with Next.js, TypeScript, and Tailwind CSS. The application presents a line-level reporting view for `Packaging Line 1`, including current operating status, performance trends, downtime analysis, and summary production metrics.

## Features

- Full-screen dashboard shell with persistent navigation
- Shared report date range with preset filters and custom date selection
- Production report view with:
  - current line status
  - performance trend chart
  - average speed, total produced, and average performance metrics
  - status timeline across the selected period
  - downtime ranking by impact
- Mock REST API at `/api/report`
- Static JSON-backed fixture data reshaped into a report response
- Loading, error, and empty states
- Unit and API tests with Vitest

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- Vitest

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
```

## API

The dashboard reads from a mock report endpoint:

```bash
GET /api/report?start=2026-03-10T00:00:00.000Z&end=2026-03-17T00:00:00.000Z
```

The response includes:

- `line`: facility and line metadata
- `range`: selected report range and generation timestamp
- `summary`: aggregated production metrics
- `statusTimeline`: running, downtime, and stopped intervals
- `performanceSeries`: time-based speed and performance data
- `downtimeEvents`: individual downtime records
- `downtimePareto`: downtime causes ranked by impact

## Project structure

- `app/`: routes, layout, loading states, and API handler
- `components/`: dashboard UI components
- `data/`: static report fixtures
- `lib/`: formatting, API helpers, and report shaping logic
- `tests/`: report generator and API tests

## Notes

- The API is intentionally mocked to keep the UI and data flow self-contained.
- Report state is driven by URL search params so filtered views remain shareable.
- Fixture data is structured around realistic manufacturing line behavior, including scheduled stops and unplanned downtime events.
