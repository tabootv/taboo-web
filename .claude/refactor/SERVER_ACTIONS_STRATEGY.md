# Server Actions Strategy

**Created**: 2026-01-24  
**Status**: Active  
**Epic**: Step 4 - Server Actions Migration

---

## Decision Criteria: Server Actions vs TanStack Query

### Use Server Actions When:

1. **Server-side validation required**
   - Form submissions with complex validation
   - Data sanitization needed
   - Business rule enforcement

2. **Sensitive operations**
   - Authentication (login, register, password reset)
   - Payment processing
   - Account deletion
   - Permission-sensitive operations

3. **Automatic cache revalidation needed**
   - Operations that affect multiple routes
   - Server-side cache invalidation required
   - Next.js automatic revalidation benefits

4. **File uploads**
   - Video uploads
   - Image uploads
   - File processing on server

5. **Form submissions**
   - Traditional form handling
   - Progressive enhancement support

### Use TanStack Query When:

1. **Optimistic UI updates**
   - Like/dislike toggles
   - Bookmark toggles
   - Follow/unfollow actions
   - Real-time feedback needed

2. **Polling/real-time data**
   - Live chat messages
   - Real-time notifications
   - Periodic data refresh

3. **Client-side state management**
   - Complex client-side logic
   - Multi-step workflows
   - Client-side caching strategies

4. **Retry logic needed**
   - Network error recovery
   - Automatic retries
   - Exponential backoff

5. **Complex caching strategies**
   - Multiple cache dependencies
   - Conditional invalidation
   - Optimistic updates with rollback

### Hybrid Approach:

**Server Action for mutation + TanStack Query for optimistic UI**

- Use Server Action for the actual mutation (security, validation)
- Use TanStack Query wrapper for optimistic UI updates
- Best of both worlds: security + great UX

---

## Mutation Audit & Categorization

### ✅ Keep as TanStack Query (Optimistic UI / Real-time)

#### Video Interactions
- `useToggleLike()` - Optimistic UI, instant feedback
- `useToggleDislike()` - Optimistic UI, instant feedback
- `useToggleBookmark()` - Optimistic UI, instant feedback
- `useAddComment()` - Optimistic UI possible
- `useToggleAutoplay()` - User preference, optimistic UI

#### Shorts Interactions
- `useToggleShortLike()` - Optimistic UI, instant feedback
- `useToggleShortBookmark()` - Optimistic UI, instant feedback

#### Posts Interactions
- `useLikePost()` - Optimistic UI, instant feedback
- `useDislikePost()` - Optimistic UI, instant feedback
- `useAddPostComment()` - Optimistic UI possible

#### Comments Interactions
- `useToggleCommentLike()` - Optimistic UI, instant feedback
- `useToggleCommentDislike()` - Optimistic UI, instant feedback

#### Social Interactions
- `useToggleFollowCreator()` - Optimistic UI, instant feedback

#### Notifications
- `useMarkAllNotificationsRead()` - Optimistic UI
- `useMarkNotificationRead()` - Optimistic UI
- `useDeleteAllNotifications()` - Optimistic UI
- `useDeleteNotification()` - Optimistic UI

#### Live Chat
- `useSendMessage()` - Real-time, optimistic UI

#### Clips
- `useSaveClip()` - Optimistic UI possible

#### Moderation
- `useReport()` - Can stay as TanStack Query (non-critical)
- `useBlockContent()` - Can stay as TanStack Query
- `useBlockUser()` - Can stay as TanStack Query

### 🔄 Migrate to Server Actions (Security / Validation / File Uploads)

#### Authentication (Already Server Actions - needs colocation)
- ✅ `loginAction` - **MIGRATE**: Move to `app/(auth)/sign-in/_actions.ts`
- ✅ `registerAction` - **MIGRATE**: Move to `app/(auth)/register/_actions.ts`
- ✅ `logoutAction` - **MIGRATE**: Move to `app/(auth)/sign-in/_actions.ts` or keep in auth
- ✅ `forgotPasswordAction` - **MIGRATE**: Move to `app/(auth)/forgot-password/_actions.ts`
- ✅ `resetPasswordAction` - **MIGRATE**: Move to `app/(auth)/reset-password/_actions.ts`

**Current TanStack Query (should use Server Actions):**
- `useLogin()` - **MIGRATE**: Replace with Server Action
- `useRegister()` - **MIGRATE**: Replace with Server Action
- `useLogout()` - **MIGRATE**: Replace with Server Action
- `useForgotPassword()` - **MIGRATE**: Replace with Server Action
- `useResetPassword()` - **MIGRATE**: Replace with Server Action
- `useFirebaseLogin()` - **EVALUATE**: May need Server Action for security

#### File Uploads
- `useUploadVideo()` - **MIGRATE**: Move to `app/studio/upload/video/_actions.ts`
- `useUploadShort()` - **MIGRATE**: Move to `app/studio/upload/short/_actions.ts`
- `useCreatePost()` (with image) - **MIGRATE**: Move to `app/(main)/community/_actions.ts` or `app/studio/posts/_actions.ts`
- `useCreateStudioPost()` - **MIGRATE**: Move to `app/studio/posts/_actions.ts`
- `useUpdateAvatar()` - **MIGRATE**: Move to `app/(main)/profile/edit/_actions.ts`

#### Profile Updates (Sensitive Operations)
- `useUpdateProfile()` - **MIGRATE**: Move to `app/(main)/profile/edit/_actions.ts`
- `useUpdateEmail()` - **MIGRATE**: Move to `app/(main)/profile/edit/_actions.ts` (sensitive)
- `useUpdatePassword()` - **MIGRATE**: Move to `app/(main)/profile/edit/_actions.ts` (sensitive)
- `useUpdateContact()` - **MIGRATE**: Move to `app/(main)/profile/edit/_actions.ts`

#### Content Deletion (Sensitive Operations)
- `useDeleteVideo()` - **MIGRATE**: Move to `app/studio/upload/video/_actions.ts` or `app/studio/_actions.ts`
- `useDeleteShort()` - **MIGRATE**: Move to `app/studio/upload/short/_actions.ts` or `app/studio/_actions.ts`
- `useDeletePost()` - **MIGRATE**: Move to `app/(main)/community/_actions.ts`
- `useDeleteComment()` - **MIGRATE**: Move to `app/(main)/videos/[id]/_actions.ts` or keep in feature
- `useDeleteAccount()` - **MIGRATE**: Move to `app/(main)/profile/edit/_actions.ts` (critical)

#### Subscriptions (Sensitive Operations)
- `useSubscribeApple()` - **EVALUATE**: May need Server Action for payment security
- `useSubscribeGooglePlay()` - **EVALUATE**: May need Server Action for payment security

#### Device Registration
- `useRegisterDeviceToken()` - **EVALUATE**: Can stay as TanStack Query (non-sensitive)

---

## Server Action Templates

### Basic Server Action Template

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// 1. Define validation schema
const actionSchema = z.object({
  field: z.string().min(1),
});

// 2. Server action function
export async function actionName(data: unknown) {
  // Validate input
  const validated = actionSchema.parse(data);

  // Perform operation (call API client)
  const result = await apiClient.operation(validated);

  // Revalidate affected paths
  revalidatePath('/affected-route');
  revalidatePath('/another-route');

  // Return result or redirect
  return result;
  // OR redirect('/success');
}
```

### Server Action with Authentication

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

const actionSchema = z.object({
  // schema fields
});

export async function authenticatedAction(data: unknown) {
  // Verify authentication
  const token = cookies().get('tabootv_token');
  if (!token) {
    throw new Error('Unauthorized');
  }

  // Validate input
  const validated = actionSchema.parse(data);

  // Perform operation
  const result = await apiClient.operation(validated);

  // Revalidate
  revalidatePath('/affected-route');

  return result;
}
```

### Server Action for File Upload

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const uploadSchema = z.object({
  file: z.instanceof(File),
  title: z.string().min(1),
  // other fields
});

export async function uploadAction(formData: FormData) {
  // Extract and validate
  const file = formData.get('file') as File;
  const title = formData.get('title') as string;

  const validated = uploadSchema.parse({ file, title });

  // Upload file
  const result = await apiClient.upload(validated);

  // Revalidate
  revalidatePath('/studio');
  revalidatePath('/contents/videos');

  return result;
}
```

### Hybrid: Server Action + TanStack Query Wrapper

```typescript
// app/(route)/_actions.ts
'use server';

export async function updateProfileAction(data: UpdateProfileData) {
  // Server-side validation
  const validated = schema.parse(data);
  
  // Perform mutation
  const result = await profileClient.updateProfile(validated);
  
  // Revalidate
  revalidatePath('/profile');
  
  return result;
}

// api/mutations/profile.mutations.ts
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileAction, // Use Server Action
    onMutate: async (data) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      const previous = queryClient.getQueryData(['profile']);
      queryClient.setQueryData(['profile'], { ...previous, ...data });
      return { previous };
    },
    onError: (_err, _data, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['profile'], context.previous);
      }
    },
    onSuccess: () => {
      // Invalidate to sync with server
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
```

---

## Migration Priority

### Priority 1: Authentication (PR 4.2)
- All auth operations (already Server Actions, need colocation)
- Replace TanStack Query auth mutations with Server Actions

### Priority 2: File Uploads (PR 4.3)
- Video upload
- Short upload
- Post creation with images
- Avatar upload

### Priority 3: Profile Updates (PR 4.4)
- Profile updates
- Email changes
- Password changes
- Account deletion

### Priority 4: Content Deletion (PR 4.5)
- Video deletion
- Short deletion
- Post deletion
- Comment deletion

---

## Best Practices

1. **Always validate input** - Use Zod schemas
2. **Always check authentication** - Verify user is authorized
3. **Revalidate affected paths** - Use `revalidatePath()` appropriately
4. **Handle errors gracefully** - Return error objects, don't throw
5. **Use TypeScript** - Type all inputs and outputs
6. **Colocate with routes** - Place in `_actions.ts` files
7. **Document actions** - Add JSDoc comments
8. **Test thoroughly** - Test auth, validation, error cases

---

## File Structure

```
app/
├── (auth)/
│   ├── sign-in/
│   │   ├── page.tsx
│   │   └── _actions.ts          # loginAction, logoutAction
│   ├── register/
│   │   ├── page.tsx
│   │   └── _actions.ts            # registerAction
│   └── forgot-password/
│       ├── page.tsx
│       └── _actions.ts            # forgotPasswordAction, resetPasswordAction
├── (main)/
│   ├── profile/
│   │   └── edit/
│   │       ├── page.tsx
│   │       └── _actions.ts        # updateProfileAction, updateAvatarAction, etc.
│   └── community/
│       ├── page.tsx
│       └── _actions.ts            # createPostAction, deletePostAction
└── studio/
    ├── upload/
    │   ├── video/
    │   │   ├── page.tsx
    │   │   └── _actions.ts        # uploadVideoAction, deleteVideoAction
    │   └── short/
    │       ├── page.tsx
    │       └── _actions.ts        # uploadShortAction, deleteShortAction
    └── posts/
        ├── page.tsx
        └── _actions.ts            # createStudioPostAction
```
