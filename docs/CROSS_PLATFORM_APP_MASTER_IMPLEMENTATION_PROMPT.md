# HelloKhata Monorepo Cross-Platform App Master Implementation Prompt

**Document type:** Monorepo architecture decision, product scope, migration plan, and execution prompt  
**Prepared:** 2026-07-29  
**Revision:** Nx monorepo and Ports-and-Adapters architecture  
**Target platforms:** Android, iOS, responsive web/PWA, phones, and tablets  
**Recommended workspace:** npm workspaces managed by Nx  
**Recommended architecture:** Ports and Adapters with independently deployable applications  
**Recommended mobile runtime:** Capacitor with a dedicated Vite/React mobile application  
**Alternative:** React Native with Expo when native-first requirements justify a UI rewrite

## 1. How to Use This Document

Give this entire document to the coding agent responsible for the cross-platform implementation. The agent must execute the discovery and gate phases before changing production code. It must treat the repositories and running contracts as source evidence, not assume that a frontend screen proves that its backend capability is complete.

This is an implementation brief, not approval to publish, deploy, migrate production data, rotate credentials, or release an app-store build.

## 2. Architecture Verdict

### Decision

Create a **single canonical HelloKhata monorepo** using **npm workspaces plus Nx**. Import the existing ERP frontend, ERP backend, and AI engine with their Git histories preserved. Add a separate Vite + React + Capacitor mobile application. Keep the web, mobile, ERP API, and AI engine independently buildable, testable, deployable, and scalable.

Organize business code using **Ports and Adapters (Hexagonal Architecture)**:

- domain and application packages contain framework-neutral policy and use cases;
- inbound adapters expose HTTP, jobs, web UI, mobile UI, and command handlers;
- outbound ports define persistence, AI, speech, cache, queue, notification, file, clock, identity, and telemetry needs;
- concrete adapters implement Prisma/PostgreSQL, Redis/BullMQ, Gemini, Google Speech, Firebase, Twilio, mail, filesystem/object storage, and Capacitor capabilities;
- composition roots in each application wire ports to adapters.

Monorepo does **not** mean monolith. The ERP API owns business execution and the database. The AI engine remains a separately deployed service and has no direct access to ERP persistence. Applications may share versioned contracts and framework-neutral packages, but they must not import another application's internal source.

Do **not** package the existing Next.js `output: 'standalone'` server inside Capacitor. Capacitor copies an already-built browser bundle from `webDir` into native Android and iOS projects. The current Next.js standalone output includes a Node server and is intended for server or container deployment. A Next.js static export could produce packageable assets, but it would remove server-runtime capabilities and impose restrictions that should not be forced onto the existing web app.

Do **not** use a production Capacitor `server.url` that merely opens the hosted ERP website. It can support temporary internal prototyping, but it does not meet the required offline, security, app-store, performance, and native-integration goals.

### Why Nx and npm Workspaces Are the Default

Nx is preferred over Turborepo for this system because both provide dependency-aware task execution, affected builds, and caching, while Nx also provides a project graph, generators, project tags, and enforceable module-boundary rules. Those controls are directly useful for preventing domain, application, adapter, UI, and runtime layers from collapsing into circular imports.

Retain npm as the package manager during migration because all three current product repositories use `package-lock.json`. Use one root lockfile, pin the npm/Node versions, and do not mix npm, pnpm, Yarn, or Bun lockfiles. A package-manager migration requires a later measured ADR, not a simultaneous monorepo migration.

### Why Capacitor Is the Default Mobile Runtime

| Criterion | Capacitor + React/Vite | React Native + Expo |
|---|---:|---:|
| Reuse of current React, Tailwind, Radix/shadcn, forms, tables, and chart work | High | Low to medium |
| Reuse of framework-neutral API, Zod, Zustand, TanStack Query, and domain code | High | High |
| Required UI rewrite | Moderate | High |
| Native rendering and complex gesture performance | Medium | High |
| Native SDK access | High through plugins/custom native code | High |
| Delivery risk for the existing team and product | Lower | Higher |
| Best fit for a data-dense ERP | Yes | Yes, with larger cost |

Choose React Native/Expo instead only if a discovery spike proves that one or more of these are dominant requirements:

- sustained high-performance native animation or complex gesture-heavy workflows;
- deep Bluetooth, USB, NFC, or specialized POS hardware integration that is unreliable through available Capacitor plugins;
- extensive background execution that cannot be delivered within WebView and mobile OS constraints;
- a strategic decision to fund and maintain a native component system separate from the web UI.

### Current Documentation Basis

- Nx can be added to npm workspaces without replacing npm package management, infers projects/tasks from package metadata and tool configuration, supplies a project graph and caching, and supports Git-based affected task execution.
- Nx supports Next.js and Vite task inference; project tags plus `@nx/enforce-module-boundaries` can enforce architectural dependency rules.
- Turborepo is a viable lower-governance alternative, but this project needs stronger architectural boundary enforcement more than a minimal task runner.
- NestJS supports multiple applications and shared libraries in a workspace, but shared Nest modules must not become a route for cross-service runtime coupling.
- Capacitor requires a compiled web bundle, configured through `webDir`, followed by `npx cap sync` to copy it and update native dependencies.
- Capacitor creates native `android` and `ios` projects that are part of the application and should be version controlled.
- Next.js `output: 'standalone'` creates `.next/standalone` and a minimal Node server; `output: 'export'` creates static HTML/CSS/JS in `out` without a Node runtime.
- Current React Native guidance recommends using a framework such as Expo for new production applications.

Official references:

- https://nx.dev/docs/guides/tips-n-tricks/npm-workspaces
- https://nx.dev/docs/features/maintain-typescript-monorepos
- https://nx.dev/docs/features/ci-features/affected
- https://nx.dev/docs/features/enforce-module-boundaries
- https://docs.nestjs.com/cli/monorepo
- https://capacitorjs.com/docs/basics/workflow
- https://nextjs.org/docs/app/guides/static-exports
- https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- https://reactnative.dev/docs/getting-started

---

# MASTER CODING-AGENT PROMPT

## Role

Act as the principal monorepo architect, domain architect, mobile architect, senior React engineer, NestJS integration engineer, AI platform engineer, security engineer, test engineer, and release coordinator for HelloKhata. Build a production-grade cross-platform ERP platform without weakening tenant isolation, financial correctness, auditability, independent service deployment, or AI execution safety.

Work evidence-first. Inspect code and generated/runtime API contracts before implementation. Preserve unrelated work. Never claim a feature is complete based only on a route, mock, screen, generated report, or passing type check.

## Mission

Consolidate HelloKhata into a canonical Nx-managed npm-workspaces monorepo, then build the Android/iOS mobile application while preserving the existing Next.js web application and the independently deployed ERP API and AI engine. Deliver a maintainable ports-and-adapters architecture that supports the full ERP feature set, Bangla and English, mobile/tablet layouts, secure authentication, offline-capable workflows, device integrations, notifications, and proposal-only AI assistance.

The final system must remain usable as:

1. An independently deployable Next.js responsive web application.
2. An independently deployable NestJS ERP API and worker runtime.
3. An independently deployable NestJS AI engine with provider adapters.
4. A native Android application distributed as signed AAB/APK builds.
5. A native iOS application distributed through signed archive/TestFlight/App Store builds.
6. A resilient phone and tablet client with explicit online, degraded, offline, queued, syncing, failed, and conflict states.

## Existing Repositories, Migration Source, and Baseline

The outer repository is currently an integration/release harness containing three nested Git repositories. It becomes the canonical monorepo only after an approved, history-preserving migration and cutover. Until that gate, the nested repositories remain the product sources of truth. Refresh remotes and record exact refs before changing anything.

| System | Local root | Inspected branch | Inspected commit | Primary remote |
|---|---|---|---|---|
| Integration harness / target monorepo | `C:\FTS\HK-BizBangla-AIOS\Hellokhata` | `dev-latest` | `272b6b991be7b6c83d94d8c4b42dfc6d3b7ce4da` | `AIOS-AIaaS/AIOS-AIaaS-HK` |
| Frontend | `C:\FTS\HK-BizBangla-AIOS\Hellokhata\Hellokhata-FE` | `hk-ferp-fts-cycles` | `607cf4e114029d4ad8001a801a5bfdebd4907822` | `AIOS-AIaaS/Biz-Bangla-ferp` |
| ERP backend | `C:\FTS\HK-BizBangla-AIOS\Hellokhata\Hello-Khata-ERP-BE` | `dev` | `6490c69746b19c158b6a1c8803211932a031e7c2` | `AIOS-AIaaS/Biz-Bangla` |
| AI engine | `C:\FTS\HK-BizBangla-AIOS\Hellokhata\hello-khata-AI-engin` | `dev` | `009ae55571f3a640abdda3d10f44e4e11fc87235` | `AIOS-AIaaS/Biz-Bangla-AI-Engine` |

The commits above are an inspection snapshot, not a claim that they are still the latest remote commits. Fetch before implementation. Do not remove nested `.git` directories, copy repositories destructively, rewrite shared history, switch branches, rebase, merge, commit, push, create pull requests, migrate databases, or deploy without corresponding explicit approval.

The migration must preserve each source repository's commits, authors, tags, licenses, and release references. Evaluate `git subtree`, `git filter-repo` plus unrelated-history merge, or another reproducible import strategy in a disposable migration branch/repository. Select one through an ADR after testing commit traceability, blame, tags, rollback, and CI behavior. Maintain a source-to-monorepo commit mapping and a freeze/cutover plan for split repositories.

## Source-of-Truth Rules

1. The ERP backend owns business mutations, authorization, tenant and branch scope, financial transactions, durable idempotency, audit records, period locks, and conflict decisions.
2. The AI engine owns speech-to-text provider orchestration, structured intent extraction, action metadata, and proposal generation. It must not write ERP records directly.
3. The frontend and mobile app own presentation, local drafts, capture, optimistic read state, and an encrypted durable mutation queue. Client checks are UX safeguards, not authorization.
4. OpenAPI/controller behavior and contract tests outrank README claims. Prisma migrations and the live database schema outrank screenshots or generated prose.
5. All monetary calculations use backend-defined decimal/minor-unit semantics. Never introduce JavaScript floating-point arithmetic as the source of financial truth.
6. Never ship Gemini, Google Cloud, database, JWT, Redis, Firebase Admin, Twilio, mail, or other server credentials in a web or native bundle.
7. Shared packages are not a back door around service APIs. Web/mobile call the ERP API; ERP calls the AI engine through a typed outbound port and network adapter.
8. Applications may depend on published/workspace contracts, domain primitives, observability interfaces, and test utilities allowed by the dependency policy. They may not import another application's `src` tree.
9. Every cross-application contract change must be versioned, tested against producer and consumer, and represented in the coordinated release manifest.
10. During migration, a change has one owner and one canonical location. Do not dual-edit split and monorepo copies without an explicit synchronization plan.

## Current Technology Baseline

Preserve compatible parts of the current stack unless a written ADR demonstrates a concrete requirement that they cannot satisfy.

### Existing Web Frontend

- Next.js 16.1.x, React 19, TypeScript 5.9, Tailwind CSS 4.
- Radix UI and shadcn-style components, Lucide icons, Framer Motion, Recharts.
- TanStack Query and TanStack Table.
- Zustand persistence, React Hook Form, Zod 4, Axios.
- next-intl/i18next, Bangla and English localization.
- NextAuth and backend cookie/session integration.
- Existing offline queue, voice UI, AI guards, feature gates, and ERP screens must be audited for actual completeness before reuse.

### Existing ERP Backend

- NestJS 11 with Express, Prisma 7 and PostgreSQL.
- Passport/JWT, cookies, CSRF protection, throttling, Helmet, compression.
- Redis/cache, BullMQ and scheduled jobs.
- Swagger/OpenAPI, Pino, Sentry, Firebase Admin, Twilio and mail integrations.

### Existing AI Engine

- NestJS 11 with Fastify.
- Google GenAI/Gemini, Google Cloud Speech, multipart upload, Zod validation.
- AI gateway, speech-to-text, provider registry, intent extraction, action registry, internal intent API, and health endpoints.

### Monorepo Tooling

Use versions current and mutually compatible at migration time, pin them in the root lockfile, and record the selected versions in an ADR.

- One private root `package.json` with a pinned `packageManager`, `engines`, and npm workspaces covering `apps/*`, `packages/*`, and approved nested package patterns.
- One root `package-lock.json`; no application-level lockfiles after cutover.
- Nx for project graph, inferred tasks, caching, affected execution, generators, release metadata, and dependency-boundary enforcement.
- Root TypeScript, ESLint, Prettier, Jest/Vitest, commit, secret-scan, and license policies with project-specific extensions only where required.
- Project-level build, lint, typecheck, test, e2e, serve, Prisma generation/migration, Capacitor sync, and container targets.
- Local cache by default. Remote cache requires an access-control, data-classification, retention, and secret-leak review.

### Mobile Application

Use versions that are current and mutually compatible at implementation time, pin them in the lockfile, and record the selected versions in an ADR.

- Vite + React 19 + TypeScript.
- Capacitor core, CLI, Android, and iOS.
- Tailwind CSS 4 and reusable web-compatible design primitives.
- TanStack Query, Zustand, React Hook Form, Zod, Axios, i18next, Lucide, Recharts where mobile performance is acceptable.
- Official Capacitor plugins first; maintained community plugins only after a security, maintenance, license, and platform-support review.
- A typed native adapter layer so business code does not import Capacitor directly.

## Required Target Architecture

### Target Monorepo Layout

Use the structure below as the target. Exact package granularity may be adjusted through an ADR, but application boundaries and dependency direction are non-negotiable.

```text
AIOS-AIaaS-HK/
  apps/
    web/                       # Next.js 16 web application
      src/
      public/
      next.config.ts
      project.json
    mobile/                    # Vite + React + Capacitor application
      android/
      ios/
      src/
        composition/
        adapters/inbound/ui/
        adapters/outbound/native/
        navigation/
        screens/
        sync/
        storage/
      capacitor.config.ts
      vite.config.ts
      project.json
    erp-api/                   # NestJS/Express HTTP composition root
      src/
        composition/
        adapters/inbound/http/
        adapters/outbound/
      prisma/                  # Sole ERP schema/migration owner unless ADR moves it
      project.json
    erp-worker/                # BullMQ/scheduled jobs, added when separation is needed
      src/
      project.json
    ai-engine/                 # NestJS/Fastify AI service composition root
      src/
        composition/
        adapters/inbound/http/
        adapters/outbound/providers/
      project.json
  packages/
    contracts/
      erp-api/                 # Public ERP HTTP schemas and generated-client source
      ai-api/                  # ERP-to-AI schemas and action/proposal envelopes
      events/                  # Versioned asynchronous event envelopes
    erp/
      domain/                  # Entities, value objects, invariants, domain errors
      application/             # Use cases and transaction orchestration
      ports/                   # Repository/service/unit-of-work interfaces
    ai/
      domain/                  # Intent, proposal, evidence, risk, provider-neutral types
      application/             # STT/intent/proposal orchestration use cases
      ports/                   # LLM, STT, action catalog, policy and telemetry interfaces
    adapters/
      erp-prisma/              # PostgreSQL persistence implementation
      erp-redis/               # Cache/lock/rate/idempotency support adapter
      erp-bullmq/              # Queue and outbox-delivery adapter
      erp-ai-client/           # HTTP adapter implementing ERP's AI port
      ai-gemini/               # Gemini provider adapter
      ai-google-speech/        # Google Speech adapter
      notifications/           # Firebase/Twilio/mail adapters with separate ports
    clients/
      erp/                     # Typed web/mobile ERP client and error mapping
      ai-internal/             # Server-only typed AI client; never browser-exported
    frontend/
      domain/                  # Presentation-safe models and mappers
      query/                   # Query keys, cache policies, request hooks
      state/                   # Framework-neutral Zustand slices
      ui-web/                  # DOM-compatible shared components
      design-tokens/
      i18n/
    platform/
      config/                  # Typed configuration contracts, no bundled secrets
      observability/           # Logger/tracer/metrics ports and safe metadata
      security/                # Shared pure policy primitives, not auth bypasses
      testing/                 # Fixtures, contract kits and test factories
  contracts/                   # Published JSON Schema/OpenAPI artifacts if retained
  docs/
    adr/
    architecture/
    runbooks/
  infra/
    docker/
    deployment/
    monitoring/
  tools/
    generators/
    migrations/
    ci/
  nx.json
  package.json
  package-lock.json
  tsconfig.base.json
  eslint.config.mjs
```

Do not create packages merely to make the tree look architectural. A package must establish an ownership/deployment boundary, enforce a dependency rule, provide meaningful reuse, or isolate infrastructure. Start with coarse bounded-context packages and split only when coupling or build evidence justifies it.

### Ports and Adapters Rules

Apply these rules to all new code and incrementally migrate existing code without a big-bang business rewrite:

1. **Domain packages** contain entities, value objects, invariants, domain services, and domain errors. They do not import NestJS, Next.js, React, Capacitor, Prisma, Redis, BullMQ, Axios, Google SDKs, Firebase, Twilio, Node filesystem, or environment variables.
2. **Application packages** contain use cases, commands/queries, orchestration, authorization requirements, transaction requirements, and port interfaces or imports from dedicated port packages. They depend on domain/contracts, never concrete adapters.
3. **Inbound adapters** translate HTTP/UI/job input into application commands and translate outcomes into transport-specific responses. Controllers and UI components contain no authoritative business rules.
4. **Outbound adapters** implement ports for persistence, AI, speech, cache, queues, notifications, files, time, IDs, telemetry, and external APIs. Provider-specific errors are mapped to stable application errors.
5. **Composition roots** are the only locations that select concrete adapters, read runtime configuration, and assemble dependency injection.
6. **Contracts** define transport shapes, not domain behavior. Validate all external input at adapter boundaries and map DTOs explicitly.
7. **Transactions** are owned by ERP application use cases through a unit-of-work/transaction port implemented by the Prisma adapter. Do not leak Prisma transaction objects into domain code.
8. **AI boundary** is an anti-corruption layer. The AI engine returns validated proposals; the ERP application maps proposals to allowlisted commands and independently revalidates all business policy.
9. **Frontend boundary** uses typed ERP clients. Web and mobile do not import ERP application/domain internals to predict authoritative outcomes; reusable display rules must be clearly presentation-only.
10. **Native boundary** exposes interfaces such as `AudioCapturePort`, `BarcodeScannerPort`, `SecureStoragePort`, `NetworkStatusPort`, `PushPort`, `FileSharePort`, and `BiometricUnlockPort`. Capacitor imports remain inside mobile outbound adapters.

Expected dependency direction:

```text
inbound adapter ---> application ---> domain
                           |
                           +--------> ports <-------- outbound adapters

application composition root ---> inbound adapters + use cases + outbound adapters

web/mobile ---> ERP HTTP contract
ERP application ---> AiIntentPort ---> ERP AI HTTP adapter ---> AI HTTP contract
AI application ---> LlmProviderPort / SpeechToTextPort ---> provider adapters
```

### Nx Boundary Policy

Tag every project by scope and type, for example:

- scope: `web`, `mobile`, `erp`, `ai`, `shared`, `platform`;
- type: `app`, `inbound-adapter`, `outbound-adapter`, `application`, `port`, `domain`, `contract`, `ui`, `testing`;
- runtime: `browser`, `native`, `node`, `universal`;
- exposure: `public`, `internal`, `server-only`.

Enforce at least these constraints in ESLint/Nx and dependency tests:

| Source | Allowed dependencies |
|---|---|
| Domain | Domain and minimal universal contract primitives |
| Application | Domain, ports, contracts, platform interfaces |
| Port | Domain and transport-neutral contracts |
| Outbound adapter | Its declared ports, domain mappings, provider SDKs |
| Inbound adapter | Contracts, application use cases, presentation mappers |
| Web/mobile app | Frontend, UI, public contracts/clients; never server-only packages |
| ERP app | ERP application/adapters and server-only platform packages |
| AI app | AI application/adapters and server-only platform packages |
| Shared testing | Public contracts and test-only dependencies; never production-imported |

Ban deep imports and imports from `apps/*/src`. Use explicit package exports. Add circular-dependency checks and fail CI when the project graph violates tags.

### Independent Build and Deployment Boundaries

Each application must have an independent Nx project, build output, container/native artifact, health/readiness contract, environment schema, deployment manifest, version, and rollback path. A monorepo release may coordinate versions but must not require deploying every application for an unrelated isolated change.

- `web`: Next.js standalone server artifact.
- `mobile`: Vite `dist` followed by Capacitor sync and Android/iOS native builds.
- `erp-api`: NestJS API container; sole public business-mutation authority.
- `erp-worker`: optional separately scaled job runtime using the same ERP application ports.
- `ai-engine`: NestJS/Fastify container; independently scalable and unavailable without breaking core ERP.

Use Nx affected execution for validation optimization, but periodically run full workspace gates. Never let an incorrect project graph skip a required producer/consumer contract test.

Runtime flow:

```text
Next.js Web -----------------------> ERP Backend ----------------> PostgreSQL/Redis/Jobs
                                         |
Capacitor Mobile ------------------------+
                                         |
                                         +----server-to-server---> AI Engine ---> Gemini/STT

Mobile native outbound adapters:
microphone, camera/barcode, secure storage, network, app lifecycle,
push notifications, files/share/print, biometrics, deep links, local database
```

Prefer ERP-backend mediation for AI requests. If audio must upload directly to the AI engine, use a short-lived, audience-restricted upload grant issued by the ERP backend. Never expose provider keys or a general AI-engine credential to the client.

## Product-Wide Quality Requirements

- Phone layouts must prioritize one-handed actions and stable bottom navigation.
- Tablet layouts must support master-detail views, larger POS surfaces, and data-dense tables without desktop-only assumptions.
- Web keeps the existing desktop/sidebar experience.
- Every mutation exposes pending, success, validation failure, authorization failure, conflict, retryable failure, and final failure states.
- Every destructive or financial action has a clear review step, permission check, idempotency key, backend transaction, audit record, and receipt/result.
- Bangla is a first-class product language, including input, search, speech, numbers, validation, notifications, receipts, and accessibility labels.
- Meet WCAG 2.2 AA where applicable: semantic controls, screen reader labels, logical focus, 44px touch targets, keyboard support on web/tablet, contrast, reduced motion, and dynamic text resilience.
- No screen may depend solely on color to communicate state.
- Never hide sync failures, partial data, stale data, tenant/branch context, or irreversible consequences.

## Complete Functional Scope

For every capability below, classify the current state as `implemented-and-integrated`, `frontend-only`, `backend-only`, `partial`, `mocked`, `contract-mismatch`, or `not-started`. Then implement only through approved phase tickets.

### 1. Authentication, Onboarding, and Session Security

- Register a business owner with validated business type, business identity, phone/email, password, consent, and locale.
- OTP verification and resend with expiry, attempt limits, throttling, abuse controls, and non-enumerating responses.
- Sign in, refresh, session status, logout, forgot password, forgot-password OTP verification, and password reset.
- Device/session list, remote revocation, forced logout, lockout handling, password change, and security events.
- First-run business setup, branch creation/selection, default currency/timezone, invoice settings, and language selection.
- Optional biometric re-unlock of an already-issued local session. Biometrics must never replace backend authentication or silently approve a financial action.
- Deep-link handling for verification, reset, invitation, quotation/invoice, notification, and approval targets.
- Explicit expired-session handling that preserves unsent drafts without exposing protected data after logout.

### 2. Tenant, Business, Branch, Staff, Role, and Plan Context

- Business profile, business type, logo, address, tax and invoice identity, currency, timezone, and contact settings.
- Multi-branch listing, create/edit/deactivate, branch type, branch switcher, branch-scoped cache, and transfer destinations.
- Owner, manager, staff, and custom roles with backend-defined permissions.
- Staff listing, invitation/activation if supported, role assignment, branch access, edit, deactivate, and audit trail.
- Subscription plans and feature gates for free, starter, growth, and intelligence tiers.
- Usage limits and clear upgrade states without enabling paid capabilities client-side.
- Platform-admin or governance functionality must remain separately authorized and fail closed behind server-controlled flags.

### 3. Dashboard and Business Health

- Branch-aware daily/period KPI summary: sales, purchases, revenue, expenses, receivables, payables, cash, profit indicators, and inventory value.
- Sales, purchase, inventory, and revenue trends with date range and comparison periods.
- Quick actions for sale, purchase, expense, party, item, payment, transfer, scan, search, and AI assistance.
- Low-stock, expiring batch, overdue receivable/payable, failed sync, approval, and subscription alerts.
- Business health score with transparent contributing metrics and drill-downs; do not present an opaque model score as accounting truth.
- User-configurable dashboard ordering only if the configuration is synchronized and role-safe.

### 4. Parties, Ledgers, and Credit Control

- Unified customers and suppliers with categories, contact data, address, tax identity, notes, opening balance, credit limit, tags, and status.
- List, search, filter, sort, create, edit, detail, safe archive/deactivate, and controlled duplicate resolution.
- Party ledger with sales, purchases, payments, returns, balance adjustments, allocations, and running balance.
- Payment-in, payment-out, opening-balance view, controlled balance adjustment, and immutable history.
- Receivable/payable aging, credit-control dashboard, overdue indicators, collection priority, and branch/date filters.
- Collection reminders, promise-to-pay, follow-up notes, next-action date, owner assignment, and history.
- Contact action shortcuts using device dialer/SMS/share only after user intent.
- CSV import/export with validation preview, duplicate handling, row-level errors, and downloadable rejection report.

### 5. Inventory, Catalog, Variants, Batches, and Stock

- Master-item lookup and business-owned items.
- Item list/detail/create/edit/archive with category, unit, SKU, barcode, image, tax, cost, sales price, reorder level, and active status.
- Item variants and multi-tier prices such as retail, wholesale, VIP, or backend-defined custom tiers.
- Categories and units with permission-safe management.
- Batch/lot number, manufacture date, expiry date, quantity, purchase cost, and FEFO-aware selection where applicable.
- Stock ledger and movement history by item, branch, batch, source document, and date.
- Stock adjustment with reason, evidence/attachment, review, permission, idempotency, and audit record.
- Inter-branch stock transfer with source availability, destination, in-transit/received states if supported, conflict protection, and receipts.
- Low stock, out of stock, dead stock, near-expiry, and expired-stock views.
- Barcode/QR scanning with camera permission, manual fallback, torch control, scan throttling, duplicate-scan handling, and audible/haptic feedback settings.
- CSV import/export with preview and row-level validation. Do not queue bulk imports offline unless a separate design proves correctness.

### 6. Sales, POS, Invoices, Quotations, and Returns

- Sales list, summary, detail, create/POS, and only the edit/delete behaviors explicitly supported by backend policy.
- POS product search, scan, category filter, cart, quantity, unit, batch, price tier, tax, discount, notes, customer, salesperson, and branch context.
- Cash, bank, wallet, card, credit, split payment, partial payment, and backend-supported payment terms.
- Credit-limit and period-lock enforcement on the backend with actionable client errors.
- Draft review before posting, unique client request ID, durable idempotency key, transactionally committed stock/account/ledger effects, and immutable receipt.
- Invoice number, branded invoice, PDF/file export, native share sheet, print flow, and reprint audit where required.
- Quotations: list, summary, create, edit, status, expiry, share/print, conversion to sale, and prevention of duplicate conversion.
- Sales returns linked to original sale/items where possible, quantities bounded by eligible return balance, refund/credit-note choice, stock effect, and audit trail.
- Payment-in and allocation to outstanding documents/installments.
- Offline sale capture only after the backend supports durable idempotency and deterministic conflict handling. Clearly label unposted local drafts as not yet recorded.

### 7. Purchases, Purchase Orders, Receiving, and Returns

- Purchases list/detail/create/edit/delete only where backend policy permits.
- Supplier selection, item/batch entry, quantity, unit cost, tax, discount, freight/other costs, notes, invoice/reference, and attachments.
- Cash/credit/partial payment and payable creation.
- Purchase orders: draft, submit/approve if supported, send/share, partial receiving, completion/cancellation, and conversion protection.
- Batch and inventory creation during receiving with validated dates and quantities.
- Purchase returns linked to eligible purchase items, stock reduction, supplier debit/refund outcome, and audit record.
- Payment-out and allocation to supplier documents/installments.
- Offline purchase drafts may be stored locally; posting requires the same durable idempotency and conflict policy as sales.

### 8. Payments, Accounts, Cash, and Reconciliation

- Payment list/detail with type, method, party, account, reference, allocations, branch, creator, and status.
- Accounts for cash, bank, mobile wallet, card, and backend-defined types.
- Account opening balance, balance view, account transfer, transfer receipt, and permission checks.
- Cash drawer open/close/count/difference workflow where enabled.
- Payment plans and installments with due date, paid amount, remaining amount, and overdue state.
- Payment allocations, credit notes, debit notes, and document-level balance reconciliation.
- Reconciliation workflow with imported or entered statement lines only after a separate contract is confirmed.
- Never compute authoritative balances solely from a client cache.

### 9. Expenses and Attachments

- Expense categories list/detail/create/edit/delete with usage constraints.
- Expense summary, list/detail/create/edit/delete according to permission and period-lock policy.
- Date, branch, account/payment method, payee, category, amount, tax, notes, and reference.
- Camera capture or file attachment upload, preview, retry, secure download, and deletion/retention rules.
- Offline expense draft/capture with queued upload separation so a failed attachment does not create an ambiguous posted expense.

### 10. Reports and Exports

- Sales, purchase, stock, profit/loss, credit control, credit aging, dead stock, and health-score reports.
- Add stock valuation/movement, receivable/payable, expense, tax, cash/account, batch-expiry, staff activity, and audit reports only when backend contracts exist.
- Date range, comparison range, branch, item/category, party, status, account, and staff filters as appropriate.
- Summary cards, charts, accessible tables, drill-down to source documents, and visible data-as-of timestamp.
- Server-generated or verified exports for CSV/PDF; native save/share/print and permission-safe file access.
- Large reports must paginate or stream; they must not load the entire business dataset into memory on a phone.
- Reports remain online unless an approved cached-report policy defines freshness, encryption, and revocation behavior.

### 11. Search, Command Palette, and Navigation

- Global search across parties, items, sales, purchases, quotations, payments, and supported documents, scoped by tenant/branch/permission.
- Recent searches and commands stored locally without leaking sensitive data across users.
- Mobile navigation with bottom tabs for primary workflows, a More area for secondary modules, and context-aware quick-create actions.
- Tablet navigation with a rail/sidebar and master-detail panes.
- Universal/deep-link routing with authenticated return-to behavior and safe handling of missing permissions or deleted resources.
- Command palette and keyboard shortcuts on web/tablet; avoid relying on shortcuts on phones.

### 12. Notifications, Reminders, Tasks, and Approvals

- In-app notifications with list, unread count, mark one read, and mark all read.
- Native push registration per user/device, token rotation, logout cleanup, revocation, and deep links.
- Reminder create/list/detail/edit/delete with due date, recurrence if supported, assignee, related record, and completion state.
- Collection reminders and promise-to-pay events integrated with party credit workflows.
- Low stock, batch expiry, overdue payment, approval, sync failure, security, and subscription notifications.
- Notification preferences by category/channel while preserving mandatory security and transactional notices.
- Approval screens for high-risk actions only after backend approval objects, states, permissions, and audit transitions exist.

### 13. Settings, Administration, Data, and Support

- Profile, password/security, business, branches, staff, roles, permissions, inventory settings, and categories.
- Invoice template/numbering, accounts/payment methods, approvals, period locks, and subscription/billing.
- Data export, backup status, restore policy, recycle bin/retention, account closure, and privacy requests according to backend support.
- Help center, support ticket list/create/detail, support messages, attachment policy, and status updates when APIs exist.
- Audit-log viewer for authorized roles with actor, action, entity, before/after metadata policy, request ID, timestamp, branch, and source.
- Remote configuration and feature flags must be signed/server-controlled; local toggles cannot grant access.

### 14. AI Assistant, Bangla Voice, and Safe Actions

- Text and voice entry in Bangla and English.
- Native microphone recording with explicit permission, recording indicator, duration/size limits, cancellation, local playback if approved, and cleanup.
- Speech-to-text through the server-controlled AI gateway with provider health/fallback, language metadata, file validation, rate limits, and trace IDs.
- Structured intent extraction validated against versioned Zod/JSON schemas and the action registry.
- Read-only questions over authorized ERP context: summaries, inventory, customer balance, sales/purchase trends, and navigation help.
- Mutation requests must return a proposal containing action ID, normalized parameters, human-readable effects, missing fields, confidence/evidence, expiry, tenant/branch context, and risk level.
- The user reviews and explicitly confirms a proposal. High-risk actions require step-up authentication or backend approval according to policy.
- The ERP backend revalidates authorization, current state, period lock, inventory, credit, pricing, idempotency, proposal expiry, and tenant/branch before execution.
- The backend returns a durable receipt or structured rejection. The AI must never fabricate successful execution.
- Prevent prompt injection from ERP data, cross-tenant retrieval, arbitrary tool calls, replay, duplicate execution, and silent fallback from structured output to unsafe free text.
- Preserve transcript correction before submission and show whether speech, intent, or execution failed.
- AI and STT feature flags must fail closed. The app must remain a functional ERP when AI is unavailable.

### 15. Offline, Sync, and Conflict Management

- Cache an explicitly approved subset of branch data for read-only offline use: essential items, parties, settings, and recent records. Apply record count, age, and storage limits.
- Store local drafts for sales, purchases, expenses, parties, and stock work only where the phase has an approved offline policy.
- Replace the current localStorage-only queue for native use with an encrypted durable local database behind a storage interface.
- Queue records must include mutation ID, idempotency key, operation type, contract version, tenant, branch, user, device, dependencies, payload hash, created time, last attempt, retry count, status, and sanitized error.
- Use dependency-aware FIFO processing, bounded exponential backoff with jitter, explicit retry, cancellation for unposted drafts, and dead-letter handling.
- Never retry non-idempotent requests without a stable backend idempotency contract.
- Sync on network recovery, app foreground, manual request, and safe scheduled opportunities within OS limits.
- Conflicts must be explicit. Support server-wins for reference data, draft merge only for approved fields, and user resolution for financial/document conflicts. Never silently overwrite a posted transaction.
- Show pending/failed counts globally and per record. A queued record is not a completed ERP transaction.
- Encrypt sensitive local data, wipe user-scoped data on logout/revocation, and prevent one account from opening another account's cache.

### 16. Native Device Capabilities

Build typed adapters with web fallbacks for:

- app lifecycle and back-button behavior;
- network status and connectivity transitions;
- secure credential/token storage using platform Keychain/Keystore facilities;
- biometric local unlock;
- microphone and audio recording;
- camera, receipt/document capture, and barcode/QR scanning;
- push notifications and deep links;
- filesystem, download, native share sheet, and safe cache cleanup;
- printing through system print and approved Bluetooth/thermal printer integration after a hardware spike;
- haptics for scan/success/error feedback with user preference and accessibility respect;
- status bar, splash screen, keyboard, safe areas, orientation, and tablet/window resizing.

Every permission must be requested just in time, explained in Bangla and English, recover gracefully when denied, and be reflected accurately in Android/iOS privacy manifests and store declarations.

## Mobile Authentication and Security Design

Do not copy the web authentication implementation blindly into the native app. Audit the current cookie, CSRF, refresh, CORS, and NextAuth behavior and define an explicit mobile-client contract.

Required properties:

1. Use short-lived access credentials and rotating refresh credentials.
2. Keep access credentials in memory when practical. Store refresh credentials only through a reviewed native secure-storage adapter, never plain localStorage, preferences, source code, logs, analytics, crash reports, or backups.
3. Detect refresh-token reuse, revoke the credential family, and force reauthentication.
4. Bind every request to authenticated backend-derived business/user scope. Treat the client branch header as a requested context that the backend must authorize.
5. Use PKCE and system-browser authentication if external identity providers are added.
6. Use CSRF protection for cookie-authenticated web requests. Do not apply a misleading CSRF mechanism to authorization-header mobile requests; instead enforce origin/client policy, token audience, replay defenses, and rate limits.
7. Configure CORS with exact production origins/schemes. Never use wildcard origin with credentials.
8. Redact tokens, passwords, OTPs, audio, raw prompts, sensitive party data, and financial payloads from logs and telemetry.
9. Enforce TLS, certificate validation, Android Network Security Config, iOS transport security, secure backup exclusions, screen-capture policy for sensitive screens if required, and release-build hardening.
10. Root/jailbreak or integrity signals may increase risk controls but must not become the only authorization control.
11. Apply server-side throttling and abuse controls to login, OTP, reset, STT, AI, search, export, uploads, and mutation endpoints.
12. Run dependency, secret, mobile binary, API authorization, tenant-isolation, and insecure-storage checks before release.

The mobile bundle contains only public configuration such as ERP API base URL, build channel, release ID, public Sentry DSN, and approved public Firebase client configuration. Environment files containing server secrets must remain backend-local and uncommitted.

## API and Contract Requirements

Before building feature screens, generate an API capability matrix from ERP and AI controllers/OpenAPI. For each frontend operation record:

- method and canonical path;
- request/response schema and schema version;
- authentication, permission, business, and branch rules;
- idempotency behavior;
- pagination/filter/sort contract;
- cache and freshness policy;
- online/offline eligibility;
- retry classification;
- standardized error code and recovery action;
- audit and observability behavior;
- implementation/test evidence.

Create one shared error envelope with a stable machine code, safe message key, field errors, trace/request ID, retryability, and optional conflict metadata. Mobile UI must map machine codes to localized messages and actions rather than parse English strings.

Close or explicitly defer existing contract gaps. The current backend controller inventory supports substantial auth, dashboard, item, party, expense, sale, purchase, return, quotation, payment, reminder, notification, search, and settings behavior, but several frontend-visible update/delete/administrative flows require verification or new backend work. Never emulate a missing mutation with direct database access, a client-only state change, or an AI tool.

Minimum new backend foundations before offline financial posting or AI execution:

- durable idempotency table/unique key and response replay semantics;
- transactionally coupled business effects and audit records;
- optimistic-concurrency/version metadata where records are editable;
- stable financial receipt/result contract;
- outbox/event mechanism for notifications and cross-service effects where needed;
- mobile session/device credential lifecycle;
- push-device registration and revocation;
- upload metadata, malware/content validation, quotas, retention, and signed access;
- proposal confirmation/execution endpoint if AI mutations are enabled;
- versioned OpenAPI/JSON schema artifacts and consumer contract tests.

## Data and State Rules

- TanStack Query owns remote server state; Zustand owns small local UI/session/draft coordination state. Do not duplicate entire server collections in both.
- Query keys always include business, branch, locale, permission-sensitive context, and relevant filters.
- Clear or partition caches on account, business, branch, permission, and plan transitions.
- Use normalized identifiers supplied by the backend. Do not generate authoritative invoice, ledger, payment, sale, purchase, or audit IDs on the client.
- Local temporary IDs must be namespaced and reconciled through an explicit server mapping.
- Persist only the minimum required data. Define storage schema migrations and recovery tests for every native app version.
- Never rely on client clock for posting eligibility, proposal expiry, period locks, or financial ordering; use server timestamps and clock-skew-tolerant display logic.

## UX and Design-System Instructions

- Preserve HelloKhata brand tokens, but build a restrained operational ERP interface rather than a marketing layout.
- Use bottom navigation for the most frequent phone destinations and a navigation rail/sidebar on tablets.
- Use familiar icons for icon actions with accessible labels/tooltips where applicable.
- Use segmented controls for modes, toggles/checkboxes for binary settings, steppers/inputs for quantities, native date/time pickers behind adapters, and menus for option sets.
- Avoid nested cards and oversized headings. Use dense, scan-friendly lists and tables with stable row/action dimensions.
- POS keeps cart totals and primary checkout action visible without covering item search or the keyboard.
- Forms support keyboard avoidance, safe-area insets, draft preservation, field-level validation, unsaved-change warnings, and error focus.
- Long Bangla and English text must wrap without clipping or overlapping at supported text scales.
- Provide skeleton, empty, permission-denied, feature-gated, offline, stale, loading-more, error, and retry states for every data surface.
- Show active business and branch on all transaction screens and confirmation receipts.

## Implementation Order and Gates

Create separate tickets and pull requests for each bounded phase. Do not combine Git-history migration, architectural extraction, backend financial guarantees, mobile creation, offline sync, and AI action execution in one PR.

### Phase 0 - Evidence, Migration Design, ADRs, and Spikes

Deliver:

- refreshed branch/commit/tag/source-of-truth register for the outer harness and all three nested repositories;
- dirty/staged/untracked inventory and ownership decision for every file that is not in a source commit;
- repository-history graph, licenses, tags, branch protections, environments, secrets, deployments, open PRs, and CI inventory;
- ADR comparing tested history-import strategies and selecting the reversible migration procedure;
- ADR selecting npm workspaces plus Nx and defining root/tool versions, project graph, cache policy, and affected-CI baseline;
- ADR defining bounded contexts, ports/adapters, Nx tags, package exports, and dependency constraints;
- complete frontend-screen to ERP/AI endpoint capability matrix;
- ADR: Capacitor/Vite decision and React Native/Expo alternative;
- ADR: mobile authentication and token storage;
- ADR: local database, encryption, migration, backup, and wipe policy;
- ADR: offline mutation/idempotency/conflict model;
- ADR: AI proposal and execution trust boundary;
- small Android and iOS proof that builds a Vite bundle, runs through Capacitor, calls a non-sensitive health endpoint, survives lifecycle changes, and uses one official native plugin;
- hardware spike for barcode and required thermal/Bluetooth printers using the actual target models;
- migration rehearsal in a disposable clone/branch proving log, blame, tags, source-to-target commit mapping, install, build, test, and rollback behavior;
- prioritized gap register with repository, architecture, backend, AI, web, and mobile prerequisites and acceptance tests.

Gate: migration method, freeze/cutover policy, target layout, Nx boundary matrix, supported OS versions, app identifiers, hardware list, mobile auth contract, and initial release scope are approved. No canonical migration or business feature work starts before this gate.

### Phase 1 - History-Preserving Monorepo Import

- Create a protected migration branch from the outer integration repository or a separately approved target repository.
- Add the private root workspace manifest, pinned package manager, Nx baseline, root TypeScript/ESLint/format/test configuration, and empty target app/package boundaries.
- Import frontend history to `apps/web`, ERP backend history to `apps/erp-api`, and AI history to `apps/ai-engine` using the rehearsed procedure.
- Preserve and map relevant tags/releases. Record source remote, branch, commit, import commit, target path, and verification result.
- Move existing outer contracts, docs, tools, and release manifests only after ownership and duplication review.
- Do not import the preserved AI snapshot as active source. Retain it as external/archive evidence or explicitly ignored migration material.
- Keep application behavior and dependencies unchanged except for paths/build wiring necessary to establish parity.
- Establish one root lockfile without opportunistic dependency upgrades. Deduplicate only when parity tests prove runtime compatibility.

Gate: imported histories are traceable; all pre-migration build/lint/test gates produce equivalent results; runtime/API schema checks match; containers start; no source file is silently omitted; rollback to split repositories is documented and tested. Split repositories remain canonical until this gate is approved.

### Phase 2 - Monorepo Cutover and Architectural Boundaries

- Freeze or archive split-repository write paths according to the approved cutover plan and declare the monorepo canonical in governance documentation.
- Configure Nx project metadata/inference, project tags, explicit exports, affected tasks, cache inputs/outputs, CI base/head refs, and dependency-boundary lint rules.
- Add `nx graph`, circular dependency, deep-import, browser/server boundary, and contract producer/consumer checks.
- Extract contracts first, then domain/application/port packages one bounded context at a time while preserving behavior.
- Move Prisma persistence, Redis/BullMQ, AI provider, speech, notification, and other SDK code behind outbound adapters.
- Create explicit application composition roots and eliminate direct infrastructure creation from domain/use-case code.
- Add an ERP-to-AI port and HTTP adapter; remove any direct ERP persistence dependency from AI and any direct AI-provider dependency from web/mobile.
- Keep web, ERP API, AI engine, and worker build/deployment artifacts independent.

Gate: the monorepo is the documented source of truth; dependency constraints pass; full workspace gates pass; affected-CI behavior is tested against representative changes; web/API/AI runtime parity and coordinated staging smoke tests pass.

### Phase 3 - Shared Frontend Foundation and Mobile Shell

- Create `apps/mobile`, set Capacitor `webDir` to Vite `dist`, add Android/iOS, and commit native projects.
- Add environment schema, build channels, routing, navigation, theme, i18n, error boundary, telemetry adapter, feature flags, and native adapter interfaces.
- Extract shared frontend contracts/client, presentation types, API error model, design tokens, i18n, query keys, and test fixtures without importing Next.js or Capacitor into universal packages.
- Add app lifecycle, network status, safe areas, keyboard, status bar, splash, and secure-storage adapters.
- Add Nx targets and CI for web/mobile lint, typecheck, unit tests, Vite build, `cap sync` verification, Android debug build, and an iOS build job on macOS.

Gate: web regression gates pass; project boundaries pass; Android and iOS launch reliably; no server-only package or secret appears in browser/native artifacts; account/business cache partition tests pass.

### Phase 4 - Authentication and Read-Only ERP

- Implement approved mobile auth/session contract, logout/wipe, branch selection, profile, plan and permission context.
- Implement dashboard, party/item lookup and detail, stock views, sales/purchase/payment lists and detail, notifications, reminders, global search, and core reports in online/read-only mode.
- Add camera barcode lookup, native share/download, and push token registration behind flags.

Gate: authorization and cross-tenant/branch tests pass; session refresh/revocation works; read screens handle paging, stale state, degraded network, and permission changes.

### Phase 5 - Online Transactional Workflows

- Implement parties, items, expenses, quotations, sales/POS, purchases, payments, returns, stock adjustment/transfer, accounts, and approved settings in dependency order.
- Add backend durable idempotency, audit, transactions, conflict/version checks, period locks, receipts, and standardized error codes before each corresponding mobile mutation.
- Keep unsupported edit/delete/approval flows visibly unavailable rather than simulated.

Gate: each mutation has backend integration tests, mobile E2E tests, duplicate-submit tests, rollback tests, authorization tests, receipt verification, and accounting/inventory invariant checks.

### Phase 6 - Offline Drafts and Controlled Sync

- Introduce encrypted local database and schema migrations.
- Add approved cached reference/read data.
- Add drafts first, then mutation queue one operation type at a time.
- Start with the lowest-risk idempotent workflow. Add sales/purchases/stock/financial operations only after server idempotency and conflict tests are proven.
- Add sync center, retry/dead-letter actions, record-level status, logout handling, dependency ordering, and conflict UI.

Gate: airplane-mode, process-kill, device-reboot, token-expiry, duplicate-delivery, partial-upload, conflict, app-upgrade, downgrade policy, storage-full, and multi-account isolation tests pass.

### Phase 7 - AI, Voice, and Native Productivity

- Replace browser-only speech capture in mobile with the native audio adapter and server STT pipeline.
- Add transcript review, structured proposals, missing-field clarification, confirmation, expiry, execution receipts, and safe failures.
- Add push deep links, document camera flows, system print/share, haptics, biometrics, and approved printer integration.
- Roll out AI read-only first, then low-risk proposals, then approved higher-risk actions. Every step remains feature flagged and server controlled.

Gate: prompt-injection, malformed model output, provider outage, timeout, replay, cross-tenant, stale proposal, duplicate confirmation, permission change, and false-success tests pass.

### Phase 8 - Administration, Reporting, Hardening, and Store Release

- Complete supported settings, staff/role flows, period locks, exports, support, audit viewer, billing/subscription surfaces, and advanced reports.
- Profile startup, large lists, POS scanning, charts, storage, battery, network, memory, and crash behavior on low/mid/high target devices.
- Complete accessibility, Bangla linguistic QA, privacy review, threat model, penetration testing, dependency review, data-retention review, backup/restore tests, and incident runbooks.
- Prepare signed release builds, store metadata, screenshots, privacy declarations, permission copy, support URL, deletion process, staged rollout, monitoring, and rollback plan.

Gate: product, finance/domain, security, privacy, QA, operations, and store-release owners sign off. Local technical success alone is not release approval.

## Testing Requirements

### Automated

- Migration-parity tests comparing split-repository and imported-monorepo build outputs, API schemas, migrations, route inventories, and critical runtime smokes before cutover.
- Unit tests for domain functions, validation, reducers/stores, serializers, error mapping, permission display, and native adapters.
- Architecture tests for Nx tag constraints, package exports, deep imports, circular dependencies, browser/native/server-only separation, Prisma ownership, and forbidden application-to-application source imports.
- Port contract suites that every concrete adapter must pass, including provider error mapping and timeout/cancellation behavior.
- Component tests for forms, lists, POS/cart, confirmation, sync status, conflict resolution, and accessibility.
- API producer tests in NestJS and consumer contract tests in web/mobile.
- Integration tests with PostgreSQL and Redis for transactions, locks, idempotency, audit, outbox/jobs, and authorization.
- Mobile E2E tests on Android emulator and iOS simulator for critical journeys.
- Physical-device smoke tests for camera, microphone, push, biometrics, file sharing, printing, keyboard, lifecycle, and networking.
- Web/API/AI regression tests after every shared-package or adapter extraction.
- Static checks: lint, formatting, typecheck, dependency boundaries, project graph, circular imports, secret scan, license scan, dependency vulnerabilities, native configuration lint, and `git diff --check`.
- Representative Nx affected tests proving web-only, mobile-only, contract, domain, ERP adapter, and AI adapter changes select all required downstream targets without running unrelated deployments.

### Critical End-to-End Journeys

1. Register -> OTP -> business setup -> first branch -> dashboard.
2. Login -> revoke/expire session -> preserve safe draft -> reauthenticate -> resume.
3. Create customer and item -> scan item -> make cash sale -> share/print invoice -> verify stock, ledger, payment, and audit effects.
4. Credit sale -> collection reminder -> payment-in allocation -> aging update.
5. Purchase with batch -> stock receive -> payment-out -> purchase return.
6. Stock adjustment and branch transfer with simultaneous competing requests.
7. Expense with camera attachment and failed/retried upload.
8. Offline draft -> queue -> process kill -> reconnect -> one and only one backend posting -> durable receipt.
9. Conflict after server-side edit -> explicit user resolution without lost posted data.
10. Bangla voice request -> transcript correction -> structured proposal -> explicit confirmation -> backend receipt.
11. Permission/branch/plan changes while the app is open -> immediate cache and UI correction.
12. Push notification -> authenticated deep link -> authorized target or safe denial.

### Performance Budgets

Define measurable budgets during Phase 0 and enforce them in CI/release testing for:

- cold/warm startup;
- initial authenticated dashboard rendering;
- list interaction and scroll smoothness;
- barcode scan-to-item latency;
- POS add-to-cart latency;
- API payload size and page size;
- offline database size and migration duration;
- sync throughput and battery/network usage;
- app bundle size and native binary size;
- crash-free sessions and ANR rate.

Do not invent passing thresholds after implementation. Agree on device classes and budgets first.

## CI/CD and Release Requirements

- Use one reproducible root `npm ci` install and pin npm, Node, Nx, Java, Gradle, Android SDK, Xcode, CocoaPods, and Capacitor-compatible versions.
- Run `nx affected` targets for pull requests using explicit trusted base/head refs; run full workspace gates on the migration branch before cutover, on protected release branches, and on a scheduled basis.
- Define task inputs, outputs, environment variables, runtime files, Prisma artifacts, Next output, Vite output, native sync state, and container outputs accurately so caches cannot return stale or environment-crossed artifacts.
- Never place secrets, environment files, signing material, production data, or sensitive generated output in local/remote task caches.
- Require dependency-boundary and producer/consumer contract gates before build/deploy targets.
- Separate development, staging, and production app IDs, display names, API endpoints, push projects, signing identities, and telemetry environments.
- Keep Android keystores, iOS certificates/profiles, store API keys, and backend secrets only in approved secret management.
- Build the Vite bundle before every `npx cap sync`; fail CI if native projects are stale relative to web assets/plugins.
- Produce signed artifacts only from protected CI release workflows tied to reviewed component/release tags and a monorepo compatibility manifest.
- Build and deploy web, ERP API, ERP worker, AI engine, Android, and iOS as separate projects. Shared-package changes trigger only the affected consumers, subject to full release-gate verification.
- Generate SBOM, dependency/license report, source maps under controlled access, release notes, database migration plan, compatibility matrix, and rollback plan.
- Roll out through internal testing, closed beta/TestFlight, staged production, and monitored expansion.
- Do not deliver arbitrary remote executable web code as a way to bypass app-store review. Any live-update mechanism requires security, integrity, rollback, and store-policy review.

## React Native/Expo Alternative Instructions

If Phase 0 approves React Native instead of Capacitor:

1. Use the current recommended Expo framework path unless a native dependency demonstrably requires a bare React Native setup.
2. Share only framework-neutral contracts, domain logic, API/query code, schemas, localization catalogs, state logic, and design tokens.
3. Rewrite the UI using React Native components and an approved accessible component system. Do not attempt to reuse DOM/Radix components directly.
4. Use Expo/React Native equivalents for routing, secure storage, SQLite, camera/barcode, audio, notifications, filesystem/share, biometrics, background tasks, deep links, and updates after compatibility and policy review.
5. Preserve every source-of-truth, security, idempotency, offline, AI, testing, and release requirement in this document.
6. Record the additional staffing, timeline, component-parity, accessibility, printer/hardware, and web-divergence costs before approval.

## Required Agent Execution Protocol

At the start of every phase:

1. Before cutover, show `git status --short`, branch, HEAD, remotes, upstream, and divergence for the outer harness and each affected nested repository. After cutover, show the canonical monorepo state plus affected Nx projects.
2. Fetch first when network access is approved; distinguish local evidence from remote-current evidence.
3. Read workspace/project instructions, root lockfile, Nx/project configuration, environment examples, generated API docs, migrations, package exports, boundary rules, and relevant tests.
4. List exact projects/files to change, dependency-graph impact, ports/adapters/contracts affected, migration impact, feature flags, risks, and validation commands.
5. Ask only blocking questions that cannot be answered from code/contracts. Do not code past an unresolved financial, tenant, auth, offline, hardware, or release decision.

During implementation:

- Keep each PR single-purpose and reviewable.
- Use Nx generators/templates for consistent project tags, exports, tests, and targets after those generators are reviewed and tested.
- Add tests with behavior, not snapshots alone.
- Preserve unrelated changes and avoid broad formatting/refactoring churn.
- Do not combine dependency upgrades with history import or behavioral extraction unless required and explicitly approved.
- Use feature flags that default off for incomplete native, offline, AI, and financial capabilities.
- Record backend/AI compatibility requirements in the release manifest.

At completion:

- Report changed projects/packages/files and behavior; during migration, also report source-to-target history mapping.
- Report every validation command and exact result; do not fabricate passes.
- Separate verified local success from simulator, physical-device, provider, staging, app-store, migration, security, and business-UAT blockers.
- Provide screenshots/test evidence for supported phone/tablet dimensions and native permissions.
- Provide remaining risks, deferred features, rollback steps, and next gate.
- Commit/push/create PR only after explicit approval, then verify the matching remote head.

## Definition of Done

A feature is done only when all applicable conditions are met:

- UX exists for phone and tablet, in Bangla and English.
- Backend contract exists and is versioned.
- Tenant, branch, role, plan, and period-lock enforcement is server tested.
- Financial/inventory effects are transactional and invariant tested.
- Idempotency, retry, duplicate submission, and conflict behavior are proven.
- Loading, empty, offline, stale, error, permission, feature-gate, and success states exist.
- Accessibility labels, focus, touch targets, dynamic text, and contrast pass.
- Logs and telemetry are redacted and traceable by safe request/release IDs.
- Unit, integration, contract, E2E, and relevant physical-device tests pass.
- Web regressions pass after shared changes.
- Nx boundaries, project graph, package exports, affected selection, and independent application builds pass.
- New or changed infrastructure dependencies are accessed through ports and contract-tested adapters.
- Documentation, OpenAPI/contracts, runbooks, migration notes, and release manifest are updated.
- Security/privacy/domain reviewers approve high-risk areas.
- No unresolved critical/high defect or unowned release blocker remains.

## Required Deliverables

Maintain these artifacts throughout execution:

1. Source-of-truth and branch/ref/tag register.
2. History-import ADR, rehearsal evidence, source-to-target commit map, freeze/cutover plan, and rollback procedure.
3. ADR set for Nx/npm workspace, package boundaries, platform, auth, storage, offline, AI trust boundary, and native plugins.
4. Nx project catalog with owner, tags, runtime, exposure, dependencies, targets, artifact, deployment, and support tier.
5. Ports/adapters catalog showing interface owner, implementations, composition root, contract suite, and runtime.
6. Screen/feature/API capability matrix with current evidence and owner.
7. C4 context/container/component diagrams and sequence diagrams for auth, online mutation, offline replay, push, AI confirmation, monorepo build, and independent deployment.
8. Versioned OpenAPI/JSON schemas, event schemas, package exports, and generated typed clients.
9. Permission/role/plan matrix.
10. Offline eligibility and conflict-policy matrix per mutation.
11. Data classification, retention, local-storage, cache, and deletion register.
12. Native plugin and hardware compatibility register.
13. Threat model, privacy review, and security test report.
14. Automated, architecture, contract, and physical-device test matrix.
15. Performance and build/CI budget with benchmark report.
16. CI/CD, cache, signing, environment, release, rollback, and incident runbooks.
17. Monorepo component compatibility and release manifest.
18. User-facing Bangla/English support, privacy, permission, and recovery documentation.

## Questions That Must Be Resolved in Phase 0

Do not guess these product decisions:

1. Is `AIOS-AIaaS/AIOS-AIaaS-HK` the approved permanent canonical monorepo remote?
2. Which split-repository branches/tags must be imported, and will split repositories become read-only archives after cutover?
3. What is the permitted code-freeze window, final synchronization procedure, rollback window, and cutover authority?
4. Will internal packages remain workspace-private, or must selected contracts/clients be independently published and versioned?
5. Is release versioning coordinated for the whole platform or independent per deployable application?
6. Is remote Nx caching allowed; if yes, which service, region, retention, encryption, and access policy are approved?
7. What are the minimum Android API level, iOS version, phone/tablet classes, and store countries?
8. Is the first release full ERP parity or a smaller owner/POS field release?
9. Which exact Bluetooth/USB/thermal printer, scanner, cash drawer, and POS terminal models must work?
10. Must any transaction be postable offline, or are offline drafts sufficient for the first release?
11. Which operation should be the first offline mutation, and what conflict outcome does the business accept?
12. What mobile session model will the backend support: dedicated bearer/refresh flow, cookie flow, or standards-based identity provider?
13. Are multi-business accounts required, or only one business with multiple branches?
14. Which roles may create, edit, delete, return, adjust stock, transfer stock, approve, export, and run AI-proposed actions?
15. Which reports must be available offline, if any, and what freshness label/retention is acceptable?
16. What data may be cached locally, for how long, and may it be included in OS backups?
17. What are the invoice paper sizes, languages, tax requirements, numbering rules, and printer formats?
18. Which countries/currencies/tax regimes are in initial scope?
19. Which notification channels and mandatory notices are required?
20. Which AI actions are read-only, low-risk proposal, high-risk proposal, or prohibited?
21. Is audio retained, and what are the consent, deletion, transcription, residency, and provider policies?
22. What are the required RTO/RPO, support hours, staged-rollout metrics, and rollback authority?

## First Response Required From the Coding Agent

Before coding, return:

1. Verified refs, tags, remotes, divergence, and clean/dirty state for the outer harness and all three nested repositories.
2. Monorepo migration verdict with tested history-import options, recommendation, rollback approach, and unresolved ownership risks.
3. Nx/npm workspace and ports/adapters verdict with proposed project catalog, tags, dependency matrix, composition roots, and forbidden imports.
4. Mobile verdict confirming Capacitor/Vite or documenting evidence for React Native/Expo.
5. Feature/API capability matrix summary with direct, partial, missing, and risky counts.
6. Backend prerequisites for mobile auth, durable idempotency, offline sync, push, upload, and AI proposal execution.
7. Phase 0 plan with exact repositories/projects/files, tools, devices, commands, acceptance criteria, and blockers.
8. Answers discovered from code/history/configuration and only the remaining blocking questions from the list above.
9. A clear stop for approval before Phase 1 history import.

Do not modify product code or repository history until this first response is reviewed and Phase 1 is explicitly approved.
