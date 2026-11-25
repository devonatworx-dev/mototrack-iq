// ── MotoTrackIQ Portal Config ───────────────────────────────────────────────
// Single source of truth for the backend API base URL.
//
// Resolution order:
//   1. window.MTIQ_API_BASE, when it is already a string before this file runs.
//      An empty string means same-origin /api (only for a portal served by the API).
//   2. <meta name="mtiq-api-base" content="..."> when the content is non-empty.
//   3. The production Railway API.
//
// mototrackiq.com, www.mototrackiq.com, and *.vercel.app preview deployments
// are static files with no /api of their own. Step 3 is what they use, so a
// preview calls production instead of its own host. Point a preview at another
// API with the meta tag or window.MTIQ_API_BASE. Do NOT hardcode machine IPs.

(function () {
  var meta = document.querySelector('meta[name="mtiq-api-base"]');
  var fromMeta = meta && meta.getAttribute('content');
  var injected = (typeof window !== 'undefined' && typeof window.MTIQ_API_BASE === 'string')
    ? window.MTIQ_API_BASE
    : null;

  var base;
  if (injected !== null) {
    base = injected.trim();
  } else if (fromMeta && String(fromMeta).trim()) {
    base = String(fromMeta).trim();
  } else {
    // Static hosts (production site and Vercel previews) share this default.
    base = 'https://mototrack-iq-backend-production.up.railway.app';
  }

  // Normalize: strip trailing slash so callers can do API + '/api/...'
  base = String(base).replace(/\/+$/, '');

  window.MTIQ_API_BASE = base;            // root base (auth, sessions, analyze, etc.)

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
