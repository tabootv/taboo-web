# Authentication & Authorization

> **When to use:** Building auth flows, protecting routes, managing tokens, implementing OAuth.

---

## Quick Reference

```tsx
// Check if user is authenticated
const { user, isAuthenticated } = useAuthStore();

// Protect component
if (!isAuthenticated) {
  return <Redirect to="/sign-in" />;
}

// Get current user
const user = useAuthStore((s) => s.user);
```

---

## Authentication Flow

### Dual Auth Strategy

| Platform | Method | Storage |
|----------|--------|---------|
| Web (Next.js) | Session-based via HttpOnly cookie | `tabootv_token` cookie → proxy forwards as `Bearer` token |
| Mobile / API | Sanctum tokens | `personal_access_tokens` table |

The Next.js proxy (`src/proxy.ts`) reads the `tabootv_token` HttpOnly cookie and attaches it as `Authorization: Bearer {token}` before forwarding to Laravel. Laravel authenticates via Sanctum identically for both flows.

### Token Storage

- **Cookie name:** `tabootv_token` (HttpOnly, Secure, SameSite=Lax)
- **Token format:** `{id}|{40-char-random}` (stored as SHA-256 hash in `personal_access_tokens`)
- **Expiration:** None by default (Sanctum config); cookie duration depends on "Remember Me"
- **Revocation:** On logout, only the current token is deleted
- **Middleware:** `src/middleware.ts` validates on each request

### Login Process

```tsx
// src/app/(auth)/sign-in/_actions.ts
export async function loginAction(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const { token, user } = await authClient.login({ email, password });

    // Token stored in HTTP-only cookie by API
    // Store user in Zustand
    useAuthStore.setState({ user, isAuthenticated: true });

    redirect('/');
  } catch (error) {
    return { error: 'Invalid credentials' };
  }
}
```

### Logout

```tsx
export async function logoutAction() {
  // Clear API session
  await authClient.logout();

  // Clear Zustand store
  useAuthStore.setState({ user: null, isAuthenticated: false });

  redirect('/sign-in');
}
```

---

## Middleware Protection

File: `src/middleware.ts`

```tsx
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('tabootv_token');
  const { pathname } = request.nextUrl;

  // Public routes (no auth required)
  const publicRoutes = ['/sign-in', '/register', '/'];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Protected routes (auth required)
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Premium routes (subscription required)
  if (pathname.startsWith('/premium')) {
    // Verify subscription status
    // Redirect to /plans if no subscription
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|public).*)'],
};
```

---

## Protected Routes

### Redirect on 401

```tsx
// Middleware automatically redirects to /sign-in if token missing
// No additional code needed in components
```

### Redirect on 403 (Subscription Required)

```tsx
// If user tries to access premium content without subscription
// Middleware redirects to /plans
```

---

## OAuth

### Supported Methods

| Method | Endpoint | Rate Limit | Notes |
|--------|----------|------------|-------|
| Email/Password | `POST /api/login` | None | See [Security Notes](#security-notes) |
| Google (Firebase) | `POST /api/auth/firebase-login` | 10/min | Mobile & web |
| Apple (Firebase) | `POST /api/auth/firebase-login` | 10/min | Mobile & web |
| Google (Socialite) | `GET /auth/google` | None | Web-only, session-based |
| Whop OAuth | `POST /api/auth/whop-exchange` | None | See `docs/agents/subscriptions.md` |

### Firebase Integration (Google / Apple)

```tsx
'use client';

import { signInWithGoogle } from '@/lib/firebase';

export function GoogleSignIn() {
  const handleSignIn = async () => {
    try {
      const result = await signInWithGoogle();

      // Send token to backend
      const { token, user } = await authClient.verifyFirebaseToken(
        result.user.uid
      );

      // Store in Zustand
      useAuthStore.setState({ user, isAuthenticated: true });

    } catch (error) {
      console.error('OAuth failed:', error);
    }
  };

  return <button onClick={handleSignIn}>Sign in with Google</button>;
}
```

**Backend user resolution (Firebase):**

1. Search by `firebase_uid` OR `email` (case-insensitive)
2. Existing user without `firebase_uid` → links account
3. No user found → creates new user (`password=null`, `email_verified_at=now()`, `profile_completed=false`)
4. Returns `requires_username: true` when `display_name` is `null`

---

## Email & Password Security

- **Email normalization:** Lowercased before storage and lookup (`WHERE LOWER(email) = ?`)
- **Password hashing:** Bcrypt via `Hash::make()` (auto-cast on User model)
- **Registration validation:** Email unique, password confirmed + meets `Password::defaults()`, terms required
- **Security gaps:**
  - No rate limit on `POST /api/login` (brute-force risk)
  - No rate limit on `POST /api/register` (mass account creation risk)

---

## Device Token Management

**Endpoint:** `POST /api/device-token` (auth required)

Stores/updates FCM token for push notifications.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `device_token` | string | No | FCM token |
| `platform` | string | No | `ios`, `android`, or `web` |

- Creates/updates entry in `device_tokens` table
- Subscribes token to Firebase `all_users` topic
- On logout, pass `device_token` to `POST /api/logout` to remove it

---

## Password Recovery

OTP-based flow for API consumers. Web uses a separate token-based flow with stricter security.

### Step 1: Request OTP

`POST /api/forget-password` — sends 6-digit OTP to email.

### Step 2: Reset Password

`POST /api/reset-password` — verifies OTP and sets new password.

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `otp` | string | Yes (6-digit) |
| `password` | string | Yes (min 6 chars) |
| `password_confirmation` | string | Yes |

**Security gaps:** No rate limit, OTP stored plaintext in `users.remember_token`, no OTP expiration, weaker password rules than web (`min:6` vs `Password::defaults()`).

---

## User Session Hook

```tsx
'use client';

import { useEffect } from 'react';
import { useUser } from '@/api/queries/auth.queries';
import { useAuthStore } from '@/shared/stores/auth-store';

export function useSession() {
  const { data: user, isLoading } = useUser();
  const { setUser } = useAuthStore();

  useEffect(() => {
    if (user) {
      setUser(user, user.token);
    }
  }, [user, setUser]);

  return { user, isLoading };
}
```

---

## Protected Component Pattern

```tsx
'use client';

import { useAuthStore } from '@/shared/stores/auth-store';
import { Redirect } from 'next/navigation';

export function ProtectedContent() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect to="/sign-in" />;
  }

  return <div>Protected content here</div>;
}
```

---

## Subscription Checking

```tsx
'use client';

import { useAuthStore } from '@/shared/stores/auth-store';

export function PremiumContentGate({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);

  if (!user?.subscription) {
    return (
      <div>
        <p>This is premium content. Subscribe to watch.</p>
        <a href="/plans">View plans</a>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## Auth Store

File: `src/shared/stores/auth-store.ts`

```tsx
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,

  setUser: (user, token) =>
    set({ user, token, isAuthenticated: !!user }),

  logout: () =>
    set({ user: null, token: null, isAuthenticated: false }),
}));
```

---

## Security Notes

### Rate Limiting Summary

| Endpoint | Limit |
|----------|-------|
| `POST /api/auth/firebase-login` | 10/min per IP |
| `POST /api/redeem-codes/validate` | 10/min per IP |
| `POST /api/redeem-codes/apply` | 10/min per IP |
| Web login (`POST /login`) | 5/min per email+IP |
| **`POST /api/login`** | **None** |
| **`POST /api/register`** | **None** |
| **`POST /api/forget-password`** | **None** |
| **`POST /api/reset-password`** | **None** |

### Best Practices

**DO:**
- Use HTTP-only cookies for tokens (secure)
- Check auth in middleware for protected routes
- Validate tokens on backend for every request
- Clear Zustand store on logout
- Use Zustand for client-side auth state
- Redirect to /sign-in on 401
- Redirect to /plans on 403

**DON'T:**
- Store tokens in localStorage (XSS vulnerable)
- Trust client-side auth checks alone
- Forget to validate on backend
- Leave tokens in memory after logout
- Skip middleware validation

---

## Reference

- **Auth middleware:** `src/middleware.ts`
- **Auth store:** `src/shared/stores/auth-store.ts`
- **Auth queries:** `src/api/queries/auth.queries.ts`
- **Auth client:** `src/api/client/auth.client.ts`
- **Subscriptions & Whop:** `docs/agents/subscriptions.md`
