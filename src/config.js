// ── MotoTrackIQ Portal Config ───────────────────────────────────────────────
// Single source of truth for the backend API base URL.
//
// Resolution order:
//   1. window.MTIQ_API_BASE  (set via injected env / build step)
//   2. <meta name="mtiq-api-base" content="...">  (set in HTML head)
//   3. Same-origin (''), which works when the portal is served by the backend
//      itself, or when a reverse proxy maps /api to the backend.
//   4. Production fallback: the Railway backend URL.
//
// To point at a different backend, set ONE of the above. Do NOT hardcode
// machine-specific IPs in the page scripts anymore.

(function () {
  var meta = document.querySelector('meta[name="mtiq-api-base"]');
  var fromMeta = meta && meta.getAttribute('content');

  var base =
    (typeof window !== 'undefined' && window.MTIQ_API_BASE) ||
    (fromMeta && fromMeta.trim()) ||
    'https://mototrack-iq-backend-production.up.railway.app';

  // Normalize: strip trailing slash so callers can do API + '/api/...'
  base = String(base).replace(/\/+$/, '');

  window.MTIQ_API_BASE = base;            // root base (auth, sessions, analyze, etc.)
  window.MTIQ_API_DEVICE = base + '/api/device'; // device-report base (eod, dashboard)

  // ── Compatibility facade ────────────────────────────────────────────────
  // Production still runs the June 2026 backend build, which has three bugs
  // that break this portal:
  //   1. Its PDF renderer reads lap fields (lapTime/topSpeed/maxBraking) that
  //      its own analyzer never emits (time/maxSpeed/maxG) → every lap row
  //      renders "—" / 0 km/h / 0.0G.
  //   2. Its analyzer produces no `visualizations.trackMap`, so the GPS
  //      speed-heat racing line and labelled chart axes don't exist.
  //   3. Its `summary.sessionDate` is a numeric epoch; the portal calls
  //      .slice(0,10) on it → TypeError → the sessions table wipes itself.
  //
  // The facade re-analyzes stored CSVs with the CURRENT analyzer and renders
  // PDFs with the CURRENT report generator, then proxies everything else to
  // production. It is an accelerator, NOT a hard dependency: every facade call
  // transparently falls back to production if the facade is unreachable.
  //
  // Once the current backend build is deployed to Railway, set
  // window.MTIQ_API_FACADE to '' to route everything straight to production.
  window.MTIQ_API_FACADE = '';  // retired — prod now runs the current build directly

  // Endpoints served by the facade when it is available.
  // 'sessions'      → GET /api/sessions            (re-analyzed + date-normalized)
  // 'session'       → GET /api/sessions/:id        (re-analyzed)
  // 'report'        → POST /api/report             (current PDF generator)
  // 'sessionReport' → POST /api/sessions/:id/report (current PDF generator)
  window.MTIQ_FACADE_PATHS = {
    'sessions':      /^\/api\/sessions$/,
    'session':       /^\/api\/sessions\/[^/]+$/,
    'report':        /^\/api\/report$/,
    'sessionReport': /^\/api\/sessions\/[^/]+\/report$/,
    'analyze':       /^\/api\/analyze$/
  };
})();
