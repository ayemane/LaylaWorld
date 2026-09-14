// Vercel Web Analytics — page views only.
//
// Loaded from every index.html rather than from the game entry points, because
// 5 of the 11 pages (the site root and the four `layla/` landing pages) have no
// module script of their own. Wiring this into src/main.ts and friends would
// have silently missed them, including the most-visited page on the site.
//
// `inject()` has no client-side route tracking, which costs nothing here: this
// is a multi-page Vite build, so every screen is a real page load.
//
// Deliberately cookieless. LaylaWorld is a child-directed site, so Google
// Analytics would pull COPPA obligations and a consent banner in with it.
import { inject } from '@vercel/analytics';

inject();
