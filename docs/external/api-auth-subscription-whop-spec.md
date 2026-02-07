# Technical Specification: Auth, Subscription Expiration & Whop Integration

**Last Updated**: 2026-02-06
**Version**: 1.3
**Status**: Complete
**Audience**: Next.js frontend developers integrating with existing Laravel backend

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Social Authentication & New User Onboarding](#2-social-authentication--new-user-onboarding)
3. [Subscription Expiration (Monthly / Annual Plans)](#3-subscription-expiration-monthly--annual-plans)
4. [Whop Checkout & Webhook Lifecycle](#4-whop-checkout--webhook-lifecycle)
5. [Technical & Security Standards](#5-technical--security-standards)
6. [Plan Cancellation Flow](#6-plan-cancellation-flow)
7. [New User Onboarding & Profile Completion](#7-new-user-onboarding--profile-completion)
8. [API Endpoint Gap Registry](#8-api-endpoint-gap-registry)
9. [Whop Embedded Checkout Integration](#9-whop-embedded-checkout-integration)
10. [Subscription Management from Next.js](#10-subscription-management-from-nextjs)

---

## 1. Architecture Overview

### Request Flow

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│              │       │                  │       │                  │
│   Next.js    │──────>│   proxy.ts       │──────>│  Laravel API     │
│   Client     │<──────│   (API Proxy)    │<──────│  (Sanctum)       │
│              │       │                  │       │                  │
└──────────────┘       └──────────────────┘       └──────────────────┘
     Browser               Next.js Server              Backend
```

### Cookie-Based Token Strategy

The Next.js proxy acts as a secure intermediary between the browser and the Laravel API:

1. **On authentication**: The proxy intercepts the Sanctum `token` from Laravel's response and stores it in a `tabootv_token` HttpOnly cookie. The token is **never exposed to client-side JavaScript**.
2. **On every subsequent request**: The proxy reads the `tabootv_token` cookie and attaches it as `Authorization: Bearer {token}` before forwarding to Laravel.
3. **Laravel remains unchanged**: It continues to authenticate via Sanctum Bearer tokens as usual.

```
Browser → proxy.ts                         proxy.ts → Laravel
─────────────────                         ─────────────────
Cookie: tabootv_token=1|abc...    →       Authorization: Bearer 1|abc...
(HttpOnly, not accessible via JS)         (Standard Sanctum header)
```

### Key Principle

The Laravel backend requires **zero changes**. All proxy logic lives in the Next.js layer. The backend continues to issue and validate Sanctum Bearer tokens identically to how it works for the current mobile app.

---

## 2. Social Authentication & New User Onboarding

### 2.1 Firebase Social Login (Google / Apple)

**Endpoint**: `POST /api/auth/firebase-login`
**Controller**: `App\Http\Controllers\Api\Auth\FirebaseAuthController@firebaseLogin`
**Rate Limit**: `throttle:10,1` (10 requests per minute per IP)
**Auth Required**: No

#### Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Next.js  │     │ Firebase │     │ proxy.ts │     │ Laravel  │
│ Client   │     │ (Google/ │     │          │     │ Backend  │
│          │     │  Apple)  │     │          │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │  1. Sign in    │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │  2. Firebase   │                │                │
     │     ID Token   │                │                │
     │<───────────────│                │                │
     │                │                │                │
     │  3. POST /api/auth/firebase-login               │
     │     { firebase_token }          │                │
     │────────────────────────────────>│                │
     │                │                │                │
     │                │                │  4. Forward    │
     │                │                │────────────────>│
     │                │                │                │
     │                │                │  5. Verify     │
     │                │                │     Firebase   │
     │                │                │     token via  │
     │                │                │     Admin SDK  │
     │                │                │                │
     │                │                │  6. Find/create│
     │                │                │     user       │
     │                │                │                │
     │                │                │  7. Return     │
     │                │                │     response   │
     │                │                │     + token    │
     │                │                │<───────────────│
     │                │                │                │
     │                │  8. Set tabootv_token cookie    │
     │                │     Strip token from response   │
     │                │                │                │
     │  9. 200 OK (user data, NO token)│                │
     │<────────────────────────────────│                │
     │                │                │                │
```

#### Request

```json
{
  "firebase_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "device_token": "fcm_token_here"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firebase_token` | string | Yes | Firebase ID Token JWT from client-side Firebase Auth |
| `device_token` | string | No | FCM token for push notifications |

#### Response (Success — 200)

**Raw response from Laravel** (what proxy.ts receives):

```json
{
  "message": "Authentication successful",
  "user": { ... },
  "subscribed": false,
  "requires_username": true,
  "token": "1|abc123def456..."
}
```

**Response after proxy processing** (what the browser receives):

```json
{
  "message": "Authentication successful",
  "user": {
    "id": 1,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "first_name": "John",
    "last_name": "Doe",
    "display_name": null,
    "handler": "@johndoe",
    "email": "user@gmail.com",
    "gender": null,
    "phone_number": null,
    "profile_completed": false,
    "video_autoplay": true,
    "handler_changes_remaining": 3,
    "country_id": null,
    "provider": null,
    "badge": "",
    "is_creator": false,
    "has_courses": false,
    "channel": null,
    "dp": "/images/placeholder-dp.jpg",
    "medium_dp": "/images/placeholder-dp.jpg",
    "small_dp": "/images/placeholder-dp.jpg"
  },
  "subscribed": false,
  "requires_username": true
}
```

The proxy strips the `token` field and sets it as the `tabootv_token` HttpOnly cookie.

#### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Firebase token has no email claim | `{ "message": "Email not provided by authentication provider" }` |
| 401 | Invalid or expired Firebase token | `{ "message": "Invalid or expired Firebase token" }` |
| 422 | Missing `firebase_token` field | `{ "message": "...", "errors": { "firebase_token": [...] } }` |
| 429 | Rate limit exceeded (>10 req/min) | Standard Laravel throttle response |
| 500 | Firebase config missing | `{ "message": "Firebase configuration error" }` |
| 500 | Database error | `{ "message": "Database error during authentication" }` |
| 500 | Generic server error | `{ "message": "Authentication failed" }` |

#### Backend User Resolution Logic

The controller follows this logic (see `FirebaseAuthController.php:130-217`):

1. Search for user by `firebase_uid` OR `email` (case-insensitive):
   ```sql
   SELECT * FROM users WHERE firebase_uid = ? OR email = LOWER(?) LIMIT 1
   ```
2. **If user exists with no `firebase_uid`**: Link accounts by setting `firebase_uid` and `auth_provider`
3. **If user exists with `firebase_uid`**: Proceed directly (no update needed)
4. **If no user found**: Create new user with:
   - `firebase_uid` = UID from token
   - `email` = lowercase email from token
   - `auth_provider` = `'google'` or `'apple'` (detected from `providerData`)
   - `display_name` = `null` (triggers `requires_username: true`)
   - `password` = `null` (OAuth users don't have passwords)
   - `email_verified_at` = `now()` (Firebase already verified)
   - `active` = `true`
   - `profile_completed` = `false`

#### `requires_username` Flag

This boolean is `true` when `display_name` is `null`. On the frontend, show a username-selection modal before allowing the user to proceed. The username can be set via `POST /api/profile/update-profile`.

> **See also**: [Section 7 — New User Onboarding & Profile Completion](#7-new-user-onboarding--profile-completion) for the complete post-login onboarding flow, profile update endpoint details, and known gaps around `profile_completed`.

---

### 2.2 Email/Password Login

**Endpoint**: `POST /api/login`
**Controller**: `App\Http\Controllers\Api\Auth\ApiLoginController@store`
**Rate Limit**: None on API route (the web login has rate limiting via `LoginRequest`, but the API endpoint does not)
**Auth Required**: No

#### Request

```json
{
  "email": "user@example.com",
  "password": "secret123",
  "device_token": "fcm_token_here"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Any string |
| `device_token` | string | No | FCM token for push notifications |

#### Response (Success — 200)

**Raw from Laravel:**

```json
{
  "message": "",
  "user": { ... },
  "subscribed": true,
  "token": "1|abc123def456..."
}
```

**After proxy processing** (token stripped, cookie set):

```json
{
  "message": "",
  "user": { ... },
  "subscribed": true
}
```

#### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 422 | Email not found | `{ "message": "Email does not exist.", "errors": { "email": ["Email does not exist."] } }` |
| 422 | Wrong password | `{ "message": "Invalid password.", "errors": { "email": ["Invalid password."] } }` |
| 422 | Validation failure | Standard Laravel validation error response |

#### Implementation Notes

- Email is normalized to lowercase before lookup
- Case-insensitive search: `WHERE LOWER(email) = ?`
- Device token stored in `device_tokens` table and subscribed to Firebase `all_users` topic
- Sanctum token created with name `"General Token"`

---

### 2.3 Registration

**Endpoint**: `POST /api/register`
**Controller**: `App\Http\Controllers\Api\Auth\ApiRegisterController`
**Rate Limit**: None
**Auth Required**: No

#### Request

```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "referral_code": "abc123hash",
  "privacy_policy": true,
  "terms_and_condition": true,
  "device_token": "fcm_token_here"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email, unique, lowercase, max 255 |
| `password` | string | Yes | Confirmed, meets `Password::defaults()` |
| `password_confirmation` | string | Yes | Must match `password` |
| `referral_code` | string | No | Must exist in `users.referral_code` |
| `privacy_policy` | boolean | Yes* | Must be `true` (enforced in controller) |
| `terms_and_condition` | boolean | Yes* | Must be `true` (enforced in controller) |
| `device_token` | string | No | FCM token |

#### Response (Success — 200)

**Raw from Laravel:**

```json
{
  "message": "",
  "user": { ... },
  "subscribed": false,
  "token": "123|abc123def456..."
}
```

**After proxy processing:**

```json
{
  "message": "",
  "user": {
    "id": 123,
    "uuid": "...",
    "email": "newuser@example.com",
    "profile_completed": false
  },
  "subscribed": false
}
```

#### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 422 | Email already exists | `{ "message": "Email already exists", "errors": { "email": ["Email already exists"] } }` |
| 422 | Terms not accepted | `{ "message": "...", "errors": { "terms_and_condition": ["Please agree to the terms and conditions and privacy policy"] } }` |
| 422 | Validation failure | Standard Laravel validation error response |

---

### 2.4 Logout

**Endpoint**: `POST /api/logout`
**Controller**: `App\Http\Controllers\Api\Auth\ApiLoginController@destroy`
**Auth Required**: Yes (`auth:sanctum`)

#### Request

```json
{
  "device_token": "fcm_token_here"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `device_token` | string | No | If provided, removes this FCM token from user's devices |

#### Response (Success — 200)

```json
{
  "message": "User Log Out Successfully"
}
```

#### Proxy Behavior

On successful logout, the proxy must also clear the `tabootv_token` cookie by setting it with `Max-Age: 0`.

#### Implementation Notes

- Deletes the current Sanctum access token via `currentAccessToken()->delete()`
- Optionally removes the specified device token from `device_tokens` table
- Does NOT invalidate other tokens/sessions for the same user

---

### 2.5 Get Authenticated User

**Endpoint**: `GET /api/me`
**Action**: `App\Actions\GetAuthUser`
**Auth Required**: Yes (`auth:sanctum`)

#### Response (Success — 200)

```json
{
  "message": "",
  "user": {
    "id": 1,
    "uuid": "a1b2c3d4-...",
    "first_name": "John",
    "last_name": "Doe",
    "display_name": "johndoe",
    "handler": "@johndoe",
    "email": "user@example.com",
    "gender": "male",
    "phone_number": "+1234567890",
    "profile_completed": true,
    "video_autoplay": true,
    "handler_changes_remaining": 2,
    "country_id": 1,
    "provider": "whop",
    "badge": "https://example.com/images/badges/monthly.png",
    "is_creator": false,
    "has_courses": false,
    "channel": null,
    "dp": "https://cdn.example.com/signed-url...",
    "medium_dp": "https://cdn.example.com/signed-url...",
    "small_dp": "https://cdn.example.com/signed-url..."
  },
  "subscribed": true
}
```

#### Error Response

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Invalid/expired token | `{ "message": "Unauthenticated." }` |

#### Use Cases

- Validate that the token in `tabootv_token` cookie is still valid
- Fetch updated user profile and subscription status
- Check `requires_username` equivalent: if `display_name` is `null`
- Check `profile_completed` to gate access to profile completion flow

---

### 2.6 UserResource Shape Reference

The `UserResource` (`app/Http/Resources/UserResource.php`) conditionally includes fields based on whether the authenticated user is viewing their own profile:

**Own profile fields** (included when `auth()->user()->id == resource->id` or no auth user):

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | User ID |
| `uuid` | string | UUID |
| `country_id` | integer\|null | Country FK |
| `first_name` | string\|null | First name (own profile only) |
| `last_name` | string\|null | Last name (own profile only) |
| `display_name` | string\|null | Display name (falls back to `first_name`) |
| `handler` | string\|null | User handle (e.g., `@johndoe`) |
| `handler_changes_remaining` | integer | Remaining handle changes (own profile only) |
| `email` | string | Email address (own profile only) |
| `gender` | string\|null | Gender (own profile only) |
| `phone_number` | string\|null | Phone number (own profile only) |
| `profile_completed` | boolean | Whether profile setup is complete (own profile only) |
| `video_autoplay` | boolean | Autoplay preference (own profile only) |
| `provider` | string\|null | Active subscription provider name (own profile only) |
| `badge` | string | Badge image URL (empty string if none) |
| `is_creator` | boolean | Whether user has a channel |
| `has_courses` | boolean | Whether user has active course subscriptions (own profile only) |
| `channel` | object\|null | Channel data if relation loaded |
| `dp` | string | Full-size profile picture URL (if media loaded) |
| `medium_dp` | string | Medium profile picture URL (if media loaded) |
| `small_dp` | string | Small profile picture URL (if media loaded) |

**Other user's profile**: Only `id`, `uuid`, `country_id`, `display_name`, `handler`, `badge`, `is_creator`, `channel`, `dp`, `medium_dp`, `small_dp` are included.

---

## 3. Subscription Expiration (Monthly / Annual Plans)

### 3.1 How Expiration Is Calculated

Subscription validity is determined by the `end_at` column on the `subscriptions` table:

| Plan Type | `start_at` | `end_at` |
|-----------|-----------|---------|
| Monthly | Set by payment provider | `start_at + ~1 month` (provider determines exact date) |
| Annual | Set by payment provider | `start_at + ~1 year` (provider determines exact date) |
| Lifetime | Set by payment provider | `NULL` |
| Course Bonus | `now()` | `now() + 1 year` |

**Dates come from the payment provider** (Whop/Apple), not calculated locally. The `syncLocalSubscription` method in `Whop.php` maps:
- `membership.created_at` or `membership.renewal_period_start` → `start_at`
- `membership.expires_at` or `membership.renewal_period_end` → `end_at`

### 3.2 Active Subscription Check

**Method**: `User::subscribed()` (cached 5 minutes)
**Source**: `app/Models/User.php:117-130`

```php
public function subscribed(): bool
{
    return Cache::remember(
        "user_subscribed:{$this->id}",
        300, // 5 minutes
        function () {
            return $this->subscriptions()->active()->exists()
                || $this->lifetime_membership;
        }
    );
}
```

**Active scope** (`Subscription::scopeActive` in `app/Models/Subscription.php:46-53`):

```sql
WHERE (end_at IS NULL OR end_at > NOW())
  AND status IN ('active', 'completed', 'trial', 'course_bonus')
```

**Combined logic** — a user is considered subscribed if ANY of these are true:
1. Has a subscription where `end_at IS NULL` or `end_at > now()` **AND** status is one of: `active`, `completed`, `trial`, `course_bonus`
2. `user.lifetime_membership` is `true`

### 3.3 Subscription Status Enum

All possible values from `App\Enums\SubscriptionStatusEnum`:

| Value | Considered Active | Description |
|-------|-------------------|-------------|
| `active` | Yes | Active paid subscription |
| `completed` | Yes | Completed payment cycle (still valid until `end_at`) |
| `trial` | Yes | Free trial period |
| `course_bonus` | Yes | Bonus access from course purchase |
| `paused` | No | Subscription paused |
| `grace_period` | No | Grace period after failed payment |
| `chargeback` | No | Payment disputed |
| `canceled` | No | User canceled |
| `expired` | No | Subscription expired |
| `trial expired` | No | Trial period ended without conversion |
| `refund` | No | Payment refunded |
| `payment failed` | No | Recurring payment failed |
| `past_due` | No | Payment overdue |
| `unresolved` | No | Unresolved payment issue |

**Key insight**: There is no automatic status transition to `expired`. Expiration is purely date-based (`end_at < now()`). The `status` column reflects the **last event from the payment provider**, not current validity. A subscription with `status: 'active'` and `end_at` in the past is effectively expired.

### 3.4 Cache Invalidation

Subscription caches are automatically invalidated when:

- **Subscription saved/deleted**: `Subscription::boot()` forgets `user_badge:{user_id}` and `user_subscribed:{user_id}`
- **User `lifetime_membership` changes**: `User::boot()` updated event forgets the same cache keys

This means after a Whop webhook creates/updates a subscription, the next `subscribed()` call will re-query the database.

### 3.5 EnsureSubscriptionMiddleware — The 403 Response

**Source**: `app/Http/Middleware/EnsureSubscriptionMiddleware.php`

When an API request hits a subscription-protected endpoint and the user is not subscribed:

```
HTTP 403 Forbidden
Content-Type: application/json

{
  "message": "You need to subscribe to access this resource."
}
```

**Which endpoints are protected?** All routes inside the `EnsureSubscriptionMiddleware` group in `routes/api.php:106-269`, including:
- `/api/home/*` (banners, featured videos, shorts, etc.)
- `/api/videos/*` (play, comments, likes, etc.)
- `/api/series/*`
- `/api/courses/*`
- `/api/posts/*`
- `/api/shorts/*`
- `/api/live-chat/*`
- `/api/search`
- `/api/notifications/*`
- `/api/creators/*`
- `/api/watchlist/*`
- `/api/clips/*`

**NOT protected** (outside subscription middleware):
- `/api/me`
- `/api/subscription/status`
- `/api/subscription`
- `/api/profile/*`
- `/api/login`, `/api/register`, `/api/logout`
- `/api/device-token`
- `/api/studio/*`
- `/api/redeem-codes/*`

### 3.6 Frontend Handling Strategy

The proxy (`proxy.ts`) must distinguish between two types of error responses:

| Signal | Meaning | Proxy Action |
|--------|---------|--------------|
| HTTP 401 + `"Unauthenticated."` | Token expired/invalid | Clear `tabootv_token` cookie → redirect to login |
| HTTP 403 + `"You need to subscribe to access this resource."` | Valid auth, no subscription | Redirect to pricing/renew page (do NOT logout) |

**Implementation in proxy.ts:**

```
1. Forward request to Laravel with Bearer token
2. If response is 401:
   - Clear `tabootv_token` cookie (Max-Age: 0)
   - Return 401 to client
   - Client redirects to /login
3. If response is 403:
   - Check body for "You need to subscribe to access this resource."
   - If match: return 403 to client with subscription-expired indicator
   - Client redirects to /pricing (NOT /login)
4. Otherwise: forward response as-is
```

### 3.7 Subscription Status Endpoint

**Endpoint**: `GET /api/subscription/status`
**Action**: `App\Actions\GetSubscribedStatus`
**Auth Required**: Yes (`auth:sanctum`)

#### Response

```json
{
  "message": "",
  "subscribed": true
}
```

Uses the cached `User::subscribed()` method. Useful for quick polling after payment to detect when subscription becomes active.

### 3.8 Subscription Info Endpoint

**Endpoint**: `GET /api/subscription`
**Action**: `App\Actions\Subscription\GetSubscriptionInfo`
**Auth Required**: Yes (`auth:sanctum`)

#### Response (Active subscription)

```json
{
  "provider": "whop",
  "status": "active",
  "start_at": "2026-01-15T00:00:00.000000Z",
  "end_at": "2026-02-15T00:00:00.000000Z",
  "manage_url": "https://whop.com/manage/..."
}
```

#### Response (No active subscription)

```json
{
  "provider": null,
  "status": null,
  "start_at": null,
  "end_at": null,
  "manage_url": null
}
```

#### Notes

- Only queries subscriptions with status `active` or `trial` AND `end_at > now()`
- Orders by `end_at DESC` (most recent first)
- `manage_url` is resolved based on provider:
  - Apple: `https://apps.apple.com/account/subscriptions`
  - Google Play: `https://play.google.com/store/account/subscriptions`
  - Whop/CopéCart: from `subscription.payload['manage_url']` or constructed from buyer/order IDs
- This endpoint does NOT use the same response envelope as other endpoints — it returns raw JSON without a `message` wrapper

---

## 4. Whop Checkout & Webhook Lifecycle

### 4.1 Purchase Flow Overview

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Next.js  │     │   Whop   │     │  Whop    │     │ Laravel  │
│ Client   │     │ Checkout │     │ Webhook  │     │ Backend  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. Select plan │                │                │
     │ 2. Redirect to │                │                │
     │    Whop URL    │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │ 3. User pays   │                │
     │                │                │                │
     │                │                │ 4. Webhook     │
     │                │                │ payment.       │
     │                │                │ succeeded      │
     │                │                │───────────────>│
     │                │                │                │
     │                │                │                │ 5. Create/update
     │                │                │                │    subscription
     │                │                │                │
     │                │                │ 6. 200 OK      │
     │                │                │<───────────────│
     │                │                │                │
     │ 7. Redirect    │                │                │
     │    callback    │                │                │
     │<───────────────│                │                │
     │                │                │                │
     │ 8. Poll GET /api/subscription/status             │
     │─────────────────────────────────────────────────>│
     │                │                │                │
     │ 9. { "subscribed": true }                        │
     │<─────────────────────────────────────────────────│
```

> **Recommended for Next.js**: Use the **Whop Embedded Checkout** instead of the redirect flow above. The embedded checkout renders the payment form in-page, eliminating the need for `GET /whop/handle-redirect` entirely. See [Section 9 — Whop Embedded Checkout Integration](#9-whop-embedded-checkout-integration) for full details.

**Two parallel paths** after Whop payment:
1. **Webhook** (server-to-server): Whop sends `payment.succeeded` to Laravel, which creates/updates the subscription immediately
2. **Redirect** (user-facing): Whop redirects the user back to the callback URL

The webhook typically arrives before or around the same time as the redirect, so by the time the user lands on the callback page, their subscription should already be active.

### 4.2 Plan URLs

Each plan in the `plans` table has a `whop_plan_url` column. The Next.js pricing page should fetch available plans via `GET /api/plans/list` (public, no auth) or `GET /api/plans/by-country` (public, accepts `country_code` query param) and redirect the user to the appropriate `whop_plan_url` for checkout.

### 4.3 Webhook Endpoint

**Endpoint**: `POST /webhook/whop`
**Controller**: `App\Http\Controllers\WhopWebhookController`
**Auth**: None (uses signature verification instead)
**CSRF**: Excluded (`withoutMiddleware(['web'])`)
**Route file**: `routes/webhook.php`

### 4.4 Webhook Signature Verification

**Header**: `webhook-secret`
**Compared against**: `WHOP_WEBHOOK_SECRET` environment variable

```php
$signatureHeader = $request->header('webhook-secret');
$secret = config('services.whop.webhook_secret');

if (!$signatureHeader || $signatureHeader != $secret) {
    return response()->json(['message' => 'Invalid signature.'], 401);
}
```

**Security note**: The comparison uses `!=` (loose comparison) instead of `hash_equals()` (timing-safe comparison). This is a known gap documented for awareness.

### 4.5 Webhook Events

The webhook controller handles these events (from `$data['action']`):

| Event | Handler | Action |
|-------|---------|--------|
| `payment.succeeded` | `WhopWebhookController` → `Whop::handlePaymentSuccess()` + `Whop::syncSubscription()` | Create/update subscription, track FirstPromoter (120s delay), track Klaviyo |
| `membership.went_valid` | `WhopWebhookController` → `Whop::syncSubscription()` | Sync subscription status (active/trial) |
| `membership.went_invalid` | `WhopWebhookController` → `Whop::syncSubscription()` | Sync subscription status (canceled/expired) |
| *(other events)* | Logged but not processed | No action |

**All webhook events return `200 OK`** to Whop regardless of internal processing success/failure (to prevent Whop from retrying).

### 4.6 `payment.succeeded` — Detailed Flow

When `payment.succeeded` is received (`WhopWebhookController:75-111`):

1. **Extract payload data**:
   - `user_id` = `payload.user.id` (Whop user ID)
   - `user_email` = `payload.user.email`
   - `membership_id` = `payload.id`
   - `plan_id` = `payload.plan.id` (Whop plan ID)
   - `amount` = `payload.total`
   - `membership` = `payload.membership`

2. **`handlePaymentSuccess()`** (`Whop.php:189-365`):
   a. Find existing user by `whop_id` in database
   b. If no user found, fetch membership details from Whop API
   c. Find or create user by email via `createOrUpdateUser()`:
      - **Account takeover protection**: If email exists AND `last_login IS NOT NULL`, abort (don't overwrite active account)
      - If email exists with `last_login = NULL`, update with `whop_id`
      - If email doesn't exist, create new user with random password
      - Send welcome/password-reset email to new users
   d. Create/update subscription in `subscriptions` table
   e. **FirstPromoter tracking**: Dispatch `TrackFirstPromoterSale` job with 120-second delay
      - Amount adjusted: `amount × 0.93` (subtracts Whop's 7% fee)
      - Only for plans with `currency` defined

3. **`syncSubscription()`** (`Whop.php:149-187`):
   a. Fetch membership from Whop API
   b. Call `syncLocalSubscription()` to create/update the `Subscription` record

4. **`syncLocalSubscription()`** (`Whop.php:367-465`):
   - Maps Whop status to local enum:

     | Whop Status | Local Enum |
     |-------------|------------|
     | `trialing` | `trial` |
     | `active` | `active` |
     | `past_due` | `past_due` |
     | `completed` | `completed` |
     | `canceled` | `canceled` |
     | `expired` | `expired` |
     | `unresolved` | `unresolved` |

   - Determines `start_at`: `membership.created_at` or `membership.renewal_period_start` (Unix timestamps)
   - Determines `end_at`: `membership.expires_at` or `membership.renewal_period_end` (Unix timestamps)
   - Stores full membership payload in `subscription.payload` JSON column
   - Creates or updates subscription matched by `provider = 'whop'` AND `whop_id = membership.id`

### 4.7 Instant Sync Strategy

After a Whop payment:

1. The webhook creates/updates the subscription in the database immediately
2. The `Subscription::boot()` saved hook invalidates `user_subscribed:{user_id}` cache
3. The next `GET /api/me` or `GET /api/subscription/status` call reflects the new state
4. Cache TTL is 5 minutes, but since cache is invalidated on save, the response should be immediate

**Frontend strategy after redirect:**
- Poll `GET /api/subscription/status` every 2-3 seconds for up to 30 seconds
- If `subscribed: true`, redirect to content
- If still `false` after timeout, show "Payment processing" message with retry option

### 4.8 User Redirect After Payment

**Web redirect endpoint**: `GET /whop/handle-redirect`
**Controller**: `App\Http\Controllers\Auth\RegisteredUserController@whop_handle_redirect`

This is a **web route** (session-based, Inertia) used by the current Laravel frontend. For the Next.js frontend, the redirect URL should point to a Next.js page instead. The webhook will have already created the subscription by the time the user arrives.

**Three cases handled in the redirect:**

| Case | Condition | Action |
|------|-----------|--------|
| New user (no `last_login`) | User doesn't exist or `last_login IS NULL` | Create user, sync subscriptions, auto-login, redirect to profile completion |
| Existing user (logged in) | User exists, is authenticated | Redirect to home |
| Existing user (not logged in) | User exists, NOT authenticated | Block auto-login, redirect to login with error |

---

## 5. Technical & Security Standards

### 5.1 Response Envelope Format

All API endpoints using `ResponseMethodsTrait` return responses in this format:

**Success** (`sendResponse()`):
```json
{
  "message": "Optional success message",
  ...spread_response_data
}
```

**Error** (`sendError()`):
```json
{
  "message": "Error description",
  ...spread_error_data
}
```

Data is **spread at the root level**, NOT nested under a `data` key. For example, the login response has `user`, `subscribed`, and `token` as top-level fields alongside `message`.

**Exception**: `GetSubscriptionInfo` returns raw `response()->json()` without the trait, so its format is just the direct JSON object without a `message` field. Validation errors (422) use Laravel's standard format with `message` + `errors` object.

### 5.2 Rate Limiting Summary

| Endpoint | Limit | Key | Source |
|----------|-------|-----|--------|
| `POST /api/auth/firebase-login` | 10/min | IP | `throttle:10,1` middleware |
| `POST /api/login` | **None** | — | No throttle middleware on API route |
| `POST /api/register` | **None** | — | — |
| Web login (`POST /login`) | 5/min | email + IP | `LoginRequest::ensureIsNotRateLimited()` |
| `POST /api/redeem-codes/validate` | 10/min | IP | `throttle:10,1` middleware |
| `POST /api/redeem-codes/apply` | 10/min | IP | `throttle:10,1` middleware |
| `POST /api/tv/session` | 5/min | IP | `throttle:5,1` middleware |
| `POST /webhook/whop` | **None** | — | No rate limiting |

### 5.3 Cookie Attributes for `tabootv_token`

The proxy must set the cookie with these attributes:

| Attribute | Value | Reason |
|-----------|-------|--------|
| `HttpOnly` | `true` | Prevents JavaScript access (XSS protection) |
| `Secure` | `true` | HTTPS only (prevents transmission over HTTP) |
| `SameSite` | `Lax` | Prevents CSRF on cross-site POST requests while allowing top-level navigations |
| `Path` | `/` | Cookie available on all paths |
| `Max-Age` | Match Sanctum token lifetime | By default Sanctum tokens don't expire, so use session duration or a reasonable value (e.g., 30 days) |
| `Domain` | Production domain | Scope cookie to the correct domain |

### 5.4 Token Validation Flow (Every Request)

```
1. Browser sends request to Next.js proxy
   Cookie: tabootv_token=1|abc123...

2. proxy.ts reads cookie, attaches header:
   Authorization: Bearer 1|abc123...

3. Forward to Laravel API

4. Laravel validates via auth:sanctum middleware:
   - Looks up token hash in personal_access_tokens table
   - If valid: proceeds with request
   - If invalid: returns 401 { "message": "Unauthenticated." }

5. On 401 from Laravel:
   - Proxy clears tabootv_token cookie (Max-Age: 0)
   - Returns 401 to browser
   - Client redirects to login page
```

### 5.5 Sanctum Token Details

| Property | Value |
|----------|-------|
| Token name | `"General Token"` |
| Format | `{id}\|{40-char-random-string}` |
| Storage | SHA-256 hash in `personal_access_tokens` table |
| Expiration | None by default (configurable via `sanctum.expiration` config) |
| Revocation | On logout, only the current token is deleted |
| Multiple tokens | A user can have multiple active tokens (one per device/session) |

### 5.6 Security Considerations

#### Implemented Protections

- **Account takeover prevention**: Whop webhook `createOrUpdateUser()` checks `last_login` before updating existing accounts
- **Firebase token verification**: Server-side verification via Firebase Admin SDK (not just client-side)
- **Email normalization**: Lowercase before storage and lookup prevents duplicate accounts
- **Subscription cache invalidation**: Ensures stale subscription status doesn't persist after payment events

#### Known Gaps (Document for Awareness)

| Gap | Location | Risk |
|-----|----------|------|
| No rate limit on API login | `POST /api/login` | Brute force |
| No rate limit on API register | `POST /api/register` | Mass account creation |
| Webhook signature uses `!=` not `hash_equals()` | `WhopWebhookController:30` | Timing attack (low practical risk) |
| No rate limit on webhook | `POST /webhook/whop` | Replay attacks |

---

## 6. Plan Cancellation Flow

### 6.1 Architecture Decision: No In-App Cancel Endpoint

There is **no** `POST /api/subscription/cancel` or similar endpoint. Cancellation is entirely **provider-driven**: the user cancels on the payment provider's platform, and the backend learns about it via webhooks.

This is by design — each provider (Whop, Apple, Google Play) has its own cancellation UI, refund policies, and billing cycle logic. The backend delegates cancellation to the provider and reacts to status changes via webhooks.

### 6.2 User Journey

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Next.js  │     │ Provider │     │ Provider │     │ Laravel  │
│ Client   │     │ Portal   │     │ Webhook  │     │ Backend  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. User taps   │                │                │
     │    "Manage      │                │                │
     │     Subscription"               │                │
     │                │                │                │
     │ 2. GET /api/subscription        │                │
     │─────────────────────────────────────────────────>│
     │                │                │                │
     │ 3. { manage_url: "https://..." }                 │
     │<─────────────────────────────────────────────────│
     │                │                │                │
     │ 4. Redirect to │                │                │
     │    manage_url  │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │ 5. User cancels│                │
     │                │    subscription│                │
     │                │                │                │
     │                │                │ 6. Webhook     │
     │                │                │    (e.g.       │
     │                │                │    membership. │
     │                │                │    went_invalid)│
     │                │                │───────────────>│
     │                │                │                │
     │                │                │                │ 7. Update status
     │                │                │                │    to 'canceled'
     │                │                │                │    + invalidate
     │                │                │                │    cache
     │                │                │                │
     │ 8. Next API request returns 403                  │
     │    "You need to subscribe to access this resource."
     │<─────────────────────────────────────────────────│
```

### 6.3 How to Get the Manage URL

**Endpoint**: `GET /api/subscription` (already documented in Section 3.8)

The `manage_url` field in the response provides the provider-specific URL where the user can manage or cancel their subscription.

**Resolution logic** (`GetSubscriptionInfo::getManageUrl()` in `app/Actions/Subscription/GetSubscriptionInfo.php:44-59`):

| Provider | URL Source | Example |
|----------|-----------|---------|
| Apple | Hardcoded | `https://apps.apple.com/account/subscriptions` |
| Google Play | Hardcoded | `https://play.google.com/store/account/subscriptions` |
| Whop | `subscription.payload['manage_url']` via `User::manageSubscriptionUrl()` | `https://whop.com/manage/...` |
| CopéCart | Constructed from `payload['buyer_id']` and `payload['order_id']` | `https://copecart.com/us/orders/{order_id}/buyer_overview?buyer_id={buyer_id}&locale=en_us/` |

**Important**: The `GET /api/subscription` endpoint only returns data for subscriptions with status `active` or `trial` AND `end_at > now()`. If the subscription is already canceled, this endpoint returns all `null` fields and `manage_url` will be `null`.

### 6.4 Whop Cancellation Webhook Flow

When a user cancels via Whop's portal:

1. **Whop sends** `membership.went_invalid` webhook to `POST /webhook/whop`
2. **`WhopWebhookController`** (line 48-73) extracts `membership_id`, `user_id`, `plan_id` from payload
3. **`Whop::syncSubscription()`** (line 149-187) fetches the latest membership data from Whop API
4. **`Whop::syncLocalSubscription()`** (line 367-465) maps the Whop status to local enum:
   - Whop `canceled` → `SubscriptionStatusEnum::canceled`
5. **`Subscription::update()`** triggers the `saved` boot hook, which invalidates:
   - `user_badge:{user_id}` cache
   - `user_subscribed:{user_id}` cache
6. **Next request** to `User::subscribed()` re-queries the database and returns `false`

### 6.5 Access Revocation Behavior

**The `scopeActive` query** (`Subscription.php:45-53`):

```php
public function scopeActive(Builder $query): void
{
    $query->whereNull('end_at')->orWhereDate('end_at', '>', now())->where(function ($q){
        $q->where('status', SubscriptionStatusEnum::active)
            ->orWhere('status', SubscriptionStatusEnum::completed)
            ->orWhere('status', SubscriptionStatusEnum::trial)
            ->orWhere('status', SubscriptionStatusEnum::course_bonus);
    });
}
```

**Active statuses**: `active`, `completed`, `trial`, `course_bonus`

**`canceled` is NOT in the active status list.** This means: once a webhook sets the status to `canceled`, the user loses access **immediately** — even if `end_at` is still in the future.

Effective SQL:

```sql
WHERE (end_at IS NULL)
   OR (end_at > NOW() AND status IN ('active', 'completed', 'trial', 'course_bonus'))
```

### 6.6 Database State Transition

```
┌────────┐    webhook sets     ┌───────────┐
│ active │ ──────────────────> │ canceled  │
└────────┘   status directly   └───────────┘
```

There is **no intermediate state**. The `SubscriptionStatusEnum` does not include a `pending_cancellation` value. The transition is:

- `active` → `canceled` (direct, single-step)
- `trial` → `canceled` (direct, triggers trial-not-converted tracking in `syncLocalSubscription`)

The full enum values are:

| Active Statuses | Inactive Statuses |
|----------------|-------------------|
| `active` | `canceled` |
| `completed` | `expired` |
| `trial` | `trial expired` |
| `course_bonus` | `chargeback` |
| | `refund` |
| | `payment failed` |
| | `past_due` |
| | `paused` |
| | `grace_period` |
| | `unresolved` |

### 6.7 Cross-Provider Cancellation Comparison

| Aspect | Whop | Apple | Google Play |
|--------|------|-------|-------------|
| **Cancel location** | Whop portal (`manage_url` from payload) | Apple subscription settings | Google Play subscription settings |
| **Webhook event** | `membership.went_invalid` | `DID_CHANGE_RENEWAL_STATUS` (**commented out** — not processed) | `SUBSCRIPTION_CANCELED` RTDN |
| **Handler** | `WhopWebhookController` → `Whop::syncSubscription()` | Not active (line 61 in `AppleWebhookController.php`) | `HandleGooglePlayCancelledJob` |
| **Status set to** | `canceled` (mapped from Whop status) | N/A (event not handled) | `canceled` |
| **Access after cancel** | Revoked immediately (see Section 6.5) | Relies on `EXPIRED` event instead | Revoked immediately (despite code comment saying "remains active until end of billing period") |
| **`end_at` preserved?** | Updated from Whop membership data | N/A | Yes — existing `end_at` is kept |

### 6.8 Frontend Implementation Guide

#### Displaying the "Manage Subscription" Button

1. Call `GET /api/subscription`
2. If `manage_url` is not `null`, show a "Manage Subscription" button/link
3. On click, open `manage_url` in a new browser tab (external provider portal)
4. If `manage_url` is `null` and `provider` is `null`, the user has no active subscription

#### Detecting Cancellation After It Happens

The frontend has no real-time notification of cancellation. Detection happens through:

1. **Protected endpoint returns 403**: When calling any subscription-gated endpoint (see Section 3.5 for the full list), a `403` response with `"You need to subscribe to access this resource."` indicates the subscription is no longer active
2. **Polling `GET /api/subscription/status`**: Returns `{ "subscribed": false }` after cancellation webhook is processed
3. **Polling `GET /api/me`**: The `subscribed` field in the response will be `false`

#### Recommended Frontend Flow After Cancel Detection

```
1. User returns from provider portal
2. Poll GET /api/subscription/status every 3-5 seconds (up to 30s)
3. If { subscribed: false }:
   a. Show "Your subscription has been canceled" message
   b. Redirect to pricing/renew page
   c. Clear any cached subscription state in the frontend
4. If still { subscribed: true } after timeout:
   a. Show "Cancellation may take a few minutes to process"
   b. The user will eventually hit a 403 on protected content
```

#### Handling 403 Globally

Reuse the same 403 handling described in Section 3.6:

```
If response is 403 + "You need to subscribe to access this resource.":
  → Redirect to pricing page (NOT login)
  → Do NOT clear the auth token (user is still authenticated)
```

### 6.9 Known Gaps

#### Gap 1: Immediate Access Revocation on Cancellation (All Providers)

**Issue**: The `scopeActive` query excludes `canceled` from the list of active statuses. This means a user who cancels mid-cycle loses access **immediately** when the webhook arrives, even if `end_at` is still in the future.

**Industry standard**: Users should retain access until the end of their paid billing period. Cancellation should prevent renewal, not revoke existing access.

**Evidence**: The Google Play handler (`HandleGooglePlayCancelledJob.php:36-41`) explicitly comments "subscription remains active until end of billing period" and preserves `end_at`, but the `scopeActive` scope ignores this because `canceled` is not in the active status list.

**Recommended fix** (for backend team):

Option A — Add `canceled` to `scopeActive` with `end_at` guard:
```php
$q->where('status', SubscriptionStatusEnum::active)
    ->orWhere('status', SubscriptionStatusEnum::completed)
    ->orWhere('status', SubscriptionStatusEnum::trial)
    ->orWhere('status', SubscriptionStatusEnum::course_bonus)
    ->orWhere(function ($q) {
        $q->where('status', SubscriptionStatusEnum::canceled)
          ->where('end_at', '>', now());
    });
```

Option B — Introduce a `pending_cancellation` status that is included in active statuses, and only transition to `canceled` when `end_at` passes.

#### Gap 2: Apple `DID_CHANGE_RENEWAL_STATUS` Not Processed

**Issue**: In `AppleWebhookController.php` (line 61), the `DID_CHANGE_RENEWAL_STATUS` event handler is commented out:

```php
//  'DID_CHANGE_RENEWAL_STATUS' => new DidChangeRenewalStatusJob($payload),
```

This is the Apple event that fires when a user cancels auto-renewal. Without it, the backend does not learn about Apple cancellations until the `EXPIRED` event fires at the end of the billing cycle.

**Impact**: Apple users who cancel will continue to have access until their subscription naturally expires (unlike Whop/Google Play users who lose access immediately). While this is actually closer to the industry-standard behavior, it creates an inconsistency across providers.

#### Gap 3: No `manage_url` After Cancellation

**Issue**: `GET /api/subscription` only queries subscriptions with status `active` or `trial`. Once a subscription is canceled, this endpoint returns all `null` fields. The user cannot access the `manage_url` to re-subscribe or check their cancellation status on the provider portal.

**Frontend workaround**: Cache the `manage_url` in the frontend when the subscription is still active, so it can be displayed even after cancellation is detected. Alternatively, use the hardcoded provider URLs:
- Apple: `https://apps.apple.com/account/subscriptions`
- Google Play: `https://play.google.com/store/account/subscriptions`
- Whop: The `manage_url` must be cached before cancellation since it's unique per membership

---

## 7. New User Onboarding & Profile Completion

### 7.1 Complete Onboarding Sequence

After a new user authenticates (Firebase social login or email registration), they must complete their profile before accessing content. The full sequence is:

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Next.js  │     │ Firebase │     │ Laravel  │     │   Whop   │
│ Client   │     │  Auth    │     │ Backend  │     │ Checkout │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. Social sign-in              │                │
     │───────────────>│                │                │
     │                │                │                │
     │ 2. Firebase ID Token           │                │
     │<───────────────│                │                │
     │                │                │                │
     │ 3. POST /api/auth/firebase-login               │
     │─────────────────────────────────>│                │
     │                │                │                │
     │ 4. { requires_username: true,   │                │
     │      profile_completed: false } │                │
     │<─────────────────────────────────│                │
     │                │                │                │
     │ 5. Show username / profile form │                │
     │    (check handler availability) │                │
     │                │                │                │
     │ 6. GET /api/handler/check/{handler} (public)    │
     │─────────────────────────────────>│                │
     │ { available: true }             │                │
     │<─────────────────────────────────│                │
     │                │                │                │
     │ 7. GET /api/countries (public)  │                │
     │─────────────────────────────────>│                │
     │ { data: [...] }                 │                │
     │<─────────────────────────────────│                │
     │                │                │                │
     │ 8. POST /api/profile/update-profile             │
     │    { first_name, last_name, ... }               │
     │─────────────────────────────────>│                │
     │                │                │                │
     │ 9. { user_data: { ... } }       │                │
     │<─────────────────────────────────│                │
     │                │                │                │
     │ 10. Check subscription status   │                │
     │     GET /api/subscription/status │                │
     │─────────────────────────────────>│                │
     │ { subscribed: false }           │                │
     │<─────────────────────────────────│                │
     │                │                │                │
     │ 11. Redirect to pricing page    │                │
     │     → Whop checkout             │                │
     │────────────────────────────────────────────────>│
     │                │                │                │
     │ 12. Payment completes → webhook │                │
     │     (see Section 4)             │                │
     │                │                │                │
     │ 13. Content access granted      │                │
```

### 7.2 `POST /api/profile/update-profile`

**Action**: `App\Actions\Profile\UpdateProfile`
**Auth Required**: Yes (`auth:sanctum`)
**Subscription Required**: No (outside subscription middleware)

Updates the authenticated user's profile fields. Used during onboarding and for subsequent profile edits.

#### Request

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "display_name": "johndoe",
  "handler": "johndoe",
  "gender": "male",
  "country_id": 1,
  "phone_number": "+1234567890",
  "paypal_link": "https://paypal.me/johndoe"
}
```

#### Validation Rules

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `first_name` | string | Yes | `max:255` | |
| `last_name` | string | Yes | `max:255` | |
| `display_name` | string | Yes | `max:20` | |
| `handler` | string | No | `min:4`, `max:20`, `regex:/^[a-zA-Z0-9_]+$/`, `unique:users,handler` | Stored lowercase. See [handler change rules](#handler-change-rules) |
| `gender` | string | Yes | `male` or `female` | Enum: `App\Enums\GenderEnum` |
| `country_id` | integer | Yes | Must exist in `countries` table | Use `GET /api/countries` to get valid IDs |
| `phone_number` | string | No | International phone format (`phone:INTERNATIONAL`) | Validated by `propaganistas/laravel-phone` |
| `paypal_link` | string | No | Valid URL, `max:500` | Saved to the user's channel (creators only) |

#### Handler Change Rules

Handler (username) changes have a **limited allowance**:

1. **First-time set**: When `handler` is currently `null`, setting it for the first time is **free** — does not consume a change
2. **Subsequent changes**: Each change after the first decrements `handler_changes_remaining` (default: 1 for new users)
3. **No changes remaining**: If `handler_changes_remaining <= 0`, attempting to change the handler returns a 422 error
4. **Case change**: Changing to the same handler with different casing (e.g., `JohnDoe` → `johndoe`) is treated as a change because handlers are stored lowercase

#### Response (Success — 200)

```json
{
  "message": "",
  "user_data": {
    "id": 1,
    "uuid": "a1b2c3d4-...",
    "first_name": "John",
    "last_name": "Doe",
    "display_name": "johndoe",
    "handler": "@johndoe",
    "email": "user@example.com",
    "gender": "male",
    "phone_number": "+1234567890",
    "profile_completed": false,
    "video_autoplay": true,
    "handler_changes_remaining": 1,
    "country_id": 1,
    "provider": null,
    "badge": "",
    "is_creator": false,
    "has_courses": false,
    "channel": null,
    "dp": "/images/placeholder-dp.jpg",
    "medium_dp": "/images/placeholder-dp.jpg",
    "small_dp": "/images/placeholder-dp.jpg"
  }
}
```

The response wraps the user in `user_data` (a `UserResource`), NOT the `user` key used in login responses.

#### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Not authenticated | `{ "message": "Unauthenticated." }` |
| 422 | Validation failure | `{ "message": "...", "errors": { "field": ["..."] } }` |
| 422 | Handler already taken | `{ "message": "...", "errors": { "handler": ["This handler is already taken."] } }` |
| 422 | Handler too short | `{ "message": "...", "errors": { "handler": ["The handler must be at least 4 characters."] } }` |
| 422 | Handler invalid characters | `{ "message": "...", "errors": { "handler": ["The handler may only contain letters, numbers and underscores."] } }` |
| 422 | No handler changes remaining | `{ "message": "...", "errors": { "handler": ["You have no remaining handler changes."] } }` |
| 422 | Invalid country | `{ "message": "...", "errors": { "country_id": ["The selected country id is invalid."] } }` |

---

### 7.3 `GET /api/handler/check/{handler}`

**Controller**: `App\Http\Controllers\UserController@checkHandlerAvailability`
**Auth Required**: No (public endpoint)
**Rate Limit**: None

Checks if a handler (username) is available. Useful for real-time validation during the onboarding form.

#### Request

Path parameter: `{handler}` — the handler to check (e.g., `/api/handler/check/johndoe`)

#### Response (200)

```json
{
  "available": true,
  "handler": "johndoe"
}
```

Or if taken:

```json
{
  "available": false,
  "handler": "johndoe"
}
```

#### Implementation Notes

- Performs a case-insensitive lookup: `WHERE LOWER(handler) = LOWER(input)`
- Returns raw JSON (no `message` wrapper — does not use `ResponseMethodsTrait`)
- No auth required — can be called before login or during onboarding

---

### 7.4 `GET /api/countries`

**Action**: `App\Actions\Country\ListCountries`
**Auth Required**: No (public endpoint)
**Also available at**: `GET /api/public/countries` (identical)

Returns the list of countries for the profile form's `country_id` field.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `simple_list` | boolean | `false` | If `true`, returns just country names as a string array |
| `types` | string | `"videos"` | Comma-separated content types to filter countries by: `videos`, `series`, `courses`, `shorts` |

**Note**: This endpoint only returns countries that have at least one published video of the specified type(s). This is primarily designed for content filtering, not profile forms. For onboarding, use the default parameters.

#### Response (200) — Default

```json
{
  "message": "",
  "data": [
    {
      "id": 1,
      "name": "Germany",
      "iso": "DE",
      "emoji": "🇩🇪",
      "videos_count": 42
    },
    {
      "id": 2,
      "name": "United States",
      "iso": "US",
      "emoji": "🇺🇸",
      "videos_count": 156
    }
  ]
}
```

#### Response (200) — `simple_list=true`

```json
{
  "message": "",
  "data": ["Germany", "United States"]
}
```

---

### 7.5 Middleware Gating Summary for API Routes

Understanding which middleware applies to API routes is critical for the frontend onboarding flow:

```
Public (no auth):
  POST /api/auth/firebase-login
  POST /api/login
  POST /api/register
  GET  /api/handler/check/{handler}
  GET  /api/countries
  GET  /api/plans/list
  GET  /api/plans/by-country

auth:sanctum only (NO profile check, NO subscription check):
  GET  /api/me
  GET  /api/subscription/status
  GET  /api/subscription
  POST /api/profile/update-profile   ← profile routes
  POST /api/profile/update-dp
  POST /api/profile/update-email
  POST /api/profile/update-password
  DELETE /api/profile/delete

auth:sanctum + EnsureSubscriptionMiddleware:
  /api/home/*
  /api/videos/*
  /api/series/*
  /api/courses/*
  /api/posts/*
  /api/shorts/*
  /api/live-chat/*
  /api/search
  /api/notifications/*
  /api/creators/*
  /api/watchlist/*
  /api/clips/*
```

**Key insight for the Next.js frontend**: The API does **NOT** check `profile_completed` or `handler` presence on any API route. The `EnsureProfileCompleteMiddleware` is only applied to **web (Inertia) routes**. This means:

- API consumers can call `POST /api/profile/update-profile` and content endpoints regardless of profile completion status
- The frontend must enforce the onboarding flow in its own UI layer (i.e., check `profile_completed` and `display_name` from `GET /api/me` and gate navigation accordingly)
- A user with `profile_completed: false` who has a subscription could technically access content via the API

### 7.6 `requires_username` and `profile_completed` Flags

These two flags drive the frontend onboarding experience:

#### `requires_username`

| Property | Value |
|----------|-------|
| **Where it appears** | Firebase login response only (`POST /api/auth/firebase-login`) |
| **Type** | boolean |
| **Logic** | `true` when `user.display_name IS NULL` |
| **Purpose** | Signal to show a username/display-name selection step immediately after social login |
| **NOT returned by** | `GET /api/me`, `POST /api/login`, `POST /api/register` |

For non-Firebase login flows (email/password), check `user.display_name === null` in the response to determine if username selection is needed.

#### `profile_completed`

| Property | Value |
|----------|-------|
| **Where it appears** | User object in all auth responses and `GET /api/me` |
| **Type** | boolean |
| **Default for new users** | `false` |
| **Set to `true` by** | `ProfileCompleteController::store()` (web-only) — **see Known Gap below** |
| **NOT set by** | `POST /api/profile/update-profile` |
| **Purpose** | Indicates whether the user has gone through the full profile setup flow |

#### Frontend Decision Tree

```
After login/registration:
  │
  ├─ display_name IS NULL (or requires_username === true)?
  │   └─ YES → Show username selection + full profile form
  │             → POST /api/profile/update-profile
  │
  ├─ profile_completed === false?
  │   └─ YES → Show profile completion form
  │             → POST /api/profile/update-profile
  │
  ├─ subscribed === false?
  │   └─ YES → Redirect to pricing page
  │             → Whop checkout (see Section 4)
  │
  └─ All checks pass → Allow content access
```

---

### 7.7 Known Gap: No API Endpoint Sets `profile_completed = true`

**This is a critical gap for the Next.js frontend.**

The `UpdateProfile` action (`app/Actions/Profile/UpdateProfile.php`) updates all profile fields (name, handler, gender, country, phone) but **never sets `profile_completed = true`**. The only code that sets this flag is in the web-only `ProfileCompleteController::store()` (`app/Http/Controllers/ProfileCompleteController.php:99`):

```php
// Only in ProfileCompleteController::store() (web route)
$updateData = [
    // ...profile fields...
    'profile_completed' => true,  // ← Only set here
];
```

This means:
1. A new user who completes onboarding via the API will have all profile fields filled in but `profile_completed` will remain `false`
2. `GET /api/me` will continue returning `profile_completed: false` even after a successful profile update
3. The frontend cannot rely on `profile_completed` to know if the user has actually completed the onboarding form

#### Recommended Backend Fix

Add `profile_completed = true` to the `UpdateProfile` action's `handle()` method when all required fields are present:

```php
// In UpdateProfile::handle(), after updating user fields:
if (!$user->profile_completed) {
    $user->update(['profile_completed' => true]);
}
```

This would allow the API flow to mirror the web flow.

#### Frontend Workaround (Until Fixed)

Instead of relying solely on `profile_completed`, check multiple signals:

```
User has completed onboarding if ALL of these are non-null:
  - display_name
  - first_name
  - last_name
  - gender
  - country_id
  - handler
```

This is effectively what the profile form validates — if all required fields have values, the user has completed the form regardless of the `profile_completed` flag.

---

## 8. API Endpoint Gap Registry

This section provides a master registry of all backend flows that currently lack API equivalents. Each gap is flagged with severity, source file references, the backend priority for adding the endpoint, and a Next.js workaround.

### 8.1 Gap Summary

| # | Gap | Severity | Web Route | API Equivalent | Cross-Reference |
|---|-----|----------|-----------|----------------|-----------------|
| 1 | Profile completion (`profile_completed = true`) | **CRITICAL** | `POST /profile/complete` | None | [Section 7.7](#77-known-gap-no-api-endpoint-sets-profile_completed--true) |
| 2 | Password setup for OAuth/Whop users | **CRITICAL** | `POST /profile/complete` (when `needs_password` session flag) | None | — |
| 3 | Whop OAuth redirect handler | **CRITICAL** | `GET /whop/handle-redirect` | None | [Section 4.8](#48-user-redirect-after-payment), [Section 9](#9-whop-embedded-checkout-integration) |
| 4 | Temp media upload (chunking) | **HIGH** | `POST /temp_media/upload`, `POST /temp_media/get-uuid`, `GET /temp_media/{uuid}/status` | None | — |
| 5 | Payment flow with embedded redeem code | **MEDIUM** | `POST /payment/apply-redeem-code` | Workaround: 2 separate API calls | — |

---

### 8.2 Gap 1: `profile_completed` Flag — `NO_API_ENDPOINT` CRITICAL

**What the web route does**:
`ProfileCompleteController::store()` (`app/Http/Controllers/ProfileCompleteController.php:34-115`) validates all profile fields and sets `profile_completed = true` in a single transaction. The API equivalent (`POST /api/profile/update-profile` via `UpdateProfile` action) updates all the same fields but **never sets the flag**.

**Backend priority**: **P0** — Without this, the Next.js frontend cannot distinguish between users who have completed onboarding and those who haven't. The `profile_completed` flag is the canonical signal consumed by `GET /api/me` and drives the entire onboarding gating logic.

**Recommended fix**: Add `'profile_completed' => true` to the `UpdateProfile::handle()` method when all required fields (first_name, last_name, display_name, handler, gender, country_id) are present. See [Section 7.7](#77-known-gap-no-api-endpoint-sets-profile_completed--true) for implementation details.

**Next.js workaround (until fixed)**:
Instead of relying solely on `profile_completed`, check multiple signals from `GET /api/me`:
```
User has completed onboarding if ALL of these are non-null:
  - display_name
  - first_name
  - last_name
  - gender
  - country_id
  - handler
```

---

### 8.3 Gap 2: Password Setup for OAuth/Whop Users — `NO_API_ENDPOINT` CRITICAL

**What the web route does**:
`ProfileCompleteController::store()` (`app/Http/Controllers/ProfileCompleteController.php:73-75, 103-105`) checks a session flag `needs_password` (set during the Whop OAuth redirect at `RegisteredUserController.php:211`). When `true`, it validates and hashes a `password` + `password_confirmation` pair and stores the hashed password on the user record. This lets OAuth users who were auto-created (with a random password) set their own password.

**Why this matters**: Users created through the Whop OAuth flow (`GET /whop/handle-redirect`) receive a random password and have `password = Hash::make(Str::random(10))`. Without an API endpoint to set a real password, these users cannot log in via email/password on the Next.js app.

**Backend priority**: **P0** — OAuth-created users are permanently locked out of email/password login without this. A new endpoint like `POST /api/auth/set-password` is needed, gated to users who either have no usable password or who are authenticated via a social provider.

**Next.js workaround (until fixed)**:
1. OAuth users must always authenticate via Firebase social login (Google/Apple) — they cannot use email/password login
2. If the user's `auth_provider` is set (indicating OAuth origin) and they attempt email/password login, show a message: "Please sign in with Google/Apple instead"
3. Alternatively, direct users to the existing `POST /api/forget-password` → `POST /api/reset-password` flow to set a password via OTP email

---

### 8.4 Gap 3: Whop OAuth Redirect Handler — `NO_API_ENDPOINT` CRITICAL

**What the web route does**:
`RegisteredUserController::whop_handle_redirect()` (`app/Http/Controllers/Auth/RegisteredUserController.php:137-239`) handles the full Whop OAuth callback:
1. Exchanges the `code` query parameter for an access token via `Whop::getAccessToken()`
2. Fetches the Whop user profile via `Whop::me()`
3. Creates or updates the local user account (with account takeover protection)
4. Syncs all Whop subscriptions via `Whop::syncSubscriptions()`
5. Tracks FirstPromoter leads
6. Auto-logs in the user and redirects to profile completion

**Why the embedded checkout eliminates this gap**: The Whop Embedded Checkout (Section 9) renders the payment form in-page. After payment, the `onComplete` callback fires client-side. The subscription is created server-side via the `payment.succeeded` webhook — the same webhook that already works for the current flow. No OAuth redirect is needed.

**Remaining concern**: Subscription sync after embedded checkout relies entirely on webhook timing. The webhook typically arrives within seconds, but there is no client-initiated sync. See [Section 9.8](#98-completion-handling--subscription-polling) for the polling strategy.

**Backend priority**: **P1** — Not needed if embedded checkout is adopted. However, if the redirect flow is kept as a fallback, an API equivalent would require a `POST /api/auth/whop-exchange` endpoint that accepts the OAuth `code` and returns a Sanctum token.

**Next.js workaround**: Use the Whop Embedded Checkout ([Section 9](#9-whop-embedded-checkout-integration)) instead of the redirect flow.

---

### 8.5 Gap 4: Temp Media Upload (Chunking) — `NO_API_ENDPOINT` HIGH

**What the web routes do**:
`TempMediaController` (`app/Http/Controllers/TempMediaController.php`) provides chunked video upload:
- `POST /temp_media/get-uuid` — Creates a `TempMedia` record and returns a UUID for the upload session
- `POST /temp_media/upload` — Uploads individual chunks, tracks progress, dispatches `MergeVideoChunksJob` when all chunks arrive
- `GET /temp_media/{uuid}/status` — Returns merge progress (`merge_status`, `is_completed`, `is_failed`, `is_processing`)
- `DELETE /temp_media/{tempMedia}` — Deletes a temp media record

These routes are in `routes/web.php` and use session-based auth. They are not available on API routes.

**Backend priority**: **P1** — Only needed if the Next.js app supports content creation/upload. If content creation remains on the Laravel frontend, this gap does not block the Next.js MVP.

**Next.js workaround**: Content creation (video uploads, posts) must be done through the existing Laravel web frontend until these endpoints are added to `routes/api.php` with Sanctum auth.

---

### 8.6 Gap 5: Payment Flow with Embedded Redeem Code — `NO_API_ENDPOINT` MEDIUM

**What the web route does**:
`PaymentController::applyRedeemCode()` (`app/Http/Controllers/PaymentController.php:69-96`) validates and applies a redeem code in a single form submission. It uses `ValidateRedeemCode::run()` then `ApplyRedeemCode::run()` and redirects with a success/error flash message.

**API alternative**: The API already has separate endpoints for this flow:
1. `POST /api/redeem-codes/validate` — Validates the code (rate limited: 10/min)
2. `POST /api/redeem-codes/apply` — Applies the code (rate limited: 10/min)

**Backend priority**: **P2** — Functional workaround exists via two separate API calls.

**Next.js workaround**:
```
1. User enters redeem code on pricing page
2. POST /api/redeem-codes/validate { "code": "FREEMONTH" }
   → If valid: show confirmation UI with code details
   → If invalid: show error message
3. User confirms → POST /api/redeem-codes/apply { "code": "FREEMONTH" }
   → If success: poll GET /api/subscription/status for { subscribed: true }
   → If error: show error message
```

---

## 9. Whop Embedded Checkout Integration

### 9.1 Why Embedded Checkout Replaces the Redirect Flow

The current Whop purchase flow (Section 4.1) redirects users to an external Whop checkout page. After payment, Whop redirects back to `GET /whop/handle-redirect` — a **web-only route** that handles OAuth token exchange, user creation, and session management. None of this is available via the API.

The **Whop Embedded Checkout** solves this by rendering the checkout form directly inside the Next.js page:
- No external redirect needed
- No OAuth token exchange needed
- The `payment.succeeded` webhook handles subscription creation (same as today)
- The `onComplete` callback provides immediate client-side feedback
- User authentication is handled separately (Firebase login or email/password)

### 9.2 Getting Plan Data

**Endpoint**: `GET /api/plans/list` (also available as `GET /api/plans/by-country`)
**Action**: `App\Actions\Plan\PlanList`
**Auth Required**: No (public endpoint)

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country_code` | string | No | ISO 2-letter country code (e.g., `US`, `DE`). Falls back to IP-based detection, then `US` |
| `country` | string | No | Alias for `country_code` |
| `email` | string | No | Passed through to `whop_plan_url` as query parameter for pre-filling checkout |
| `ref` | string | No | Affiliate/referral code — appended to `whop_plan_url` as query parameter |

#### Country Fallback Logic

1. Use `country_code` (or `country`) query parameter if provided
2. If not provided, detect from request IP via `CountryDetectionService`
3. Query plans for the detected country code
4. If no plans exist for that country, fall back to `US` plans
5. Lifetime plans (`name = 'lifetime'`) are always excluded

#### Response (200)

```json
{
  "message": "",
  "plans": [
    {
      "id": 1,
      "apple_id": "com.tabootv.monthly",
      "name": "monthly",
      "title": "Monthly Plan",
      "description": "Access all content for one month",
      "price": 9.99,
      "save_percentage": null,
      "features": ["Feature 1", "Feature 2"],
      "trial_days": 7,
      "checkout_url": "https://...",
      "country_code": "US",
      "currency": "USD",
      "whop_plan_id": "plan_XXXXXXXXX",
      "whop_plan_url": "https://whop.com/checkout/plan_XXXXXXXXX/"
    },
    {
      "id": 2,
      "apple_id": "com.tabootv.annual",
      "name": "annual",
      "title": "Annual Plan",
      "description": "Access all content for one year",
      "price": 79.99,
      "save_percentage": 33,
      "features": ["Feature 1", "Feature 2", "Save 33%"],
      "trial_days": 7,
      "checkout_url": "https://...",
      "country_code": "US",
      "currency": "USD",
      "whop_plan_id": "plan_YYYYYYYYY",
      "whop_plan_url": "https://whop.com/checkout/plan_YYYYYYYYY/"
    }
  ]
}
```

#### Plan Response Fields

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| `id` | integer | Database plan ID | `Plan.id` |
| `apple_id` | string\|null | Apple In-App Purchase product ID | `Plan.apple_id` |
| `name` | string | Plan name slug (e.g., `monthly`, `annual`) | `Plan.name` |
| `title` | string\|null | Display title | `Plan.title` |
| `description` | string\|null | Plan description text | `Plan.description` |
| `price` | float | Price in major currency units (cents / 100) | `Plan.price / 100` |
| `save_percentage` | integer\|null | Discount percentage vs monthly pricing | `Plan.save_percentage` |
| `features` | array\|null | List of feature strings (JSON column) | `Plan.features` |
| `trial_days` | integer\|null | Free trial duration in days | `Plan.trial_days` |
| `checkout_url` | string\|null | Generic checkout URL | `Plan.checkout_url` |
| `country_code` | string\|null | ISO 2-letter country code this plan is for | `Plan.country_code` |
| `currency` | string\|null | ISO currency code (e.g., `USD`, `EUR`) | `Plan.currency` |
| `whop_plan_id` | string\|null | Whop plan identifier (format: `plan_XXXXXXXXX`) — **use this for the embed** | `Plan.whop_plan_id` |
| `whop_plan_url` | string | Full Whop checkout URL — **use for redirect fallback**. `email` and `ref` query params auto-appended from request | `Plan.whop_plan_url` + query params via `PlanResource` |

> **Source**: `PlanResource` (`app/Http/Resources/PlanResource.php`) — the `whop_plan_url` field automatically appends `email` and `ref` query parameters from the request if provided.

### 9.3 React Integration (`@whop/checkout`)

#### Installation

```bash
npm install @whop/checkout
```

#### Basic Usage

```tsx
import { WhopCheckoutEmbed } from "@whop/checkout/react";

function CheckoutPage({ planId, userEmail, affiliateCode }) {
  return (
    <WhopCheckoutEmbed
      planId={planId}                    // "plan_XXXXXXXXX" from GET /api/plans/list
      theme="dark"                       // "light" | "dark" | "system"
      prefill={{ email: userEmail }}     // Pre-fill email for authenticated users
      affiliateCode={affiliateCode}      // FirstPromoter tracking
      skipRedirect={true}                // Stay on page after payment
      onComplete={(planId, receiptId) => {
        // Payment succeeded — start polling for subscription
        pollSubscriptionStatus();
      }}
      fallback={<LoadingSpinner />}      // Shown while embed loads
    />
  );
}
```

#### Key Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `planId` | string | Yes | Whop plan ID from `whop_plan_id` field (format: `plan_XXXXXXXXX`) |
| `theme` | `"light"` \| `"dark"` \| `"system"` | No | Visual theme. Default: system preference |
| `prefill` | `{ email?: string }` | No | Pre-populate the email field |
| `affiliateCode` | string | No | Affiliate/referral tracking code (FirstPromoter) |
| `skipRedirect` | boolean | No | If `true`, stay on page after payment instead of redirecting |
| `onComplete` | `(planId: string, receiptId: string) => void` | No | Callback fired on successful payment |
| `returnUrl` | string | No | URL to redirect to after payment (if `skipRedirect` is not set) |
| `sessionId` | string | No | Custom session ID for webhook metadata matching |
| `hidePrice` | boolean | No | Hide the price display |
| `hideEmail` | boolean | No | Hide the email input (use with `prefill.email`) |
| `disableEmail` | boolean | No | Show but disable the email input |
| `hideTermsOfService` | boolean | No | Hide terms of service text |
| `hideAddressForm` | boolean | No | Hide address collection form |
| `fallback` | ReactNode | No | Loading state content while embed initializes |

#### Programmatic Controls

```tsx
import { WhopCheckoutEmbed, useCheckoutEmbedControls } from "@whop/checkout/react";

function CheckoutPage({ planId }) {
  const controls = useCheckoutEmbedControls();

  return (
    <>
      <WhopCheckoutEmbed planId={planId} />
      <button onClick={() => controls.submit()}>Pay Now</button>
      <button onClick={() => controls.setEmail("user@example.com")}>
        Set Email
      </button>
    </>
  );
}
```

### 9.4 HTML/JS Fallback Integration

For non-React environments or SSR fallback:

```html
<!-- Load the Whop checkout script -->
<script async defer src="https://js.whop.com/static/checkout/loader.js"></script>

<!-- Checkout embed container -->
<div
  id="whop-checkout"
  data-whop-checkout-plan-id="plan_XXXXXXXXX"
  data-whop-checkout-theme="dark"
  data-whop-checkout-skip-redirect="true"
></div>

<script>
  // Wait for the Whop checkout object to be available
  document.addEventListener("whop:checkout:ready", function () {
    // Set email programmatically
    wco.setEmail("whop-checkout", "user@example.com");
  });

  // Listen for completion
  document.addEventListener("whop:checkout:complete", function (event) {
    const { planId, receiptId } = event.detail;
    // Start polling for subscription activation
    pollSubscriptionStatus();
  });
</script>
```

### 9.5 Pre-filling User Email

For authenticated users, pre-fill the email to streamline checkout:

**React**: Use the `prefill` prop:
```tsx
<WhopCheckoutEmbed
  planId={plan.whop_plan_id}
  prefill={{ email: user.email }}
  disableEmail={true}  // Prevent changing the email
/>
```

**Redirect fallback**: The `whop_plan_url` from `GET /api/plans/list` automatically appends the `email` query parameter if the request includes `?email=user@example.com`:
```
GET /api/plans/list?email=user@example.com
→ whop_plan_url: "https://whop.com/checkout/plan_XXX/?email=user%40example.com"
```

### 9.6 Affiliate Tracking

**React**: Pass the `affiliateCode` prop:
```tsx
<WhopCheckoutEmbed
  planId={plan.whop_plan_id}
  affiliateCode="partner123"
/>
```

**Redirect fallback**: The `whop_plan_url` automatically appends the `ref` query parameter if the request includes `?ref=partner123`:
```
GET /api/plans/list?ref=partner123
→ whop_plan_url: "https://whop.com/checkout/plan_XXX/?ref=partner123"
```

> **Note**: FirstPromoter tracking also happens server-side during the `payment.succeeded` webhook handler (`Whop::handlePaymentSuccess()`), which dispatches `TrackFirstPromoterSale` with a 120-second delay. The `affiliateCode` prop provides client-side attribution to Whop; the webhook handles FirstPromoter attribution independently.

### 9.7 Return URL Status Handling

When using `returnUrl` instead of `onComplete`, the user is redirected after payment. Check the `status` query parameter:

| `?status=` | Meaning | Action |
|------------|---------|--------|
| `success` | Payment completed | Start polling `GET /api/subscription/status` |
| `error` | Payment failed or canceled | Show retry UI, re-render the checkout embed |

### 9.8 Completion Handling & Subscription Polling

After the `onComplete` callback fires (or the user returns with `?status=success`), the subscription may not be immediately active because it depends on the `payment.succeeded` webhook being processed.

**Recommended polling strategy**:

```
1. onComplete(planId, receiptId) fires
2. Show "Activating your subscription..." loading state
3. Poll GET /api/subscription/status every 2 seconds
4. Timeout after 30 seconds

If { subscribed: true }:
  → Show success message
  → Redirect to content / home page

If still { subscribed: false } after 30s:
  → Show "Payment received! Your subscription is being activated."
  → Show "This usually takes less than a minute."
  → Provide a "Check Again" button that retries the poll
  → The user can also navigate away — the webhook will activate
    the subscription in the background
```

**Why polling is necessary**: The `payment.succeeded` webhook is server-to-server between Whop and Laravel. The `onComplete` callback only confirms that Whop received the payment — the Laravel database may not be updated yet. The webhook typically arrives within 1-5 seconds.

### 9.9 Sequence Diagram — Embedded Checkout Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Next.js  │     │   Whop   │     │  Whop    │     │ Laravel  │
│ Client   │     │  Embed   │     │ Webhook  │     │ Backend  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. GET /api/plans/list (or /by-country)          │
     │─────────────────────────────────────────────────>│
     │                │                │                │
     │ 2. { plans: [{ whop_plan_id: "plan_XXX", ... }] }│
     │<─────────────────────────────────────────────────│
     │                │                │                │
     │ 3. Render <WhopCheckoutEmbed                     │
     │      planId="plan_XXX"                           │
     │      prefill={{ email }}                         │
     │      onComplete={handler} />                     │
     │───────────────>│                │                │
     │                │                │                │
     │ 4. User fills  │                │                │
     │    payment info│                │                │
     │    and submits │                │                │
     │                │                │                │
     │                │ 5. Whop processes payment       │
     │                │                │                │
     │                │                │ 6. payment.    │
     │                │                │    succeeded   │
     │                │                │    webhook     │
     │                │                │───────────────>│
     │                │                │                │
     │                │                │                │ 7. Create/update
     │                │                │                │    subscription
     │                │                │                │    (syncLocal-
     │                │                │                │    Subscription)
     │                │                │                │
     │ 8. onComplete  │                │                │
     │    (planId,    │                │                │
     │     receiptId) │                │                │
     │<───────────────│                │                │
     │                │                │                │
     │ 9. Poll GET /api/subscription/status             │
     │─────────────────────────────────────────────────>│
     │                │                │                │
     │ 10. { subscribed: true }                         │
     │<─────────────────────────────────────────────────│
     │                │                │                │
     │ 11. Redirect to content                          │
```

### 9.10 Full Next.js Implementation Example

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";

interface Plan {
  id: number;
  name: string;
  title: string;
  description: string;
  price: number;
  features: string[];
  trial_days: number;
  whop_plan_id: string;
  whop_plan_url: string;
  country_code: string;
  currency: string;
  save_percentage: number | null;
}

export default function PricingPage({ user }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  // Fetch plans on mount
  useEffect(() => {
    fetch("/api/plans/list")
      .then((res) => res.json())
      .then((data) => setPlans(data.plans));
  }, []);

  // Poll subscription status after payment
  const pollSubscriptionStatus = useCallback(async () => {
    setIsActivating(true);
    const maxAttempts = 15; // 30 seconds at 2s intervals

    for (let i = 0; i < maxAttempts; i++) {
      const res = await fetch("/api/subscription/status");
      const data = await res.json();

      if (data.subscribed) {
        // Subscription active — redirect to content
        window.location.href = "/home";
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Timeout — show manual retry
    setIsActivating(false);
  }, []);

  if (selectedPlan) {
    return (
      <div>
        {isActivating ? (
          <p>Activating your subscription...</p>
        ) : (
          <WhopCheckoutEmbed
            planId={selectedPlan.whop_plan_id}
            theme="dark"
            prefill={{ email: user?.email }}
            disableEmail={!!user?.email}
            skipRedirect={true}
            onComplete={(planId, receiptId) => {
              pollSubscriptionStatus();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      {plans.map((plan) => (
        <div key={plan.id} onClick={() => setSelectedPlan(plan)}>
          <h3>{plan.title}</h3>
          <p>
            {plan.currency} {plan.price}/{plan.name}
          </p>
          {plan.trial_days > 0 && (
            <p>{plan.trial_days}-day free trial</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 10. Subscription Management from Next.js

### 10.1 Viewing Subscription Status

Use the endpoints documented in [Section 3.7](#37-subscription-status-endpoint) and [Section 3.8](#38-subscription-info-endpoint):

| Endpoint | Purpose | Response Shape |
|----------|---------|----------------|
| `GET /api/subscription/status` | Quick boolean check | `{ "message": "", "subscribed": true }` |
| `GET /api/subscription` | Full subscription details | `{ "provider", "status", "start_at", "end_at", "manage_url" }` |
| `GET /api/me` | User profile + subscription flag | `{ "user": { ... }, "subscribed": true }` |

**When to use which**:
- **Page load / route guard**: `GET /api/subscription/status` (lightweight, cached 5 min)
- **Subscription settings page**: `GET /api/subscription` (full details including `manage_url`)
- **User context / session check**: `GET /api/me` (combines user + subscription in one call)

### 10.2 "Manage Subscription" Button

The `manage_url` field from `GET /api/subscription` provides the provider-specific URL where the user can manage billing, cancel, or re-subscribe.

**Implementation**:
```tsx
function ManageSubscriptionButton({ subscription }) {
  if (!subscription.manage_url) {
    return null; // No active subscription or URL unavailable
  }

  return (
    <a
      href={subscription.manage_url}
      target="_blank"
      rel="noopener noreferrer"
    >
      Manage Subscription
    </a>
  );
}
```

**Behavior**: Opens the provider portal in a new tab. The user manages their subscription externally. Changes propagate back to the backend via webhooks (see [Section 6](#6-plan-cancellation-flow)).

### 10.3 Provider-Specific URLs

The `manage_url` is resolved differently per provider (see `GetSubscriptionInfo::getManageUrl()` in `app/Actions/Subscription/GetSubscriptionInfo.php:44-59`):

| Provider | Source | URL Pattern |
|----------|--------|-------------|
| Apple | Hardcoded | `https://apps.apple.com/account/subscriptions` |
| Google Play | Hardcoded | `https://play.google.com/store/account/subscriptions` |
| Whop | `subscription.payload['manage_url']` via `User::manageSubscriptionUrl()` | `https://whop.com/manage/...` (unique per membership) |
| CopéCart | Constructed from `payload['buyer_id']` and `payload['order_id']` | `https://copecart.com/us/orders/{order_id}/buyer_overview?buyer_id={buyer_id}&locale=en_us/` |

> **Source**: `User::manageSubscriptionUrl()` (`app/Models/User.php:407+`) queries the most recent Whop or CopéCart subscription where `end_at > now() OR end_at IS NULL` and returns `payload['manage_url']`.

### 10.4 Post-Cancellation UX

When a user cancels on the provider portal, the backend learns via webhooks (see [Section 6.4](#64-whop-cancellation-webhook-flow)). The frontend experiences this as:

1. **403 on protected endpoints**: `"You need to subscribe to access this resource."` — handle per [Section 3.6](#36-frontend-handling-strategy)
2. **`GET /api/subscription/status`**: Returns `{ "subscribed": false }`
3. **`GET /api/subscription`**: Returns all `null` fields (no active subscription found)
4. **`GET /api/me`**: `subscribed` field is `false`

**Important**: Access is revoked **immediately** when the webhook sets status to `canceled` — not at end of billing period. See [Section 6.9 Gap 1](#69-known-gaps) for details on this behavior.

**Recommended post-cancellation UI flow**:
```
1. User returns from provider portal to the Next.js app
2. Poll GET /api/subscription/status every 3 seconds (up to 30s)
3. If { subscribed: false }:
   → Show "Your subscription has been canceled" message
   → Show re-subscribe CTA (link to pricing page with embedded checkout)
   → Clear any cached subscription state in client
4. If still { subscribed: true } after timeout:
   → Show "Cancellation may take a few minutes to process"
   → The 403 on next content request will trigger redirect to pricing
```

### 10.5 Known Gap: `manage_url` Unavailable After Cancellation

**Issue**: `GET /api/subscription` only queries subscriptions with status `active` or `trial` AND `end_at > now()`. Once a subscription is canceled, this endpoint returns all `null` fields — including `manage_url`. The user cannot access the provider portal to re-subscribe or check their cancellation details.

**This is documented in [Section 6.9 Gap 3](#69-known-gaps).**

**Next.js caching workaround**:

```tsx
// Cache manage_url when subscription is active
useEffect(() => {
  async function fetchSubscription() {
    const res = await fetch("/api/subscription");
    const data = await res.json();

    if (data.manage_url) {
      // Persist in localStorage so it survives cancellation
      localStorage.setItem("manage_url", data.manage_url);
      localStorage.setItem("subscription_provider", data.provider);
    }
  }
  fetchSubscription();
}, []);

// When displaying the manage button after cancellation:
function getManageUrl(subscription) {
  if (subscription.manage_url) {
    return subscription.manage_url;
  }

  // Fallback to cached URL
  const cached = localStorage.getItem("manage_url");
  if (cached) return cached;

  // Last resort: hardcoded provider URLs
  const provider = localStorage.getItem("subscription_provider");
  switch (provider) {
    case "apple":
      return "https://apps.apple.com/account/subscriptions";
    case "google_play":
      return "https://play.google.com/store/account/subscriptions";
    default:
      return null; // Whop manage_url is unique — cannot be hardcoded
  }
}
```

**Backend recommendation**: Modify `GetSubscriptionInfo` to also query the most recent `canceled` subscription as a fallback when no active subscription is found, so `manage_url` remains available.

---

## Appendix A: Complete API Route Reference (Auth & Subscription)

| Method | Endpoint | Auth | Subscription | Purpose |
|--------|----------|------|-------------|---------|
| POST | `/api/login` | No | No | Email/password login |
| POST | `/api/register` | No | No | Account creation |
| POST | `/api/auth/firebase-login` | No | No | Google/Apple OAuth via Firebase |
| POST | `/api/forget-password` | No | No | Request password reset OTP |
| POST | `/api/reset-password` | No | No | Reset password with OTP |
| GET | `/api/me` | Yes | No | Get authenticated user + subscription status |
| POST | `/api/logout` | Yes | No | Logout (revoke token) |
| POST | `/api/device-token` | Yes | No | Update FCM device token |
| POST | `/api/profile/update-profile` | Yes | No | Update user profile (onboarding + edits) |
| POST | `/api/profile/update-dp` | Yes | No | Update profile picture |
| POST | `/api/profile/update-email` | Yes | No | Update email address |
| POST | `/api/profile/update-password` | Yes | No | Update password |
| DELETE | `/api/profile/delete` | Yes | No | Delete user account |
| GET | `/api/handler/check/{handler}` | No | No | Check handler availability |
| GET | `/api/countries` | No | No | List countries (for profile form) |
| GET | `/api/public/countries` | No | No | List countries (alias) |
| GET | `/api/subscription/status` | Yes | No | Quick subscription check (`{ subscribed: bool }`) |
| GET | `/api/subscription` | Yes | No | Detailed subscription info |
| POST | `/api/subscription/create` | Yes | No | Create Apple subscription |
| POST | `/api/subscription/google-play/create` | Yes | No | Create Google Play subscription |
| GET | `/api/plans/list` | No | No | List all plans. Accepts `country_code`, `email`, `ref` query params. Returns `PlanResource` collection. See [Section 9.2](#92-getting-plan-data) |
| GET | `/api/plans/by-country` | No | No | Alias for `/api/plans/list`. Same action, same query params, same response |
| POST | `/api/redeem-codes/validate` | Yes | No | Validate a redeem code (`throttle:10,1`). See [Section 8.6](#86-gap-5-payment-flow-with-embedded-redeem-code--no_api_endpoint-medium) |
| POST | `/api/redeem-codes/apply` | Yes | No | Apply a validated redeem code (`throttle:10,1`). See [Section 8.6](#86-gap-5-payment-flow-with-embedded-redeem-code--no_api_endpoint-medium) |
| POST | `/webhook/whop` | No* | No | Whop payment webhook |

*Webhook uses signature verification instead of auth tokens.

## Appendix B: Related Source Files

| File | Purpose |
|------|---------|
| `app/Http/Controllers/Api/Auth/FirebaseAuthController.php` | Firebase social login |
| `app/Http/Controllers/Api/Auth/ApiLoginController.php` | Email/password login + logout + device token |
| `app/Http/Controllers/Api/Auth/ApiRegisterController.php` | API registration |
| `app/Http/Controllers/Api/Auth/ApiResetPasswordController.php` | API password reset |
| `app/Actions/GetAuthUser.php` | `GET /api/me` endpoint |
| `app/Actions/GetSubscribedStatus.php` | `GET /api/subscription/status` endpoint |
| `app/Actions/Subscription/GetSubscriptionInfo.php` | `GET /api/subscription` endpoint |
| `app/Http/Resources/UserResource.php` | User JSON response shape |
| `app/Traits/ResponseMethodsTrait.php` | JSON response envelope (`sendResponse` / `sendError`) |
| `app/Http/Middleware/EnsureSubscriptionMiddleware.php` | Subscription gate (403 response) |
| `app/Models/Subscription.php` | Subscription model, active scope, cache invalidation |
| `app/Models/User.php` | `subscribed()`, `getBadge()` methods |
| `app/Enums/SubscriptionStatusEnum.php` | All subscription status values |
| `app/Services/Whop.php` | Whop API client, payment processing, subscription sync |
| `app/Http/Controllers/WhopWebhookController.php` | Whop webhook handler |
| `app/Http/Controllers/Auth/RegisteredUserController.php` | Whop redirect handler |
| `app/Http/Requests/Auth/LoginRequest.php` | Web login rate limiting |
| `app/Actions/Profile/UpdateProfile.php` | Profile update action — validation, handler logic |
| `app/Http/Controllers/ProfileCompleteController.php` | Web-only profile completion — sets `profile_completed = true` |
| `app/Http/Middleware/EnsureProfileCompleteMiddleware.php` | Web-only middleware: checks `profile_completed && handler` |
| `app/Http/Controllers/UserController.php` | Handler availability check endpoint |
| `app/Actions/Country/ListCountries.php` | Countries list endpoint |
| `app/Enums/GenderEnum.php` | Gender enum: `male`, `female` |
| `app/Actions/Plan/PlanList.php` | Plan listing action — filters by country, falls back to US |
| `app/Http/Resources/PlanResource.php` | Plan JSON shape — includes `whop_plan_id`, `whop_plan_url` with query params |
| `app/Models/Plan.php` | Plan model — columns including `whop_plan_url`, `whop_plan_id`, `price` (cents) |
| `app/Http/Controllers/PaymentController.php` | Web payment flow with redeem code validation and application |
| `app/Http/Controllers/TempMediaController.php` | Web-only temp media chunked upload |
| `routes/api.php` | All API route definitions |
| `routes/webhook.php` | Webhook route definitions |

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-06 | 1.3 | Added Section 8: API Endpoint Gap Registry, Section 9: Whop Embedded Checkout Integration, Section 10: Subscription Management from Next.js. Updated Section 4.1 with embedded checkout recommendation. Expanded Appendix A with plan endpoint details and redeem code endpoints. Added new source files to Appendix B. |
| 2026-02-06 | 1.2 | Added Section 7: New User Onboarding & Profile Completion |
| 2026-02-06 | 1.1 | Added Section 6: Plan Cancellation Flow |
| 2026-02-06 | 1.0 | Initial technical specification |
