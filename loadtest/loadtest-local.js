// =====================================================================
// QuickBite — Local k6 load test (runs locally without AWS or cloud deployment)
//
//   Local smoke test:   k6 run loadtest-local.js
//   Custom target test: k6 run -e CORE_URL=http://localhost:3000 -e ORDER_URL=http://localhost:4000 loadtest-local.js
//   Scale target test:  k6 run -e PROFILE=full loadtest-local.js
//
// Goal: local testing of core-service browse traffic plus order placement and
// customer order history queries against locally running microservices.
// =====================================================================

import http from "k6/http";
import crypto from "k6/crypto";
import encoding from "k6/encoding";
import { check } from "k6";
import { Counter } from "k6/metrics";

// ---------------------------------------------------------------------
// Config (override everything with -e KEY=VALUE)
// ---------------------------------------------------------------------
// Default to local service ports (Core: 3000, Order: 4000)
const CORE_URL  = __ENV.CORE_URL  || "http://localhost:3000";
const ORDER_URL = __ENV.ORDER_URL || "http://localhost:4000";
const ACCESS_SECRET = __ENV.ACCESS_SECRET || "SFGDFGDGTDYTYFGFGFDGFD";
const PROFILE   = __ENV.PROFILE   || "local"; // Defaults to "local" profile for gentle local test runs
const DURATION  = __ENV.DURATION  || (PROFILE === "local" ? "30s" : "2m");
const ORDER_PAYMENT_METHOD = __ENV.ORDER_PAYMENT_METHOD || "cod"; // cod keeps it self-contained (no Kashier)

// Dataset shape — MUST match what the seed scripts produced.
const DATA = {
  N_RESTAURANTS:     Number(__ENV.N_RESTAURANTS     || 1000),
  N_EG_RESTAURANTS:  Number(__ENV.N_EG_RESTAURANTS  || 700),
  PPR:               Number(__ENV.PPR               || 80),    // products per restaurant
  CUST_BASE:         Number(__ENV.CUST_BASE         || 6000),
  N_ORDER_CUSTOMERS: Number(__ENV.N_ORDER_CUSTOMERS || 50000), // customers that have an address
};

// Per-scenario target request rates (req/s) at RATE_SCALE = 1  -> sums to ~625.
// In "local" profile we shrink hard so the local smoke test is gentle on developer hardware.
const RATE_SCALE = Number(__ENV.RATE_SCALE || (PROFILE === "local" ? 0.012 : 1));
const RATES = {
  menu_items:         300,  // GET /branches/:id/products   <- the heaviest hot path
  restaurants_list:    90,  // GET /restaurants
  restaurant_detail:   40,  // GET /restaurants/:id
  restaurant_branches: 70,  // GET /restaurants/:id/branches
  nearby:              60,  // GET /branches/nearby
  categories:          30,  // GET /restaurants/:id/categories
  orders_eg:          1.6,  // POST /orders (region eg)
  orders_sa:          0.7,  // POST /orders (region ksa)
  customer_orders_eg:  22,  // GET /customer/orders (eg)
  customer_orders_sa:  10,  // GET /customer/orders (ksa)
};

const placedOrders = new Counter("orders_placed");

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
function randInt(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }

// EG restaurant id (1..N_EG) or SA restaurant id (N_EG+1..N).
function egRestaurant() { return randInt(1, DATA.N_EG_RESTAURANTS); }
function saRestaurant() { return randInt(DATA.N_EG_RESTAURANTS + 1, DATA.N_RESTAURANTS); }
function anyRestaurant() { return randInt(1, DATA.N_RESTAURANTS); }
function branchOf(r) { return (r - 1) * 3 + randInt(1, 3); }
function productOf(r) { return (r - 1) * DATA.PPR + randInt(1, DATA.PPR); }
function orderableCustomer() { return DATA.CUST_BASE + randInt(1, DATA.N_ORDER_CUSTOMERS); }

// Mint an HS256 JWT matching the services' access-token shape.
function b64url(obj) { return encoding.b64encode(JSON.stringify(obj), "rawurl"); }
function mintToken(userId) {
  const header = b64url({ alg: "HS256", typ: "JWT" });
  const nowS = Math.floor(Date.now() / 1000);
  const payload = b64url({
    userId: userId,
    role: "customer",
    email: "user" + userId + "@seed.test",
    iat: nowS,
    exp: nowS + 3600,
  });
  const data = header + "." + payload;
  const sig = crypto.hmac("sha256", ACCESS_SECRET, data, "base64rawurl");
  return data + "." + sig;
}

function idempotencyKey() { return `lt-${__VU}-${__ITER}-${Date.now()}-${Math.floor(Math.random() * 1e9)}`; }

// ---------------------------------------------------------------------
// Scenario functions (one exec per executor)
// ---------------------------------------------------------------------
function checkRes(res, name) {
  const ok = res.status >= 200 && res.status < 300;
  if (!ok) {
    console.log(`[HTTP FAIL] ${res.status} ${res.request.method} ${res.url} | tag="${name}" | body=${res.body}`);
  }
  return ok;
}

export function menuItems() {
  const r = anyRestaurant();
  const res = http.get(`${CORE_URL}/api/branches/${branchOf(r)}/products`, { tags: { name: "GET /branches/:id/products" } });
  check(res, { "menu 200": () => checkRes(res, "GET /branches/:id/products") });
}

export function restaurantsList() {
  const res = http.get(`${CORE_URL}/api/restaurants?limit=20`, { tags: { name: "GET /restaurants" } });
  check(res, { "restaurants 200": () => checkRes(res, "GET /restaurants") });
}

export function restaurantDetail() {
  const res = http.get(`${CORE_URL}/api/restaurants/${anyRestaurant()}`, { tags: { name: "GET /restaurants/:id" } });
  check(res, { "restaurant 200": () => checkRes(res, "GET /restaurants/:id") });
}

export function restaurantBranches() {
  const res = http.get(`${CORE_URL}/api/restaurants/${anyRestaurant()}/branches`, { tags: { name: "GET /restaurants/:id/branches" } });
  check(res, { "branches 200": () => checkRes(res, "GET /restaurants/:id/branches") });
}

export function nearby() {
  const lat = (30.0 + Math.random() * 0.4).toFixed(6);
  const lng = (31.0 + Math.random() * 0.4).toFixed(6);
  const res = http.get(`${CORE_URL}/api/branches/nearby?lat=${lat}&lng=${lng}`, { tags: { name: "GET /branches/nearby" } });
  check(res, { "nearby 200": () => checkRes(res, "GET /branches/nearby") });
}

export function categories() {
  const res = http.get(`${CORE_URL}/api/restaurants/${anyRestaurant()}/categories`, { tags: { name: "GET /restaurants/:id/categories" } });
  check(res, { "categories 200": () => checkRes(res, "GET /restaurants/:id/categories") });
}

function placeOrder(region, restaurant) {
  const branchId = branchOf(restaurant);
  const customerId = orderableCustomer();
  const nItems = randInt(1, 3);
  const items = [];
  for (let i = 0; i < nItems; i++) items.push({ productId: productOf(restaurant), quantity: randInt(1, 3) });
  const body = JSON.stringify({
    branchId: branchId,
    customerAddressId: customerId, // address.id == user.id in the seed
    paymentMethod: ORDER_PAYMENT_METHOD,
    items: items,
  });
  const res = http.post(`${ORDER_URL}/api/orders`, body, {
    headers: {
      "Content-Type": "application/json",
      "X-Region": region,
      "Idempotency-Key": idempotencyKey(),
      Cookie: "access_token=" + mintToken(customerId),
    },
    tags: { name: "POST /orders" },
  });
  const ok = check(res, { "order 2xx": () => checkRes(res, "POST /orders") });
  if (ok) placedOrders.add(1);
  return res;
}

export function ordersEg() { placeOrder("eg", egRestaurant()); }
export function ordersSa() { placeOrder("ksa", saRestaurant()); }

function customerOrders(region) {
  const customerId = orderableCustomer();
  const res = http.get(`${ORDER_URL}/api/customer/orders?limit=20`, {
    headers: { "X-Region": region, Cookie: "access_token=" + mintToken(customerId) },
    tags: { name: "GET /customer/orders" },
  });
  check(res, { "history 2xx": () => checkRes(res, "GET /customer/orders") });
}
export function customerOrdersEg() { customerOrders("eg"); }
export function customerOrdersSa() { customerOrders("ksa"); }

// ---------------------------------------------------------------------
// Options — build one constant-arrival-rate scenario per traffic class.
// ---------------------------------------------------------------------
function scenario(exec, ratePerSec) {
  const effRps = ratePerSec * RATE_SCALE;
  const rate = Math.max(1, Math.round(effRps * 100));
  const pre = Math.max(5, Math.ceil(effRps * 0.25));
  return {
    executor: "constant-arrival-rate",
    exec: exec,
    rate: rate,
    timeUnit: "100s",
    duration: DURATION,
    preAllocatedVUs: pre,
    maxVUs: pre * 2,
  };
}

export const options = {
  discardResponseBodies: false,
  scenarios: {
    menu_items:          scenario("menuItems",          RATES.menu_items),
    restaurants_list:    scenario("restaurantsList",     RATES.restaurants_list),
    restaurant_detail:   scenario("restaurantDetail",    RATES.restaurant_detail),
    restaurant_branches: scenario("restaurantBranches",  RATES.restaurant_branches),
    nearby:              scenario("nearby",              RATES.nearby),
    categories:          scenario("categories",          RATES.categories),
    orders_eg:           scenario("ordersEg",            RATES.orders_eg),
    orders_sa:           scenario("ordersSa",            RATES.orders_sa),
    customer_orders_eg:  scenario("customerOrdersEg",    RATES.customer_orders_eg),
    customer_orders_sa:  scenario("customerOrdersSa",    RATES.customer_orders_sa),
  },
  thresholds: {
    http_req_failed:   ["rate<0.01"],            // < 1% errors
    http_req_duration: ["p(95)<800", "p(99)<2000"],
    "http_req_duration{name:GET /branches/:id/products}": ["p(95)<800"],
    "http_req_duration{name:POST /orders}": ["p(95)<1500"],
  },
};

export function handleSummary(data) {
  return { stdout: textSummary(data) };
}

function textSummary(data) {
  const m = data.metrics;
  function p(metric, stat) { return m[metric] && m[metric].values ? Math.round(m[metric].values[stat]) : "-"; }
  const reqs = m.http_reqs ? m.http_reqs.values.count : 0;
  const rps = m.http_reqs ? Math.round(m.http_reqs.values.rate) : 0;
  const failed = m.http_req_failed ? (m.http_req_failed.values.rate * 100).toFixed(2) : "-";
  const placed = m.orders_placed ? m.orders_placed.values.count : 0;
  return [
    "",
    "QuickBite Local Load Test Summary",
    "  total requests : " + reqs + "  (" + rps + " req/s)",
    "  failed         : " + failed + " %",
    "  orders placed  : " + placed,
    "  req duration   : avg=" + p("http_req_duration", "avg") +
    "ms p95=" + p("http_req_duration", "p(95)") +
    "ms p99=" + p("http_req_duration", "p(99)") + "ms",
    "",
  ].join("\n");
}
