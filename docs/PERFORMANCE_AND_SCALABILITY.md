# Performance and Scalability Architecture

This document outlines the performance engineering, static edge delivery model, client-side constraints, and future backend scaling blueprints for **OpenForm Steps**.

---

## 1. Architectural Philosophy: Edge Delivery & Client-First Execution

OpenForm Steps is designed to minimize origin server load and runtime latency:

1. **Client-Side Core Execution**:
   - Form schema validation (via Zod), Abstract Syntax Tree (AST) condition evaluation, and multi-step state machine transitions execute directly in the browser JavaScript runtime.
   - Users do not make round-trip HTTP requests to an origin server simply to validate fields, toggle conditional questions, or move between steps.
2. **Static Edge CDN Delivery**:
   - The compiled frontend application (`apps/web`) consists solely of static assets (`.html`, `.js`, `.css`, SVG assets) that can be cached and distributed across Content Delivery Networks (CDNs) like Cloudflare, Fastly, AWS CloudFront, or Vercel Edge.
   - Caching immutable hashed chunks at edge PoPs reduces origin server bandwidth to near zero for repeat visitors.

---

## 2. Realistic Scalability Considerations & Bottlenecks

Rather than claiming unlimited capacity or providing speculative hosting cost figures, the following technical constraints and bottlenecks should be accounted for in production:

### A. Client-Side Browser Storage Quotas
- OpenForm Steps persists drafts and simulated test responses in browser `localStorage`.
- **Constraint**: Most modern desktop and mobile browsers enforce a quota of approximately **5 MB to 10 MB** of `localStorage` per origin.
- **Recommendation**: For production applications collecting thousands of real user submissions, integrate a stateless backend submission endpoint or cloud database rather than relying on browser local storage.

### B. DOM Tree Size and Rendering Performance
- Rendering more than 50 complex interactive fields simultaneously on low-powered mobile devices can increase layout calculation times and memory consumption.
- **Built-in Mitigation**: OpenForm Steps addresses this through its **multi-step architecture**. Splitting large forms into 3–5 focused steps keeps active DOM node counts low ($\le 15$ inputs per step) and preserves smooth interaction responsiveness (INP).

### C. Large Dataset Exports
- Serializing tens of thousands of records on the main JavaScript thread can block browser event loops.
- **Built-in Mitigation**: The core engine provides `chunkedCsvExport()`, which batches rows in increments of 200 and yields control to the browser micro/macrotask queues (`setTimeout(resolve, 0)`), preventing browser "Page Unresponsive" dialogs.

### D. CDN & Edge Limitations
- While static assets benefit from high edge cache hit ratios ($>95\%$), real-world performance depends on:
  - User geographic proximity to the nearest CDN edge node.
  - CDN plan traffic tiers and egress bandwidth allowances.
  - Cache purge policies on new version deployments (managed via `Cache-Control: public, max-age=0, must-revalidate` on `index.html` and `max-age=31536000, immutable` on content-hashed assets).

---

## 3. Verified Build Output Metrics

Measurements produced by the production build (`vite v8.3.6` with Rolldown):

```text
Asset Distribution:
dist/index.html                             1.58 kB │ gzip:  0.77 kB
dist/assets/index.css                      32.66 kB │ gzip:  7.00 kB
dist/assets/rolldown-runtime.js             0.59 kB │ gzip:  0.36 kB
dist/assets/PreviewModal.js                 4.49 kB │ gzip:  1.42 kB
dist/assets/ResponsesPage.js                6.10 kB │ gzip:  2.06 kB
dist/assets/ExamplesPage.js                 7.14 kB │ gzip:  2.36 kB
dist/assets/DocsPage.js                    13.32 kB │ gzip:  3.91 kB
dist/assets/TemplatesPage.js               18.62 kB │ gzip:  6.26 kB
dist/assets/BuilderPage.js                 53.82 kB │ gzip:  9.68 kB
dist/assets/vendor-icons.js                21.01 kB │ gzip:  7.85 kB
dist/assets/vendor-zod.js                  56.39 kB │ gzip: 12.94 kB
dist/assets/vendor-react.js               210.96 kB │ gzip: 65.89 kB

Build Duration: 657ms (client bundle)
Package Output: @openform-steps/core: 18.62 kB (gzip: 5.21 kB)
```

---

## 4. Performance Targets in Synthetic Testing

In local browser profiling and synthetic performance audits, OpenForm Steps targets:

- **Largest Contentful Paint (LCP)**: Target $\le 2.5\text{ s}$ on simulated 4G mobile profiles. Achieved via route-based lazy loading and pre-inlined critical CSS.
- **Interaction to Next Paint (INP)**: Target $\le 200\text{ ms}$. Achieved by eliminating synchronous blocking work during step transitions and input events.
- **Cumulative Layout Shift (CLS)**: Target $\le 0.1$. Achieved by giving explicit container dimensions to progress indicators and step headers.

*Note: These benchmarks reflect local synthetic tests and component-level audits; real-world field metrics (Core Web Vitals) should be monitored via Chrome User Experience Report (CrUX) or real-user monitoring (RUM) upon production deployment.*

---

## 5. Backend Integration Blueprint for High-Traffic Deployments

When transitioning from client-only operation to centralized data collection:

1. **Stateless Ingestion Endpoints**: Deploy lightweight edge functions (e.g. Cloudflare Workers, AWS Lambda@Edge) that validate submission schemas in memory using `@openform-steps/core` before acknowledging receipt.
2. **Buffering with Message Queues**: Insert submissions into an asynchronous queue (e.g. AWS SQS, Apache Kafka, or Redis Streams) to absorb traffic spikes without overwhelming database connection pools.
3. **Database Indexing**: Store submission records in PostgreSQL (with JSONB) or distributed document stores with indexed composite keys: `(form_id, submitted_at DESC)`.
4. **Abuse Mitigation**: Implement rate limiting (e.g., token bucket per IP/client token) and consider accessible bot checks (e.g., Cloudflare Turnstile or honeypot fields).
