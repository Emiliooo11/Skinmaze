# Skinmaze — Platform Masterplan

**Version:** 1.0  
**Date:** 2026-05-14  
**Status:** Active Blueprint

---

## 1. App Overview & Objectives

Skinmaze is a CS2 (Counter-Strike 2) skin platform targeting the EU market. It combines a **case opening system** and a **skin marketplace** into a single, cohesive product where each system reinforces the other.

The core user loop is:
> Deposit funds → Open cases → Win skins → Sell on marketplace → Reinvest balance

The business generates revenue through:
- House edge on case openings
- Marketplace seller commissions
- Skin pricing margins (buy/sell spread)

The platform intentionally restricts **withdrawals to skins only** (via Steam trade), which removes fiat/crypto cashout and positions the product appropriately within the EU market without requiring a gambling license.

---

## 2. Target Audience

- **Primary:** EU-based CS2 players aged 18+
- **Profile:** Gamers familiar with CS2 skin economy, case opening, and Steam trading
- **Platforms:** Desktop (primary) and Mobile (responsive, full feature parity)
- **Languages:** English first; additional EU languages can be added in later phases

---

## 3. Money Flow

```
DEPOSIT                  PLATFORM                 WITHDRAW
--------                 --------                 --------
Fiat (card)  ──────►                    
Crypto       ──────►   Balance (USD)   ──────►   Skins via Steam
Skins        ──────►                    
```

- All value is normalized to USD platform balance internally
- No fiat or crypto withdrawals — skins only
- Skin values are priced in USD and sourced from market data

---

## 4. Core Features & Functionality

### 4.1 Authentication
- Steam OAuth login (OpenID)
- Retrieves: SteamID64, username, avatar, profile URL
- Session management via secure HTTP-only cookies + JWT
- Multi-device session support

### 4.2 Wallet & Balance System
- Virtual USD balance per user
- Atomic transactions with double-spend prevention
- Full transaction ledger with immutable audit logs
- Transaction types: deposit, withdrawal, case open, case win, marketplace purchase, marketplace sale, affiliate commission, bonus, refund, admin adjustment
- Every transaction stores: unique ID, before/after balances, metadata, timestamp

### 4.3 Case Opening System
- Users spend balance to open virtual cases
- Cases contain weighted skin pools across rarity tiers
- Animated opening experience (spinning/reveal UI)
- Provably fair — every roll is verifiable by the user
- Live global feed of recent openings

### 4.4 Provably Fair System
- Server seed (hashed before reveal) + Client seed + Nonce
- SHA256-based deterministic roll generation
- Users can set their own client seed
- Public verification page — any roll can be independently verified
- Seed rotation system — old seeds revealed when rotated

### 4.5 Skin Marketplace
- Buy and sell skins
- Instant sell option (sell to platform at market rate)
- List skins for other users to purchase
- Search, filter, and sort by: weapon type, wear condition, float value, rarity, price, stickers
- Price history charts per skin
- Support for special skin attributes: Doppler phases, blue gems, pattern index, sticker combinations

### 4.6 Skin Data & Pricing Engine
- Each skin tracks: market hash name, weapon, skin name, rarity, wear, float value, stickers, phase, paint seed, inspect link, icon
- Price sources: Steam market, Waxpeer provider data, internal sales history
- Dynamic pricing formula:
  ```
  finalPrice = basePrice + providerFee + volatilityMargin + liquidityAdjustment + platformMargin
  ```
- Cached pricing with real-time refresh intervals
- Price confidence scores and fallback pricing

### 4.7 Inventory System
- Internal platform inventory (skins owned by the house)
- External inventory via Waxpeer (and future providers)
- Hybrid fulfillment: serve from internal first, fall back to external
- Item states: available → reserved → locked → pending_trade → delivered / failed
- Concurrency-safe reservations using distributed locking

### 4.8 Steam Trade System
- Steam bot integration for deposits and withdrawals
- Automated trade offer creation and acceptance
- Escrow detection and handling
- Anti-scam verification on all trades
- Trade status tracking and retry logic
- Bot inventory monitoring

### 4.9 Third-Party Skin Provider Integration
- **Launch provider:** Waxpeer
- **Future providers:** CSFloat, Skinport, DMarket, BitSkins, ShadowPay
- Unified provider abstraction layer with standard interface:
  - fetchInventory(), fetchPrices(), reserveItem(), purchaseItem(), withdrawItem(), getTradeStatus()
- Failover routing between providers
- Rate limiting and retry queues
- Price normalization across providers

### 4.10 Affiliate System
- Unique referral codes per user
- Commission on referred users' activity (deposits/wagers)
- Tiered commission structure
- Affiliate dashboard with earnings tracking

### 4.11 Bonus & Progression System
- Promo codes with configurable bonuses
- Deposit bonus campaigns
- XP and level progression system
- Daily login rewards
- Anti-abuse: wager requirements, withdrawal locks, multi-account detection

### 4.12 Admin Panel
- User management (view, ban, adjust balance, KYC flags)
- Case editor with drag-and-drop skin selection
- RTP (Return to Player) analytics per case
- Profitability simulation and margin slider
- Provider management and inventory oversight
- Trade monitoring dashboard
- Financial dashboard: revenue, deposits, withdrawals, margins
- Fraud/risk monitoring

### 4.13 Real-Time Features
- Live case opening feed (global activity stream)
- Live marketplace listings
- Real-time balance updates
- Notifications (trade status, case results, marketplace activity)

---

## 5. Technical Stack

### Frontend
- **Framework:** Next.js (React) — SSR/SSG support, excellent performance, Vercel-native
- **Styling:** Tailwind CSS — rapid UI development, responsive by default
- **State Management:** Zustand or React Query — lightweight, fits the data patterns
- **Real-time:** Socket.io client
- **Animations:** Framer Motion — for case opening animations and UI transitions

### Backend
- **Framework:** NestJS — modular, TypeScript-first, scales from monolith to microservices
- **Database:** PostgreSQL — ACID-compliant, ideal for financial ledger data
- **ORM:** Prisma — type-safe database access, clean migrations
- **Cache:** Redis — session storage, distributed locking, price caching, queue backing
- **Queue:** BullMQ (Redis-backed) — background jobs, trade processing, provider sync
- **WebSockets:** Socket.io — real-time events

### Infrastructure (Prototype → Production)

| Phase | Frontend | Backend | Database |
|-------|----------|---------|----------|
| Prototype | Vercel | Railway or Render | Railway PostgreSQL |
| Production | Vercel | AWS ECS or DigitalOcean | AWS RDS PostgreSQL |

- **Containerization:** Docker (from day one for consistency)
- **CDN:** Cloudflare (asset delivery + DDoS protection)
- **Secrets:** Environment variables → AWS Secrets Manager in production

---

## 6. Conceptual Data Model

### Core Entities

```
User
├── id, steamId, username, avatar
├── balance, xp, level
├── affiliateCode, affiliateEarnings
├── totalWagered, totalDeposited, totalWithdrawn
├── role, banned, createdAt

Transaction
├── id, userId, type, amount
├── balanceBefore, balanceAfter
├── metadata, referenceId
├── createdAt (immutable)

Skin
├── id, marketHashName, weapon, skinName
├── rarity, wear, floatValue
├── stickers[], phase, paintSeed
├── iconUrl, inspectLink
├── steamPrice, providerPrice, finalPrice
├── liquidityScore, sourceProvider

Case
├── id, name, image, price, houseEdge
├── active, featured, createdAt
└── items[] → CaseItem
      ├── skinId, probabilityWeight
      ├── displayedOdds, rarityTier

CaseOpening
├── id, userId, caseId, skinWonId
├── serverSeed, clientSeed, nonce
├── roll, result
├── createdAt

InventoryItem
├── id, skinId, ownerId (user or platform)
├── state, sourceProvider
├── reservedAt, tradableAfter

Trade
├── id, userId, botId, tradeOfferId
├── type (deposit/withdrawal), status
├── items[], timestamps
├── steamApiResponse

MarketListing
├── id, sellerId, skinId
├── price, status
├── createdAt, soldAt

SeedPair
├── id, userId
├── serverSeedHash, serverSeed (revealed after rotation)
├── clientSeed, nonce, active
```

---

## 7. User Interface Design Principles

> Note: Full visual design will be implemented from a Figma file provided after the prototype phase. The following are structural principles only.

- **Dark theme first** — standard for gaming/skin platforms, reduces eye strain
- **Mobile responsive** — full feature parity on mobile, not a stripped-down version
- **Speed feels** — case opening animation is a core experience moment; it must feel satisfying and fast
- **Trust signals** — provably fair verification must be prominently accessible, not buried
- **Clean information hierarchy** — skin float, wear, rarity, and price must be scannable at a glance
- **Desktop:** sidebar navigation, wide content area, live activity feed column
- **Mobile:** bottom tab navigation, stacked layout, full-screen case opening

---

## 8. Security Architecture

### Financial Security
- Atomic database transactions for all balance operations
- Idempotency keys on all transaction endpoints
- Distributed Redis locks to prevent duplicate processing
- Compensating transaction pattern (no direct reversals)

### Application Security
- CSRF protection on all state-changing endpoints
- XSS prevention via strict Content Security Policy
- SQL injection prevention via Prisma ORM (parameterized queries)
- Rate limiting per endpoint, per user, per IP
- HTTP-only cookies for session tokens

### Infrastructure Security
- Cloudflare DDoS protection
- IP allowlisting for admin panel
- Environment-separated secrets (never in code)
- Audit logs for all admin actions

### Fraud Prevention
- Multi-account detection (device fingerprinting + IP analysis)
- Bonus abuse protection (wager requirements before withdrawal)
- VPN/proxy detection for high-risk actions
- Withdrawal cooldowns and daily limits
- Risk scoring on suspicious activity patterns
- Behavioral analytics for anomaly detection

---

## 9. Development Phases

### Phase 1 — Prototype (Technical Foundation)
**Goal:** Core systems working end-to-end with mock/placeholder data

Deliverables:
- [ ] Project scaffolding (Next.js + NestJS + PostgreSQL + Redis)
- [ ] Database schema and migrations (all core tables)
- [ ] Steam OAuth authentication
- [ ] User profiles and session management
- [ ] Wallet system with transaction ledger
- [ ] Case opening engine with provably fair logic
- [ ] Basic case management (create/edit cases with mock skins)
- [ ] Marketplace (list, buy, sell — with mock inventory)
- [ ] Basic admin panel (user management, case editor)
- [ ] Placeholder UI (functional, not designed)
- [ ] Docker setup for local development

### Phase 2 — Waxpeer Integration
**Goal:** Real skins flowing through the platform

Deliverables:
- [ ] Waxpeer API integration (provider abstraction layer)
- [ ] Real-time skin inventory sync
- [ ] Live pricing engine connected to Waxpeer data
- [ ] Inventory reservation and fulfillment flow
- [ ] Webhook handling for trade status updates

### Phase 3 — Steam Bot Integration
**Goal:** Real deposits and withdrawals via Steam

Deliverables:
- [ ] Steam bot account setup and integration
- [ ] Skin deposit flow (user → bot trade)
- [ ] Skin withdrawal flow (bot → user trade)
- [ ] Trade status tracking and retry logic
- [ ] Escrow detection and handling

### Phase 4 — Payment Integration
**Goal:** Real money in via fiat and crypto

Deliverables:
- [ ] Fiat payment processor integration (card deposits)
- [ ] Crypto payment integration (BTC, ETH, USDT)
- [ ] Deposit confirmation and balance crediting
- [ ] Payment webhook handling and reconciliation

### Phase 5 — Design Implementation
**Goal:** Apply Figma designs to the working prototype

Deliverables:
- [ ] Full frontend redesign from Figma specs
- [ ] Case opening animation polish
- [ ] Mobile-optimized layouts
- [ ] Component library finalization
- [ ] Accessibility pass

### Phase 6 — Production Hardening
**Goal:** Platform ready for real users

Deliverables:
- [ ] Performance optimization (caching, query tuning, CDN)
- [ ] Security audit and penetration testing
- [ ] Load testing and concurrency validation
- [ ] Monitoring and alerting setup (error tracking, uptime)
- [ ] CI/CD pipeline
- [ ] Production infrastructure migration
- [ ] Analytics and telemetry

### Phase 7 — Growth Features
**Goal:** Retention and monetization expansion

Deliverables:
- [ ] Affiliate system
- [ ] Bonus and promo code system
- [ ] XP/level progression
- [ ] Additional skin providers (CSFloat, Skinport, etc.)
- [ ] Advanced admin analytics (RTP per case, profitability dashboards)
- [ ] Battle pass / seasonal features

---

## 10. Potential Challenges & Solutions

| Challenge | Risk | Solution |
|-----------|------|----------|
| Race conditions on balance/inventory | High | Redis distributed locks + atomic DB transactions |
| Steam trade delays/failures | High | Async queue with retry logic + status webhooks |
| Skin price volatility | Medium | Cached pricing with refresh intervals + confidence scores |
| Provider API downtime | Medium | Failover routing + fallback to internal inventory |
| Multi-accounting / bonus abuse | Medium | Device fingerprinting + wager requirements |
| Provably fair correctness | High | Deterministic, audited algorithm + public verification page |
| Scaling under high concurrent opens | Medium | Queue-based processing + horizontal scaling |
| Regulatory changes in EU | Medium | Architecture allows geo-blocking per country |

---

## 11. Future Expansion Possibilities

- **Skin upgrades / trade-up contracts** — combine lower-tier skins for a chance at higher tier
- **Battles** — multiple users open cases simultaneously, highest value wins the pot
- **Crash / Coinflip games** — additional game modes using platform balance
- **Mobile app** — native iOS/Android (React Native)
- **Additional games** — expand beyond CS2 to other game economies (Dota 2, Rust)
- **VIP / subscription tier** — reduced fees and exclusive cases for subscribers
- **API for affiliates** — let large affiliates embed case openings on their own sites

---

## 12. Key Decisions & Rationale

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | Next.js | SEO, SSR, Vercel deployment, React ecosystem |
| Backend | NestJS | Modular, TypeScript, scales well, good DX |
| Database | PostgreSQL | ACID compliance critical for financial data |
| Queue | BullMQ | Redis-backed, reliable, good for trade flows |
| Provider | Waxpeer first | Start focused, abstract for future providers |
| Withdrawals | Skins only | Legal positioning in EU market |
| Architecture | Modular monolith → microservices | Start simple, split when scale demands it |
| Prototype infra | Vercel + Railway | Zero ops overhead, fast to launch |
| Production infra | Vercel + AWS/DO | Reliability, scalability, cost control |

---

*This masterplan is a living document. It should be updated as decisions are made, integrations are added, and the product evolves.*
