# Backend — NestJS API

NestJS API built for an engineering challenge. Full details and architectural decisions live in the [superproject README](https://github.com/pabloandura/an-enterprise-nestjs-example).

## Challenge Compliance

The challenge required: NestJS + MongoDB + JWT, with Product and Order endpoints, file upload, pagination/sorting/filtering, and a Docker bonus.

**All requirements are met. Intentional divergences:**

| Area | Requirement | What was built | Why |
|---|---|---|---|
| Persistence | MongoDB only (`@nestjs/mongoose`) | MongoDB for Products & Orders; **PostgreSQL for Auth** | Auth needs relational integrity: `UNIQUE` on email, FK from `refresh_tokens → users`, transactional token rotation. `@nestjs/mongoose` is used exactly as required for the two data-heavy modules. |
| Auth | JWT strategy | JWT **+ refresh token rotation** | A bare access token with no rotation is insecure for a real API. The JWT guard itself is the auth strategy; refresh tokens extend it without replacing it. |
| Order "list of products" | Reference to products | **Embedded line-item snapshots** (`priceAtPurchase`, `name`, `sku`) | Price changes after an order is placed should not alter historical totals — standard e-commerce practice. |
| Product "picture" field | File upload | Stored as `imageUrl`; file written to disk or S3 | The upload is multipart (satisfies the requirement); the field name reflects what is actually persisted. |
| Roles | Not mentioned | ADMIN vs USER roles guard | Required to protect mutation and reporting endpoints in a realistic API. |
| Bonus | Dockerize | Docker + **AWS CloudFormation + ECS + frontend** | The bonus is covered; the extra scope demonstrates a production-ready delivery. |

## Running locally

Recommended: use the superproject's `docker-compose.dev.yml` — it wires up MongoDB, PostgreSQL, and this API together.

```bash
# From the superproject root
docker compose -f docker-compose.dev.yml up --build
# API → http://localhost:3000
```

Standalone (requires `.env` with connection strings):

```bash
npm install
npm run start:dev
```
