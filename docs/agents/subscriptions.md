# Subscriptions & Whop Integration

> **When to use:** Working with subscription flows, Whop checkout, redeem codes, plan selection, or profile completion for new users.

---

## Cookie Proxy Pattern

All authenticated API calls go through Next.js API routes that act as server-side proxies.

- On auth: proxy intercepts Sanctum `token` from Laravel response → stores as `tabootv_token` HttpOnly cookie (token never exposed to JS)
- On subsequent requests: proxy reads cookie → forwards as `Authorization: Bearer {token}`
- Laravel remains unchanged — authenticates via Sanctum Bearer tokens

**Ref:** `src/proxy.ts`

---

## Subscription Expiration Logic

### Active Subscription Check

A user is considered subscribed (`User::subscribed()`, cached 5 min) if:

1. Has a subscription where `(end_at IS NULL OR end_at > NOW()) AND status IN ('active', 'completed', 'trial', 'course_bonus')`, OR
2. `user.lifetime_membership` is `true`

### Status Enum

| Value | Active? | Description |
|-------|---------|-------------|
| `active` | Yes | Active paid subscription |
| `completed` | Yes | Completed payment cycle (valid until `end_at`) |
| `trial` | Yes | Free trial period |
| `course_bonus` | Yes | Bonus access from course purchase |
| `canceled` | No | User canceled — access revoked immediately |
| `expired` | No | Subscription expired |
| `trial expired` | No | Trial ended without conversion |
| `paused` | No | Subscription paused |
| `grace_period` | No | Grace period after failed payment |
| `chargeback` | No | Payment disputed |
| `refund` | No | Payment refunded |
| `payment failed` | No | Recurring payment failed |
| `past_due` | No | Payment overdue |
| `unresolved` | No | Unresolved payment issue |

**Key insight:** There is no automatic status transition to `expired`. Expiration is purely date-based. The `status` column reflects the last event from the payment provider. A subscription with `status: 'active'` and `end_at` in the past is effectively expired.

**Known gap:** `canceled` is NOT in the active status list, so cancellation revokes access immediately even if `end_at` is in the future (industry standard would keep access until period end).

---

## Plan Selection

**Endpoint:** `GET /api/plans/by-country?country={code}` (public, no auth)

Returns plans with regional pricing. Falls back to `US` if country not found. Lifetime plans excluded.

**Key response fields per plan:**

| Field | Type | Description |
|-------|------|-------------|
| `whop_plan_id` | string\|null | Use for embedded checkout |
| `whop_plan_url` | string | Use for redirect checkout (fallback) |
| `price` | float | Price in major currency units (cents / 100) |
| `currency` | string | ISO currency code (e.g., `USD`) |
| `trial_days` | integer\|null | Free trial duration |
| `save_percentage` | integer\|null | Discount vs monthly |

**Country detection:** Use `useCountryCode` hook (`src/hooks/use-country-code.ts`) for client-side detection, pass as query param.

---

## Whop Checkout (Embedded) — Primary Flow

User never leaves your domain. Uses `@whop/checkout` React component.

### Sequence

1. User selects plan on `/choose-plan`
2. `<WhopCheckoutEmbed planId={plan.whop_plan_id} onComplete={handler} skipRedirect />` opens in modal
3. User completes payment inside iframe
4. `onComplete(planId, receiptId)` fires → close modal → start polling
5. Backend already updated by Whop `payment.succeeded` webhook (server-to-server)
6. Poll `GET /api/subscription/status` every 2s (max 15 attempts / 30s)
7. When `subscribed: true` → redirect to `/`

### Timeout Handling

If polling times out (30s), show "Payment received! Your subscription is being activated." with a "Check Again" button.

---

## Whop Checkout (Redirect) — Fallback Flow

For plans with `whop_plan_url` but no `whop_plan_id`.

1. Build URL: `plan.whop_plan_url + ?redirect_url=${origin}/choose-plan?status=success`
2. Redirect to Whop hosted checkout
3. After payment, Whop redirects back with `?status=success`
4. Same polling logic as embedded flow

---

## Whop OAuth Callback

Handles users who purchase directly on whop.com. Whop redirects to `/auth/whop-callback?code=XXX&membership_id=YYY`.

**Endpoint:** `POST /api/auth/whop-exchange` — exchanges OAuth code for Sanctum token.

**Ref:** `src/app/(auth)/auth/whop-callback/page.tsx`

### Three Scenarios

| Scenario | Response | Action |
|----------|----------|--------|
| New user | 200 + token | Cookie set → redirect to `/account/complete` |
| Existing, logged in | 200 + token | Cookie set → redirect to `/` |
| Existing, NOT logged in | 202, no token | Show "subscription activated" → redirect to `/sign-in` with email pre-filled |

**Security:** Existing users who are NOT logged in are never auto-logged-in (prevents account takeover).

---

## Redeem Codes

### Validate → Apply (2-step)

| Step | Endpoint | Auth |
|------|----------|------|
| Validate | `POST /api/redeem-codes/validate` | Yes |
| Apply | `POST /api/redeem-codes/apply` | Yes |

Both rate-limited to **10 requests/min**.

### Validation Rules (Backend)

- User does NOT have active subscription
- Code exists, `is_active = true`
- Within `start_date` / `expiry_date` range (if set)
- Usage count < `max_uses` (if set)
- User hasn't used this code before
- User is not the code creator
- For `invite` type: user has no subscription in last 6 months

### Code Types

| Type | Description |
|------|-------------|
| `gift` | Grants N days of access |
| `invite` | Invitation code with 6-month cooldown |

### New User Workaround

New users must register first (redeem endpoints require auth):

1. `POST /api/register` → get token
2. `POST /api/redeem-codes/validate` → validate code
3. `POST /api/redeem-codes/apply` → apply code

**Risk:** Non-atomic — if register succeeds but apply fails, user exists without code. Frontend should retry apply on failure.

**Ref:** `src/app/(onboarding)/redeem/`

---

## Subscription Management

**Endpoint:** `GET /api/subscription` (auth required)

Returns: `provider`, `status`, `start_at`, `end_at`, `manage_url`

- `manage_url` links to the provider's portal (Whop, Apple, Google Play)
- **No manual cancel endpoint** — cancellation is provider-driven via webhooks
- After cancellation webhook, `GET /api/subscription/status` returns `{ subscribed: false }`

---

## Profile Completion (New Users)

**Endpoint:** `POST /api/profile/update-profile` (auth required, no subscription required)

Required fields: `first_name`, `last_name`, `display_name`, `handler`, `gender`, `country_id`

### Supporting Endpoints

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/handler/check/{handler}` | No | Check username availability |
| `GET /api/countries` | No | Country dropdown data |

### Handler Change Rules

1. **First-time set** (handler is `null`): Free, does not consume a change
2. **Subsequent changes:** Decrements `handler_changes_remaining` (default: 1)
3. **No changes left:** Returns 422

### Password Gap for OAuth/Whop Users

OAuth users have a random backend-generated password they don't know. **Workaround:** Use forget-password → reset-password flow (`POST /api/forget-password` then `POST /api/reset-password`).

---

## Caching & Security

### Subscription Cache

- **Key:** `user_subscribed:{user_id}` (5 min TTL)
- **Auto-invalidated** on subscription save/delete (model boot hook)
- After Whop webhook processes, next `subscribed()` call re-queries DB

### Account Takeover Protection

- Whop webhook `createOrUpdateUser()` checks `last_login` before updating existing accounts
- Whop OAuth callback blocks auto-login for existing users who are NOT logged in

### Security Gaps Summary

| Gap | Location | Risk |
|-----|----------|------|
| No rate limit on API login | `POST /api/login` | Brute force |
| No rate limit on API register | `POST /api/register` | Mass account creation |
| Webhook signature uses `!=` not `hash_equals()` | `POST /webhook/whop` | Timing attack (low risk) |
| OTP stored plaintext | Password reset | DB breach exposure |

---

## API Gap Registry

### Missing: `POST /api/profile/set-initial-password`

OAuth/Whop users can't set a password without knowing their current one. **Workaround:** Use forget-password → reset-password OTP flow.

### Missing: Atomic register + redeem

No `POST /api/auth/register-with-code`. **Workaround:** Two separate calls (register → apply). Frontend should handle retry if apply fails.

### Known: `profile_completed` flag not set by API

`POST /api/profile/update-profile` updates fields but never sets `profile_completed = true`. **Frontend workaround:** Check all required fields are non-null (`display_name`, `first_name`, `last_name`, `gender`, `country_id`, `handler`) instead of relying solely on the flag.
