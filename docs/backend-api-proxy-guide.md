# Backend API Proxy Guide

> Handoff documentation for the Laravel backend team explaining how Next.js proxies API requests, manages authentication cookies, and forwards client IP headers through Cloudflare.

---

## 1. Architecture Overview

```
Client (browser)
    │
    │  HTTPS (Cloudflare edge)
    ▼
app.taboo.tv  (Next.js on Vercel)
    │
    │  fetch() with Authorization header + X-Original-* headers
    │  (Cloudflare edge again — this is the second hop)
    ▼
api.taboo.tv  (Laravel)
```

**Why a proxy?** The auth token is stored in an HttpOnly cookie that JavaScript cannot read. This prevents XSS attacks from stealing tokens. The Next.js server-side routes read the cookie and attach it as a `Bearer` token before forwarding to Laravel.

**Backend URL:** Configured via the `NEXT_PUBLIC_API_URL` environment variable. Defaults to `https://api.taboo.tv/api`.

---

## 2. How Requests Flow

1. The browser calls `/api/<path>` on `app.taboo.tv`.
2. Next.js matches the route — either a specific auth route or the catch-all `[...path]`.
3. The route handler reads the `tabootv_token` HttpOnly cookie.
4. The cookie value is URL-decoded (Sanctum tokens contain `|`, stored as `%7C`).
5. The token is attached as `Authorization: Bearer {token}`.
6. Client IP headers from Cloudflare are mapped to `X-Original-*` headers (see section 4).
7. The request is forwarded to `https://api.taboo.tv/api/<path>`.
8. The Laravel response is returned to the browser (with the token stripped from auth responses).

**Supported methods:** GET, POST, PUT, PATCH, DELETE

**Content types:** `application/json` and `multipart/form-data` (file uploads). For FormData, the body is passed through as-is without a manual `Content-Type` header so the boundary is preserved.

---

## 3. Route Inventory

Most Laravel endpoints flow through the **catch-all** (`/api/[...path]`), which is a dumb pipe: it reads the cookie, attaches `Authorization: Bearer`, forwards to Laravel, and returns the response. It never writes or deletes cookies.

A route gets its own dedicated file when it needs behavior the catch-all can't provide. There are two reasons:

1. **Cookie management** — the route needs to write or delete `tabootv_token` and/or state cookies.
2. **Custom auth logic** — the route needs an auth guard (early 401) or special 401 handling that the catch-all doesn't provide.

| Next.js Route | Method(s) | Backend Endpoint | Cookie Mgmt | Why Dedicated? |
|---|---|---|---|---|
| `/api/[...path]` | GET, POST, PUT, PATCH, DELETE | `/{path}` (prefix stripped) | Read only — never deletes on 401 | N/A — this is the default catch-all |
| `/api/login` | POST | `/login` | Sets `tabootv_token` + state cookies | Cookie write: extracts token from response, sets cookie with `remember_me` lifetime |
| `/api/register` | POST | `/register` | Sets `tabootv_token` + state cookies | Cookie write: extracts token from response, sets cookie + state cookies |
| `/api/logout` | POST | `/logout` | Deletes `tabootv_token` + state cookies | Cookie delete: clears all auth cookies; always returns success even if backend fails |
| `/api/me` | GET | `/me` | Deletes cookie on 401; refreshes state cookies on success | Cookie write/delete + custom 401: deletes cookie on 401, refreshes state cookies on 200 |
| `/api/device-token` | POST | `/device-token` | Read only | Auth guard: returns 401 early if no cookie (catch-all would forward unauthenticated) |
| `/api/auth/whop-exchange` | POST | `/auth/whop-exchange` | Sets `tabootv_token` + state cookies on 200; passthrough on 202 | Cookie write: extracts token + sets cookie (like login); special 202 passthrough; sends existing token for account-linking |

All routes attach proxy headers via `getProxyHeaders(request)`. All other Laravel endpoints (profiles, videos, studios, comments, etc.) flow through the catch-all — no dedicated route needed.

---

## 4. Client IP Forwarding (`X-Original-*` Headers)

### The Problem

Both `app.taboo.tv` and `api.taboo.tv` sit behind Cloudflare. When Next.js makes a server-side `fetch()` to Laravel, the request passes through Cloudflare a **second time**. At that second hop, Cloudflare overwrites `cf-connecting-ip` and `cf-ipcountry` with the **Vercel server's IP** — not the real client's IP.

```
Client (203.0.113.42, AU)
    │
    │  cf-connecting-ip: 203.0.113.42
    │  cf-ipcountry: AU
    ▼
app.taboo.tv (Next.js)  ← These headers are correct here
    │
    │  cf-connecting-ip: 76.76.21.x  ← Cloudflare overwrites with Vercel IP!
    │  cf-ipcountry: US              ← Cloudflare overwrites with Vercel country!
    ▼
api.taboo.tv (Laravel)   ← Gets wrong IP/country if using cf-* headers
```

### The Solution

Next.js copies the real client values into custom `X-Original-*` headers before making the fetch. Cloudflare does not touch custom headers, so they arrive at Laravel intact.

**Header mapping:**

| Incoming (Cloudflare → Next.js) | Outgoing (Next.js → Laravel) | Contains |
|---|---|---|
| `cf-connecting-ip` | `X-Original-Client-IP` | Real client IP address |
| `cf-ipcountry` | `X-Original-Client-Country` | ISO 3166-1 alpha-2 country code |
| `x-forwarded-for` | `X-Original-Forwarded-For` | Full proxy chain |
| `x-real-ip` | `X-Original-Real-IP` | Client IP (from upstream proxy) |

Headers are only set when the incoming value is present — missing source headers are silently skipped.

**Source file:** `src/shared/lib/proxy-headers.ts`

---

## 5. Laravel Action Items

### Reading the Headers

```php
// In a controller or middleware:
$clientIp = $request->header('X-Original-Client-IP');
$clientCountry = $request->header('X-Original-Client-Country');
$forwardedFor = $request->header('X-Original-Forwarded-For');
$realIp = $request->header('X-Original-Real-IP');
```

### Recommended: IP Resolution Helper

Create a helper or middleware that resolves client IP with a fallback chain:

```php
class ClientInfo
{
    /**
     * Resolve the real client IP.
     *
     * Priority:
     * 1. X-Original-Client-IP  — forwarded by Next.js proxy (most reliable for proxied requests)
     * 2. cf-connecting-ip       — set by Cloudflare (correct for direct API calls)
     * 3. $request->ip()         — PHP/framework fallback
     */
    public static function ip(Request $request): string
    {
        return $request->header('X-Original-Client-IP')
            ?? $request->header('cf-connecting-ip')
            ?? $request->ip();
    }

    /**
     * Resolve the client's country code (ISO 3166-1 alpha-2).
     *
     * Priority:
     * 1. X-Original-Client-Country — forwarded by Next.js proxy
     * 2. cf-ipcountry               — set by Cloudflare
     */
    public static function country(Request $request): ?string
    {
        return $request->header('X-Original-Client-Country')
            ?? $request->header('cf-ipcountry');
    }
}
```

### Where to Use

Replace any existing usage of `$request->ip()`, `cf-connecting-ip`, or `cf-ipcountry` with the helper above. Common places:

- Rate limiting middleware
- Geo-based content filtering
- Analytics/logging
- Fraud detection
- Audit trails

---

## 6. Authentication Cookie Details

### Token Cookie

| Property | Value |
|---|---|
| Name | `tabootv_token` |
| HttpOnly | `true` (not readable by JS) |
| Secure | `true` in production |
| SameSite | `Lax` |
| Path | `/` |

**Token format:** Laravel Sanctum plaintext token containing a `|` separator (e.g., `123|abc...`). Next.js URL-encodes the cookie value on write (`|` → `%7C`) and decodes it before sending to Laravel.

### Token Lifetime

| `remember_me` value | Cookie lifetime |
|---|---|
| `true` | 30 days (`maxAge: 2592000`) |
| `false` | Session (no `maxAge` — expires on browser close) |
| `undefined` (default) | 7 days (`maxAge: 604800`) |

The `remember_me` field is extracted from the login request body and used to set the cookie duration. It is **not** forwarded to the Laravel backend.

### State Cookies (Readable by JS)

These cookies mirror user state so the frontend can make routing decisions without an API call:

| Cookie Name | Values | Purpose |
|---|---|---|
| `tabootv_profile_completed` | `1` or `0` | Whether user has completed profile setup |
| `tabootv_subscribed` | `1` or `0` | Whether user has an active subscription |
| `tabootv_is_creator` | `1` or `0` | Whether user is a content creator |

State cookies share the same lifetime and options as the token cookie. They are refreshed on every `/api/me` call and deleted on logout.

---

## 7. Important Behaviors

### Cookie Deletion on 401

- **`/api/me` only:** Deletes `tabootv_token` on a 401 response from Laravel. This is the single source of truth for "is this token still valid?"
- **Catch-all (`/api/[...path]`):** Does **NOT** delete the cookie on 401. This prevents cascade failures where one expired-token response wipes the cookie and causes every subsequent request to fail.

### Logout Always Succeeds

`/api/logout` always returns `{ success: true, message: "Logged out successfully" }` and deletes the cookie, even if the backend call fails. This ensures users can always log out from the frontend.

### Whop Exchange Special Cases

- **HTTP 202:** Passed through without setting a cookie (indicates the user already exists and needs to log in with their existing account).
- **HTTP 200:** Token is extracted and cookie is set (new user created or existing user linked).
- Sends the existing auth token if the user is already logged in (for account-linking scenarios).

### Response Format Handling

All auth routes handle two response shapes from Laravel:

```jsonc
// Wrapped format
{ "success": true, "message": "...", "data": { "user": {...}, "token": "...", "subscribed": true } }

// Flat format
{ "message": "...", "user": {...}, "token": "...", "subscribed": true }
```

The proxy normalizes both into a consistent response (without the token) before sending to the browser.
