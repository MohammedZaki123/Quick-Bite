# QuickBite — seed data + load test

Three seed scripts (one per datastore) plus a k6 load test that drives the
hot path at the target rate of **~54M requests/day ≈ 625 req/s** with
**~200k orders/day** split across EG and SA.

```
loadtest/
  seed-core.sql        # core-service  Postgres (quickbite_core)        — users, restaurants, branches, menus
  seed-order.sql       # order-service Postgres (order_service_eg/ksa)  — orders, items, payments, balances, earnings
  seed-analytics.js    # analytics-service MongoDB (analytics)          — agg_*_day rollups
  loadtest.js          # k6 load test (local or Grafana Cloud k6)
  seed.ps1 / seed.sh   # convenience runners (small "local" or "full" scale)
```

## What gets seeded (full scale)

| Store    | Rows |
|----------|------|
| core users | 1,000,000 (1k restaurant owners, 5k delivery agents, ~994k customers; 50k of them have an address and can place orders) |
| core restaurants / branches | 1,000 / 3,000 (700 EG + 300 SA, 3 branches each) |
| core products / per-branch details | 80,000 / 240,000 (price + big stock so the load test never depletes) |
| order_service_eg | ~1,000,000 orders (+items, transactions, sessions, earnings, balances) |
| order_service_ksa | ~400,000 orders (+ the same children) |
| analytics agg_*_day | ~90k restaurant-days, ~270k branch-days, ~1.8M product-days, ~180 platform-days |

### Deterministic ID contract (the three scripts agree on this)

So the live load test can build valid references with pure arithmetic — no lookups:

- `restaurant r` → id `r`, owner is user id `r`
- branches of `r` → ids `(r-1)*3 + {1,2,3}`
- products of `r` → ids `(r-1)*80 + {1..80}`
- EG restaurants `1..700` (`country_code='eg'`, `EGP`); SA restaurants `701..1000` (`'ksa'`, `SAR`)
- orderable customers → user ids `6001..56000`, and **their address id == their user id**
- delivery agents → user ids `1001..6000`

> The order-service derives its shard region from the branch `country_code`,
> which is why core seeds `'eg'`/`'ksa'` (not `'EG'`/`'SA'`). `normalizeRegion`
> lowercases and checks membership in `[eg, ksa]`.

## Prerequisites

- The three datastores running and reachable (your local Docker stacks or the
  deployed clusters). Default local ports: Postgres `5432`, Mongo `27017`.
- `psql` (Postgres client), `mongosh` (Mongo shell), and `k6` on the machine
  you run from.
- core-service Postgres needs the **PostGIS** extension (the migrations create
  it; the seed only `CREATE EXTENSION IF NOT EXISTS postgis`).
- Run the migrations first (`order-service`: `npm run migrate:all`;
  `core-service`: `npm run migrate`). Order partitions are created **by the
  seed itself** (it builds a rolling 14-month window), so you do *not* need
  `partitions:create` before seeding history.

## Seeding

### Option A — runner (recommended)

```powershell
# full scale (the real seed)
./seed.ps1 -Profile full
# tiny smoke test first
./seed.ps1 -Profile local
```

```bash
./seed.sh full      # or: ./seed.sh local
```

Set connection details via env vars if not localhost/postgres/postgres:
`PGHOST PGPORT PGUSER PGPASSWORD`, `MONGO_URI`.

### Option B — by hand

```bash
# 1. core
psql "host=localhost port=5432 user=postgres password=postgres dbname=quickbite_core" \
     -v ON_ERROR_STOP=1 -f seed-core.sql

# 2. order — run ONCE PER SHARD with region-specific vars
psql "host=localhost port=5432 user=postgres password=postgres dbname=order_service_eg" \
     -v ON_ERROR_STOP=1 -v region=eg  -v currency=EGP -v rest_start=1   -v rest_end=700  -v n_orders=1000000 -v p_online=50 -f seed-order.sql
psql "host=localhost port=5432 user=postgres password=postgres dbname=order_service_ksa" \
     -v ON_ERROR_STOP=1 -v region=ksa -v currency=SAR -v rest_start=701 -v rest_end=1000 -v n_orders=400000  -v p_online=0  -f seed-order.sql

# 3. analytics
mongosh "mongodb://localhost:27017/analytics" seed-analytics.js
```

Every script accepts overrides to shrink for a quick smoke test — e.g. add
`-v n_users=2000 -v n_restaurants=10 -v ppr=8` to `seed-core.sql`, or
`--eval "var DAYS=14; var N_RESTAURANTS=20"` before `seed-analytics.js`.

> The order seed uses `INT` minor units and matches the partitioned `orders`
> table; it inserts explicit ids then fixes the sequences, so re-running on a
> non-empty DB will collide — seed into a freshly-migrated (empty) shard, or
> `TRUNCATE` first.

## Load test

### Easiest cloud platform: Grafana Cloud k6

k6 is one self-contained JS file and Grafana Cloud k6 runs it on distributed
load generators with a dashboard — no infra to stand up. Pay-as-you-go, fine
for a one-off run.

```bash
# one-time
k6 cloud login --token <YOUR_GRAFANA_CLOUD_K6_TOKEN>

# point at your PUBLIC deployment (load generators are remote!)
k6 cloud run \
  -e CORE_URL=https://core.your-domain.com \
  -e ORDER_URL=https://order.your-domain.com \
  -e ACCESS_SECRET=<your order-service ACCESS_SECRET> \
  -e DURATION=15m \
  loadtest.js
```

### Run it locally first (free, sanity check)

```bash
# tiny: ~7-8 req/s for 30s, against local services
k6 run -e PROFILE=local loadtest.js

# full 625 req/s against local services (needs a beefy box + the seed loaded)
k6 run -e CORE_URL=http://localhost:3000 -e ORDER_URL=http://localhost:4000 loadtest.js
```

### Traffic mix (sums to ~625 req/s at `RATE_SCALE=1`)

| Scenario | Endpoint | req/s | Service |
|----------|----------|------:|---------|
| menu_items | `GET /api/branches/:id/products` | 300 | core (hottest) |
| restaurants_list | `GET /api/restaurants` | 90 | core |
| restaurant_detail | `GET /api/restaurants/:id` | 40 | core |
| restaurant_branches | `GET /api/restaurants/:id/branches` | 70 | core |
| nearby | `GET /api/branches/nearby` | 60 | core |
| categories | `GET /api/restaurants/:id/categories` | 30 | core |
| orders_eg | `POST /api/orders` (X-Region: eg) | 1.6 | order EG (~140k/day) |
| orders_sa | `POST /api/orders` (X-Region: ksa) | 0.7 | order SA (~60k/day) |
| customer_orders_eg | `GET /api/customer/orders` | 22 | order EG |
| customer_orders_sa | `GET /api/customer/orders` | 10 | order SA |

`orders_eg + orders_sa ≈ 2.3/s ≈ 200k orders/day`. Knobs (all `-e`):
`RATE_SCALE` (scale every rate), `DURATION`, `ORDER_PAYMENT_METHOD`,
`CORE_URL`, `ORDER_URL`, `ACCESS_SECRET`, and the `DATA.*` dataset sizes.

### Notes / decisions

- **Order creation uses COD** (`ORDER_PAYMENT_METHOD=cod`) so the write path is
  self-contained — it still fans out to core (branch lookup, address ownership
  check, product lookup, **stock reservation**) and writes the order, but does
  **not** call the external Kashier test API. Set `-e ORDER_PAYMENT_METHOD=online`
  (EG only) to also exercise Kashier — expect external latency/limits then.
- The browse endpoints are **public** (no auth) — that's the real hot path.
  `POST /orders` and `GET /customer/orders` need a JWT; the test **mints an
  HS256 access-token cookie** in-script (same shape the services issue), so no
  login round-trips. The mint secret must equal order-service `ACCESS_SECRET`.
- Open-model load: rates are fixed by `constant-arrival-rate`, so if the system
  slows down, in-flight requests pile up (you'll see it as rising p95/p99 and
  `dropped_iterations`) instead of the offered load dropping — exactly what you
  want when asking "can it absorb 625/s".
- Thresholds (`http_req_failed < 1%`, `p95 < 800ms`, order `p95 < 1500ms`) are
  starting points — tune to your SLOs.
