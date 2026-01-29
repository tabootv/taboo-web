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

### Token Storage

- **Location:** HTTP-only cookies (`tabootv_token`)
- **Backend:** Laravel API
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

## OAuth (Google, Apple)

### Firebase Integration

```tsx
// Component
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

## Best Practices

✅ **DO:**
- Use HTTP-only cookies for tokens (secure)
- Check auth in middleware for protected routes
- Validate tokens on backend for every request
- Clear Zustand store on logout
- Use Zustand for client-side auth state
- Redirect to /sign-in on 401
- Redirect to /plans on 403

❌ **DON'T:**
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
