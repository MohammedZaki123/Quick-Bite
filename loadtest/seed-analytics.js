// =====================================================================
// QuickBite — analytics-service seed (MongoDB, db "analytics")
//
// Analytics stores DAY-GRAINED aggregates (no raw events). We populate the
// four agg_*_day collections directly, matching the IDs used by seed-core /
// seed-order so the analytics read endpoints return data for the same
// restaurants / branches / products the rest of the system knows about.
//
// Run:
//   mongosh "mongodb://localhost:27017/analytics" seed-analytics.js
//   # custom host/db:
//   mongosh "mongodb://localhost:27017/analytics" --eval "var DAYS=30" seed-analytics.js
//
// Collections:
//   agg_restaurant_day (restaurant_id, date)         ~ N_RESTAURANTS * DAYS
//   agg_branch_day     (branch_id, date)             ~ N_RESTAURANTS*3 * DAYS
//   agg_product_day    (restaurant_id,product_id,date) ~ N_RESTAURANTS*PPR_SAMPLED*DAYS
//   agg_platform_day   (date, country_code)          ~ DAYS * 2
// =====================================================================

// ---- config (override any with: mongosh --eval "var DAYS=30" ...) -----
const CFG = {
  N_RESTAURANTS:  typeof N_RESTAURANTS  !== "undefined" ? N_RESTAURANTS  : 1000,
  N_EG:           typeof N_EG           !== "undefined" ? N_EG           : 700,
  BRANCHES_PER:   3,
  PPR:            typeof PPR            !== "undefined" ? PPR            : 80,   // products/restaurant in core
  PPR_SAMPLED:    typeof PPR_SAMPLED    !== "undefined" ? PPR_SAMPLED    : 20,   // products/restaurant tracked here
  DAYS:           typeof DAYS           !== "undefined" ? DAYS           : 90,
  BATCH:          5000,
};

print(">> seeding analytics: restaurants=" + CFG.N_RESTAURANTS +
      " days=" + CFG.DAYS + " sampledProducts/rest=" + CFG.PPR_SAMPLED);

// ---- helpers ----------------------------------------------------------
function pad(n) { return n < 10 ? "0" + n : "" + n; }
function isoDay(d) { return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }

// last DAYS calendar days ending today (UTC), as "YYYY-MM-DD" strings.
const days = [];
{
  const base = new Date();
  base.setUTCHours(0, 0, 0, 0);
  for (let i = CFG.DAYS - 1; i >= 0; i--) {
    const d = new Date(base.getTime() - i * 86400000);
    days.push(isoDay(d));
  }
}

function regionOf(r)   { return r <= CFG.N_EG ? "eg"  : "ksa"; }
function currencyOf(r) { return r <= CFG.N_EG ? "EGP" : "SAR"; }
// small deterministic pseudo-random in [0,1) from integer key
function rnd(key) { const x = Math.sin(key) * 10000; return x - Math.floor(x); }

function flush(coll, buf) {
  if (buf.length) { db.getCollection(coll).insertMany(buf, { ordered: false }); buf.length = 0; }
}

const now = new Date();

// Make a fresh start (idempotent re-seed).
["agg_restaurant_day", "agg_branch_day", "agg_product_day", "agg_platform_day"].forEach(function (c) {
  db.getCollection(c).deleteMany({});
});

// ---------------------------------------------------------------------
// 1. agg_restaurant_day + agg_branch_day  (share the same metric shape)
// ---------------------------------------------------------------------
let rBuf = [], bBuf = [];
let rCount = 0, bCount = 0;
for (let r = 1; r <= CFG.N_RESTAURANTS; r++) {
  const cur = currencyOf(r);
  for (let di = 0; di < days.length; di++) {
    const date = days[di];

    // restaurant-level
    {
      const orders     = 40 + Math.floor(rnd(r * 31 + di) * 160);   // 40..200
      const avg        = 4000 + Math.floor(rnd(r * 17 + di) * 6000); // 40.00..100.00
      const rejected   = Math.floor(orders * 0.03);
      const cancelled  = Math.floor(orders * 0.02);
      const delivered  = orders - rejected - cancelled;
      const dMsAvg     = 1800000 + Math.floor(rnd(r + di) * 1800000); // 30..60 min
      const payments   = Math.floor(delivered * 0.6);
      rBuf.push({
        restaurant_id: r, date: date, currency: cur,
        orders_count: orders, revenue_sum: orders * avg,
        rejected_count: rejected, cancelled_count: cancelled, delivered_count: delivered,
        delivery_ms_sum: delivered * dMsAvg, delivery_ms_count: delivered,
        payments_count: payments, payments_sum: payments * avg,
        updated_at: now,
      });
      rCount++;
      if (rBuf.length >= CFG.BATCH) flush("agg_restaurant_day", rBuf);
    }

    // branch-level (split restaurant volume across its 3 branches)
    for (let k = 1; k <= CFG.BRANCHES_PER; k++) {
      const branchId  = (r - 1) * CFG.BRANCHES_PER + k;
      const orders    = 12 + Math.floor(rnd(branchId * 13 + di) * 60); // 12..72
      const avg       = 4000 + Math.floor(rnd(branchId * 7 + di) * 6000);
      const rejected  = Math.floor(orders * 0.03);
      const cancelled = Math.floor(orders * 0.02);
      const delivered = orders - rejected - cancelled;
      const dMsAvg    = 1800000 + Math.floor(rnd(branchId + di) * 1800000);
      const payments  = Math.floor(delivered * 0.6);
      bBuf.push({
        branch_id: branchId, date: date, currency: cur,
        orders_count: orders, revenue_sum: orders * avg,
        rejected_count: rejected, cancelled_count: cancelled, delivered_count: delivered,
        delivery_ms_sum: delivered * dMsAvg, delivery_ms_count: delivered,
        payments_count: payments, payments_sum: payments * avg,
        updated_at: now,
      });
      bCount++;
      if (bBuf.length >= CFG.BATCH) flush("agg_branch_day", bBuf);
    }
  }
}
flush("agg_restaurant_day", rBuf);
flush("agg_branch_day", bBuf);
print("   agg_restaurant_day: " + rCount + "   agg_branch_day: " + bCount);

// ---------------------------------------------------------------------
// 2. agg_product_day  (first PPR_SAMPLED products of each restaurant)
// ---------------------------------------------------------------------
let pBuf = [], pCount = 0;
for (let r = 1; r <= CFG.N_RESTAURANTS; r++) {
  const cur = currencyOf(r);
  for (let s = 1; s <= CFG.PPR_SAMPLED; s++) {
    const productId = (r - 1) * CFG.PPR + s;  // matches seed-core product id formula
    for (let di = 0; di < days.length; di++) {
      const units  = 5 + Math.floor(rnd(productId * 3 + di) * 60);
      const price  = 1500 + (s % 40) * 100;
      pBuf.push({
        restaurant_id: r, product_id: productId, date: days[di], currency: cur,
        units_sum: units, revenue_sum: units * price,
        orders_count: Math.max(1, Math.floor(units / 2)),
        updated_at: now,
      });
      pCount++;
      if (pBuf.length >= CFG.BATCH) flush("agg_product_day", pBuf);
    }
  }
}
flush("agg_product_day", pBuf);
print("   agg_product_day: " + pCount);

// ---------------------------------------------------------------------
// 3. agg_platform_day  (per date x country_code)
// ---------------------------------------------------------------------
let plBuf = [];
const countries = [
  { code: "eg",  currency: "EGP", restaurants: CFG.N_EG },
  { code: "ksa", currency: "SAR", restaurants: CFG.N_RESTAURANTS - CFG.N_EG },
];
for (let di = 0; di < days.length; di++) {
  for (const c of countries) {
    const orders    = c.restaurants * (40 + Math.floor(rnd(di + c.code.length) * 120));
    const avg       = 5000;
    const rejected  = Math.floor(orders * 0.03);
    const cancelled = Math.floor(orders * 0.02);
    const delivered = orders - rejected - cancelled;
    const dMsAvg    = 2100000;
    plBuf.push({
      date: days[di], country_code: c.code, currency: c.currency,
      orders_count: orders, revenue_sum: orders * avg,
      rejected_count: rejected, cancelled_count: cancelled, delivered_count: delivered,
      delivery_ms_sum: delivered * dMsAvg, delivery_ms_count: delivered,
      updated_at: now,
    });
  }
}
flush("agg_platform_day", plBuf);
print("   agg_platform_day: " + (days.length * 2));

// ---- unique indexes (match the service's EnsureIndexes) ---------------
db.agg_restaurant_day.createIndex({ restaurant_id: 1, date: 1 }, { unique: true });
db.agg_restaurant_day.createIndex({ date: 1, restaurant_id: 1 });
db.agg_branch_day.createIndex({ branch_id: 1, date: 1 }, { unique: true });
db.agg_branch_day.createIndex({ date: 1, branch_id: 1 });
db.agg_product_day.createIndex({ restaurant_id: 1, product_id: 1, date: 1 }, { unique: true });
db.agg_product_day.createIndex({ restaurant_id: 1, date: 1 });
db.agg_platform_day.createIndex({ date: 1, country_code: 1 }, { unique: true });
db.agg_platform_day.createIndex({ country_code: 1, date: 1 });

print(">> done analytics");
printjson({
  agg_restaurant_day: db.agg_restaurant_day.countDocuments(),
  agg_branch_day:     db.agg_branch_day.countDocuments(),
  agg_product_day:    db.agg_product_day.countDocuments(),
  agg_platform_day:   db.agg_platform_day.countDocuments(),
});
