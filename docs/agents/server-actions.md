# Server Actions

> **When to use:** Building forms, handling server-side logic, protecting data. Using Next.js server actions.

---

## Quick Reference

```tsx
// Form submission with server action
'use client';

import { loginAction } from './_actions';

export function LoginForm() {
  return (
    <form action={loginAction}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

---

## File Organization

Server actions are **colocated** with routes:

```
src/app/
├── (auth)/
│   ├── sign-in/
│   │   ├── page.tsx
│   │   ├── _components/
│   │   │   └── login-form.tsx
│   │   └── _actions.ts         ← Server actions here
│   └── register/
│       ├── page.tsx
│       └── _actions.ts
├── (main)/
│   └── profile/
│       └── edit/
│           ├── page.tsx
│           └── _actions.ts
└── studio/
    └── upload/
        └── video/
            ├── page.tsx
            └── _actions.ts
```

---

## Basic Pattern

```tsx
// src/app/(auth)/sign-in/_actions.ts
'use server';

import { redirect } from 'next/navigation';
import { authClient } from '@/api/client/auth.client';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  try {
    const response = await authClient.login({ email, password });
    
    // Store token in cookie
    // (handled by middleware or cookie utils)
    
    redirect('/');
  } catch (error) {
    return { error: 'Invalid credentials' };
  }
}
```

---

## Form Integration

### With FormData

```tsx
// _actions.ts
export async function updateProfileAction(formData: FormData) {
  const name = formData.get('name');
  const bio = formData.get('bio');
  
  return await userClient.updateProfile({ name, bio });
}

// Component
'use client';

export function EditProfile() {
  return (
    <form action={updateProfileAction}>
      <input name="name" defaultValue={user.name} />
      <textarea name="bio" defaultValue={user.bio} />
      <button type="submit">Save</button>
    </form>
  );
}
```

### With useTransition (for UX)

```tsx
'use client';

import { useTransition } from 'react';
import { loginAction } from './_actions';

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      await loginAction(formData);
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

---

## Error Handling

### Return Errors to Client

```tsx
// _actions.ts
export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  // Validate
  if (!email || !password) {
    return { error: 'Missing required fields' };
  }
  
  try {
    const user = await authClient.register({ email, password });
    return { success: true, user };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Unknown error' };
  }
}
```

### Handle in Component

```tsx
'use client';

import { useState } from 'react';
import { registerAction } from './_actions';

export function RegisterForm() {
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const result = await registerAction(formData);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage('Registration successful!');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... inputs ... */}
      {message && <p>{message}</p>}
    </form>
  );
}
```

---

## File Upload

```tsx
// _actions.ts
export async function uploadVideoAction(formData: FormData) {
  const file = formData.get('video') as File;
  const title = formData.get('title') as string;
  
  if (!file) {
    return { error: 'No file provided' };
  }
  
  try {
    const response = await videoClient.uploadVideo(
      file,
      { title }
    );
    
    redirect(`/studio/videos/${response.id}`);
  } catch (error) {
    return { error: 'Upload failed' };
  }
}
```

---

## Database Mutations

```tsx
// _actions.ts
'use server';

import { db } from '@/lib/db'; // Prisma, TypeORM, etc.

export async function createPostAction(formData: FormData) {
  const content = formData.get('content') as string;
  const userId = getCurrentUserId(); // Get from session
  
  const post = await db.post.create({
    data: {
      content,
      userId,
      createdAt: new Date(),
    },
  });
  
  return post;
}
```

---

## Middleware Integration (Auth)

Protect actions by checking session:

```tsx
// _actions.ts
'use server';

import { auth } from '@/lib/auth';

export async function deleteVideoAction(videoId: string) {
  const session = await auth();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  // Proceed with deletion
  return await videoClient.deleteVideo(videoId);
}
```

---

## Best Practices

✅ **DO:**
- Use 'use server' directive
- Keep logic minimal (delegate to API)
- Validate inputs
- Handle errors explicitly
- Use redirect() for navigation
- Colocate with routes
- Check auth/permissions

❌ **DON'T:**
- Mix client & server logic in one function
- Expose sensitive data
- Forget error handling
- Use without 'use server'
- Hardcode URLs

---

## Reference

- **Colocated in:** `_actions.ts` next to routes
- **Next.js Server Actions:** https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
