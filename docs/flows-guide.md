# TabooTV - User Flows Guide

**Audience**: QA, Product Managers, Stakeholders
**Last updated**: February 2026

This document describes how every login, registration, subscription, and redeem code flow is expected to work from the user's perspective. Use it as a reference when testing or when discussing product behaviour.

---

## Table of Contents

1. [How Users Enter the Platform](#1-how-users-enter-the-platform)
2. [Choose a Plan (Primary Entry Point)](#2-choose-a-plan-primary-entry-point)
3. [Embedded Checkout (Payment-First Onboarding)](#3-embedded-checkout-payment-first-onboarding)
4. [Paying with the Embedded Checkout](#4-paying-with-the-embedded-checkout)
5. [Paying with the Redirect Checkout (Fallback)](#5-paying-with-the-redirect-checkout-fallback)
6. [Registration](#6-registration)
7. [Login](#7-login)
8. [Social Login (Google & Apple)](#8-social-login-google--apple)
9. [Password Recovery](#9-password-recovery)
10. [External Checkout (OAuth Callback)](#10-external-checkout-oauth-callback)
11. [Redeem Code - Existing User](#11-redeem-code---existing-user)
12. [Redeem Code - New User](#12-redeem-code---new-user)
13. [Profile Completion](#13-profile-completion)
14. [Access Gate (Content Protection)](#14-access-gate-content-protection)
15. [Session & "Remember Me"](#15-session--remember-me)
16. [Quick Reference: Where Does the User End Up?](#16-quick-reference-where-does-the-user-end-up)

---

## 1. How Users Enter the Platform

Understanding the entry points is essential for testing. The platform is designed so that **`/choose-plan` is the primary way new users discover and enter TabooTV**. There is no prominent "Sign Up" button that takes users directly to a registration form. Instead, the journey starts with choosing a plan.

### Entry points (in order of how common they are)

| Entry point | Who uses it | How they get there |
|---|---|---|
| `/choose-plan` | **Most new users** | Marketing links, landing pages, word of mouth, or redirected by the Access Gate when they try to watch content without a subscription. Guests can complete checkout without registering first (see [Section 3](#3-embedded-checkout-payment-first-onboarding)). |
| `/sign-in` | Returning users | Direct navigation, bookmarks, or redirected by the Access Gate when their session expires |
| `/auth/whop-callback` | Users who buy on whop.com | Automatic redirect from Whop after an external purchase |
| `/redeem` | Users with a gift/promo code | Shared links like `taboo.tv/redeem` |
| `/register` | **Nobody directly** | Users only reach this page when redirected from `/choose-plan` (after clicking "Start free trial" as a guest on a plan without embedded checkout). In `/sign-in`, by clicking the "Create an account" link, they will go to `/choose-plan`. There is no public "Sign Up" button or marketing link that points here. |

### The typical new-user journey

There are two paths depending on whether the selected plan supports embedded checkout:

**Primary path: Embedded Checkout (payment-first)**
```
User arrives at /choose-plan (from an ad, a link, or a redirect)
    |
    v
Browses plans (no account needed)
    |
    v
Clicks "Start free trial"
    |
    v
Not logged in + plan has embedded checkout
    |
    v
LeadModal appears --> enters email
    |
    v
Whop embedded checkout opens --> completes payment
    |
    v
Account created automatically --> subscription confirmed
    |
    v
Profile incomplete --> /account/complete?set_password=1
    |
    v
Password step (optional) --> Photo --> Details --> Done
    |
    v
Home page (/)
```

**Fallback path: Register-first (plans without embedded checkout)**
```
User arrives at /choose-plan (from an ad, a link, or a redirect)
    |
    v
Browses plans (no account needed)
    |
    v
Clicks "Start free trial"
    |
    v
Not logged in + plan has NO embedded checkout
    |
    v
Redirected to /register?redirect=/choose-plan
    |
    v
Creates account --> automatically sent back to /choose-plan
    |
    v
Clicks "Start free trial" again --> Checkout opens
    |
    v
Pays --> Subscription confirmed --> Home page
```

The key takeaway: **for most plans, guests can pay first via embedded checkout and have their account created automatically — registration is no longer a prerequisite for checkout**.

---

## 2. Choose a Plan (Primary Entry Point)

**Page**: `/choose-plan`

This is the main entry point for new users and the first page unsubscribed users see. No login is required to view plans, and for plans with embedded checkout, no login is required to check out either.

### What the user sees

1. A toggle to switch between **Monthly** and **Yearly** plans.
2. The yearly plan shows how much the user saves compared to monthly (e.g., "Save 17%").
3. The price displayed in the user's regional currency (if the backend supports it and the user's country was detected).
4. A list of benefits included in the plan.
5. A call-to-action button. If the plan includes a free trial, the button says "Start X-day free trial". Otherwise it says "Start free trial".
6. Below the button: pricing summary and "Cancel anytime" note.
7. A collapsible "Have a redeem code?" section — **only shown to logged-in users** (see [Section 11](#11-redeem-code---existing-user)). Guests cannot see this because the redeem API requires authentication.
8. A "Have an account? Sign in" link (only shown to guests).

### Country detection and regional pricing

The app attempts to detect the user's country automatically from server headers. If detected, the country is sent to the backend when fetching plans, which can return region-specific pricing and currency. If country detection fails, the backend defaults to US pricing.

### What happens when they click the subscribe button

- **If the user is not logged in and the plan has a `whop_plan_id` (primary path):** The LeadModal opens to capture the user's email, then the embedded checkout flow begins. See [Section 3](#3-embedded-checkout-payment-first-onboarding) for the full details.
- **If the user is not logged in and the plan has NO `whop_plan_id` (fallback path):** They are redirected to `/register?redirect=/choose-plan`. After registering, they are sent back to `/choose-plan` to continue with checkout. See [Section 6](#6-registration) for details on the registration form.
- **If the user is logged in and the plan has a Whop Plan ID**: The embedded checkout modal opens (see [Section 4](#4-paying-with-the-embedded-checkout)).
- **If the user is logged in and the plan only has a Whop URL (no Plan ID)**: The user is redirected to Whop's hosted checkout page (see [Section 5](#5-paying-with-the-redirect-checkout-fallback)).

---

## 3. Embedded Checkout (Payment-First Onboarding)

This flow allows guests to pay **before** creating an account. It is the primary checkout path for unauthenticated users when the selected plan supports embedded checkout (`whop_plan_id` is present).

### What the user sees

1. Guest clicks "Start free trial" on `/choose-plan`.
2. A **LeadModal** appears with the heading "Enter your email" and subtitle "to continue to checkout". The user enters their email address. A note below the button says "We'll create your account after payment."
3. After entering their email and clicking "Continue to checkout", the modal closes and the **Whop embedded checkout modal** opens (same as authenticated checkout). The email is pre-filled.
4. The user completes payment inside the checkout modal.
5. The modal closes. A loading screen appears saying "Setting up your account..."
6. The message changes to "Activating your subscription..." as subscription polling begins.
7. After confirmation, the user is redirected to `/account/complete?set_password=1` (if their profile is incomplete) or `/` (if their profile is already complete).

### What happens behind the scenes

1. The LeadModal submits the email. Two API calls fire in parallel:
   - `POST /api/lead` — fire-and-forget lead capture (failure is silently ignored).
   - `POST /api/auth/checkout-intent` — **must succeed**. Creates a signed JWT cookie (`checkout_intent`) containing the email and plan_id. The cookie expires in 10 minutes. This endpoint is rate-limited to 5 requests per IP per 10 minutes.
2. The Whop embedded checkout modal opens with the user's email pre-filled.
3. On payment completion, Whop returns a `receipt_id` to the frontend callback.
4. The frontend calls `POST /api/auth/post-checkout` with the `receipt_id`:
   - Verifies the `checkout_intent` JWT cookie (checks signature and expiry).
   - Calls the backend's `/auth/checkout-claim` endpoint (instead of `/register`) to register or claim the account. This handles the webhook race condition where the Whop webhook may have already created the user.
   - If a new user: sets an encrypted `_pw_hint` cookie (10-minute TTL) that stores the random password for the password-set step.
   - If auto-claimed (webhook race): skips the `_pw_hint` cookie since the password step will be skipped.
   - Sets the auth token cookie (same as normal login).
   - Returns the user object, subscription status, and `auto_claimed` flag.
   - Deletes the `checkout_intent` cookie (single-use).
5. The frontend sets the user as authenticated and starts subscription polling (same mechanism as [Section 4](#4-paying-with-the-embedded-checkout)).
6. On subscription confirmation, redirects based on profile completeness.

### If the email is already registered

The post-checkout API (`POST /api/auth/post-checkout`) calls the backend's `/auth/checkout-claim` endpoint, which distinguishes between two cases using the `last_login` column:

**Case 1: Webhook-created account (auto-claim)**

This is the "webhook race" — the Whop webhook created the user before the frontend's post-checkout call arrived. The backend detects `last_login IS NULL` (no human has ever logged in) and auto-claims the account.

1. The `POST /api/auth/post-checkout` returns `200` with `{ auto_claimed: true, user, subscribed: true }`.
2. The user is logged in automatically (same as a new account).
3. The `_pw_hint` cookie is **not** set (the password step is skipped).
4. The user is redirected to `/account/complete` (without `?set_password=1`) to complete their profile.
5. The user can set a password later from Settings > Security or via the Forgot Password flow.

**Case 2: Genuine existing user (409)**

The email belongs to a real user who has logged in before (`last_login IS NOT NULL`). The backend returns a 409.

1. The `POST /api/auth/post-checkout` API returns `409` with `{ existing_user: true, email: "..." }`.
2. The user is redirected to `/sign-in?email={email}&subscription_activated=true`.
3. The sign-in page shows a green banner: "Your subscription has been activated! Sign in to start watching." (See [Section 7](#7-login) for banner details.)
4. After signing in, the user goes to the home page.

### Error scenarios

| What went wrong | What the user sees |
|---|---|
| Invalid email in LeadModal | Error below the email field: "Please enter a valid email address" |
| Checkout intent rate limited (429) | Toast: "Too many requests. Please try again later." |
| Checkout intent fails (other error) | Toast: error message from API or "Something went wrong. Please try again." |
| Post-checkout fails | Toast: "Failed to create account. Please contact support." |
| Email already registered, genuine user (409) | Redirected to sign-in with green banner (see above) |
| Email already registered, webhook race (auto-claim) | Transparent auto-login, redirected to `/account/complete` (no password step) |
| Invalid receipt (422) | Toast: error message from backend |

**Source files:**
- `src/app/(onboarding)/choose-plan/components/lead-modal.tsx`
- `src/app/(onboarding)/choose-plan/choose-plan-content.tsx:170-338`
- `src/app/api/auth/checkout-intent/route.ts`
- `src/app/api/auth/post-checkout/route.ts`

---

## 4. Paying with the Embedded Checkout

This is the **preferred** payment method for authenticated users. The user never leaves the TabooTV website.

### What the user sees

1. A dark modal appears over the Choose Plan page.
2. Inside the modal is Whop's payment form (credit card, etc.).
3. The user's email is pre-filled if they're logged in.
4. They complete payment inside the modal.
5. The modal closes.
6. A loading screen appears saying "Activating your subscription..."
7. After a few seconds, they see a success toast and are redirected to the home page.

### What happens behind the scenes

1. The modal loads Whop's embedded checkout component with the selected plan.
2. The user fills in payment details and completes the purchase.
3. Whop sends a webhook to the TabooTV backend (server-to-server, not visible to the user).
4. The backend processes the webhook and marks the user as subscribed.
5. Meanwhile, the frontend starts polling the backend every 2 seconds asking "is this user subscribed yet?"
6. When the backend confirms the subscription is active, the app updates the user's status and redirects them to the home page.

### If the subscription takes too long to activate

If 30 seconds pass and the backend hasn't confirmed the subscription yet:

1. The loading message changes to: "Payment received! Your subscription is being activated. This usually takes less than a minute."
2. A "Retry" button appears.
3. Clicking "Retry" starts polling again for another 30 seconds.

This delay can happen if the Whop webhook is slow. The payment itself was successful; it's just the confirmation that's delayed.

---

## 5. Paying with the Redirect Checkout (Fallback)

This flow is used for plans that don't support the embedded checkout (they have a checkout URL but no Plan ID). The user temporarily leaves the site.

### What the user sees

1. They click the subscribe button on `/choose-plan`.
2. They are redirected to Whop's hosted checkout page (whop.com).
3. They complete payment on Whop.
4. Whop redirects them back to `/choose-plan?status=success`.
5. The same "Activating your subscription..." screen appears.
6. After confirmation, they are redirected to the home page.

### Behind the scenes

The flow is identical to the embedded checkout from step 5 onward. The same polling logic is used to confirm the subscription.

---

## 6. Registration

**Page**: `/register`

This page exists for account creation, but **users never land here by clicking a "Sign Up" button**. They arrive here only through redirects from other flows:

- From `/choose-plan`: When a guest clicks "Start free trial" on a plan that does not support embedded checkout, the app redirects them to `/register?redirect=/choose-plan` so they create an account before checking out.
- From `/sign-in`: When a user clicks the "Create an account" link at the bottom of the sign-in page.
- From `/redeem`: When a guest tries to redeem a code, they are sent to sign in first, and from there they can click through to register.

After registration completes, the user is always sent back to where they came from (usually `/choose-plan`).

### Flow-based access protection

**The register page cannot be accessed by typing the URL directly.** It is protected by a `sessionStorage` flow token:

1. When a legitimate flow redirects to `/register` (e.g., from `/choose-plan`), a token is set in `sessionStorage` before the navigation.
2. On mount, the register page checks for this token.
3. If the token is missing (direct URL access, or opening `/register` in a new tab), the user is redirected to `/choose-plan`.
4. The token persists across same-tab page refreshes, so refreshing the register form works normally.
5. The token is cleared after successful registration.

This is a UX flow guard, not a security mechanism. If `sessionStorage` is unavailable (e.g., some private browsing modes), the page falls back to allowing access gracefully.

**Implementation**: `src/shared/lib/auth/register-flow-guard.ts` provides `setRegisterFlowToken()`, `hasRegisterFlowToken()`, and `clearRegisterFlowToken()`.

### What the user sees

1. A form with fields: First Name, Last Name, Email, Password, Confirm Password.
2. A required checkbox to accept Terms of Service and Privacy Policy.
3. Social login buttons for Google and Apple (see [Section 8](#8-social-login-google--apple)).
4. A link to sign in if they already have an account.

### What happens when they submit

1. The app validates the form on the client side:
   - All fields are required.
   - Email must be a valid format.
   - Password must be at least 8 characters.
   - Password and Confirm Password must match.
   - The Terms checkbox must be ticked.
2. If validation passes, the app sends the data to the backend.
3. The backend creates the account and returns an authentication token.
4. The app stores the token in a secure cookie (the user never sees it).
5. The app checks if there is a pending redeem code (from the URL or saved earlier). If there is, it applies the code immediately in the background and the user becomes subscribed.
6. The app decides where to send the user next (see [Section 16](#16-quick-reference-where-does-the-user-end-up)). In most cases this means going back to `/choose-plan` to complete checkout.

### Error scenarios

| What went wrong | What the user sees |
|---|---|
| Email already taken | Error message below the email field |
| Password too short | Error message below the password field |
| Passwords don't match | Error message below the confirm password field |
| Server error | A toast notification saying registration failed |

---

## 7. Login

**Page**: `/sign-in`

An existing user signs in with their email and password. Users arrive here by:

- Clicking "Have an account? Sign in" on `/choose-plan`.
- Being redirected by the Access Gate when their session expires or when they try to access protected content.
- Direct navigation (bookmarks, typing the URL).
- Being redirected from the Whop OAuth callback (Scenario C, see [Section 10](#10-external-checkout-oauth-callback)).
- Being redirected from embedded checkout when the email is already registered (see [Section 3](#3-embedded-checkout-payment-first-onboarding)).

### What the user sees

1. A form with Email and Password fields.
2. A "Remember Me" checkbox.
3. Social login buttons for Google and Apple.
4. A "Forgot password?" link.
5. A link to register if they don't have an account yet.

### Special banners

The sign-in page can show contextual banners depending on how the user arrived:

- **Subscription activated banner** (green): Appears when the user arrives from an external checkout or embedded checkout (`?subscription_activated=true`). Says: "Your subscription has been activated! Sign in to start watching."
- **Redeem code banner** (amber): Appears when the user arrives with a redeem code in the URL (`?redeem_code=XXXX`). Says: "Sign in to redeem your code."
- **Email pre-fill**: If the URL contains `?email=user@example.com`, the email field is pre-filled automatically.

### What happens when they submit

1. The app validates email and password are present.
2. The app sends the credentials to the backend.
3. If the credentials are correct, the backend returns a token.
4. The app stores the token in a secure cookie. The cookie duration depends on the "Remember Me" checkbox (see [Section 15](#15-session--remember-me)).
5. If there is a pending redeem code, the app applies it in the background.
6. The app decides where to send the user next (see [Section 16](#16-quick-reference-where-does-the-user-end-up)).

### Error scenarios

| What went wrong | What the user sees |
|---|---|
| Wrong email or password | Toast: "Invalid email or password" |
| Account doesn't exist | Error from backend displayed below email field |
| Server error | Toast with a generic error message |

---

## 8. Social Login (Google & Apple)

**Available on**: `/sign-in` and `/register`

Users can sign in or register using their Google or Apple account. The flow is the same for both providers.

### What the user sees

1. They click "Continue with Google" or "Continue with Apple".
2. A pop-up window opens from the provider (Google or Apple).
3. They authenticate in the pop-up.
4. The pop-up closes automatically.
5. They are logged in.

### What happens behind the scenes

1. The app opens a Firebase Authentication pop-up for the chosen provider.
2. The user authenticates in the pop-up.
3. Firebase returns a token confirming who the user is.
4. The app sends this Firebase token to the backend.
5. The backend either finds an existing account linked to that provider or creates a new one.
6. The backend returns an authentication token.
7. The app stores the token in a secure cookie.
8. If there is a pending redeem code, it gets applied automatically.
9. The app decides where to send the user next.

### Error scenarios

| What went wrong | What the user sees |
|---|---|
| User closed the pop-up | Nothing happens, stays on the same page |
| Pop-up was blocked by the browser | Toast: "Pop-up was blocked. Please allow pop-ups and try again." |
| Account already exists with a different method | Toast: "An account already exists with this email using a different sign-in method." |

---

## 9. Password Recovery

### Step 1: Request a reset code

**Page**: `/forgot-password`

1. The user enters their email address and clicks "Send Reset Code".
2. The backend sends a 6-digit code to their email.
3. The page switches to an OTP input screen.

### Step 2: Enter the code

1. The user sees 6 individual digit input boxes.
2. They type the 6-digit code from their email.
3. Each digit auto-advances to the next box.
4. They can also paste the full code and all boxes fill automatically.
5. When all 6 digits are entered, the app automatically moves them to the next step.
6. If they didn't receive the code, they can click "Resend Code" to get a new one.

### Step 3: Set a new password

**Page**: `/reset-password`

1. The user enters a new password and confirms it.
2. Both fields have a show/hide toggle.
3. They click "Reset Password".
4. On success, they see a confirmation screen with a link to sign in.
5. The user must sign in manually with the new password. There is no auto-login.

### Error scenarios

| What went wrong | What the user sees |
|---|---|
| Email not found | Error message from backend |
| Wrong OTP code | Error message, they can try again |
| OTP expired | Error message, they need to request a new code |
| Passwords don't match | Error message below the confirm field |

---

## 10. External Checkout (OAuth Callback)

This flow handles users who purchase a subscription directly on whop.com (not through the TabooTV website). After purchase, Whop redirects them to TabooTV.

**Page**: `/auth/whop-callback`
**Implementation**: `src/app/(auth)/auth/whop-callback/page.tsx`

### What happens

1. The user buys a subscription on whop.com.
2. After payment, Whop redirects the user to: `https://taboo.tv/auth/whop-callback?code=XXXX&membership_id=YYYY`
3. The callback page shows a loading animation with progress dots.
4. The app exchanges the OAuth code with the backend.
5. The backend determines which scenario applies and responds accordingly.

### Three possible scenarios

The backend determines which scenario applies via `POST /api/auth/whop-exchange` (exchanges the OAuth `code` + `membership_id` for a Sanctum token). All 3 scenarios are handled in the callback page implementation.

#### Scenario A: New user

The user doesn't have a TabooTV account yet. The backend creates one for them.

1. The backend creates an account using the email from Whop.
2. The backend returns a token and user data.
3. The app logs the user in automatically.
4. The page shows a success animation.
5. After a moment, the user is redirected to `/account/complete` to finish setting up their profile (see [Section 13](#13-profile-completion)).

#### Scenario B: Existing user, already logged in

The user already has a TabooTV account and is currently logged in.

1. The backend links the Whop subscription to their existing account.
2. The backend returns a token and user data.
3. The app updates the session.
4. The page shows a success animation.
5. After a moment, the user is redirected to the home page.

#### Scenario C: Existing user, not logged in

The user has a TabooTV account but is not currently signed in. For security, the backend does not auto-login in this case.

1. The backend activates the subscription on their account but does not return a login token.
2. The callback page shows a message: "Your subscription has been activated! Redirecting you to sign in..."
3. After 3 seconds, the user is redirected to `/sign-in` with their email pre-filled and a green banner saying "Your subscription has been activated! Sign in to start watching."
4. The user signs in with their existing password.
5. They now have full access.

### Error scenarios

| What went wrong | What the user sees |
|---|---|
| Invalid or expired OAuth code | Error page with message, retry button, and link to plans |
| Network error | Error page with retry button |

---

## 11. Redeem Code - Existing User

An already logged-in user who wants to apply a redeem code.

### From the Choose Plan page

1. On `/choose-plan`, the user clicks "Have a redeem code?".
2. A text input expands below.
3. They type the code (automatically converted to uppercase) and click "Redeem".
4. The app validates the code with the backend.
5. If valid, the app shows the plan details (plan name, duration).
6. The user clicks "Activate".
7. The backend applies the code and activates the subscription.
8. Success toast appears and the user is redirected to the home page.

### From the dedicated Redeem page

1. The user visits `/redeem`.
2. They enter their code and click "Redeem".
3. Same validation and activation flow as above.

### Error scenarios

| What went wrong | What the user sees |
|---|---|
| Code doesn't exist | Error message: code is invalid |
| Code already used | Error message from backend |
| Code expired | Error message from backend |
| User already has a subscription | Error message: already subscribed |
| User already used this code | Error message from backend |
| Too many attempts | Rate limited (10 requests/min per IP for both validate and apply endpoints) |

---

## 12. Redeem Code - New User

A user who is not logged in and wants to use a redeem code. This requires registering or signing in first, because the backend needs an authenticated user to attach the subscription to.

There are two entry paths:

### Path A: From `/redeem`

1. The user visits `/redeem` and enters a redeem code.
2. The app detects they are not logged in.
3. The app saves the code to localStorage so it won't be lost.
4. The user is redirected to `/sign-in` with the code in the URL.
5. The sign-in page shows an amber banner: "Sign in to redeem your code."
6. The "Get started" link at the bottom goes directly to `/register` (bypassing `/choose-plan`) when a redeem code is present.

### Path B: From `/choose-plan?redeem_code=XXX`

1. The user visits `/choose-plan` with a `?redeem_code=` parameter (e.g., from a marketing link).
2. The code is automatically saved to localStorage in the background.
3. The "Have a redeem code?" section is **hidden** for guests (it requires authentication to call the redeem API).
4. When the guest clicks "Start free trial", they are redirected to `/register?redirect=%2Fchoose-plan%3Fredeem_code%3DXXX` — the code is preserved in both localStorage and the redirect URL (belt-and-suspenders).

### After authentication (both paths)

**If the user already has an account:**

1. They sign in with email/password (or Google/Apple).
2. Immediately after sign-in, the app retrieves the saved code and applies it automatically in the background.
3. The user is redirected to the home page as a subscribed user.

**If the user needs to register:**

1. They click "Get started" on the sign-in page. When a redeem code is present, this goes directly to `/register` (skipping `/choose-plan`), with the code preserved in the URL and localStorage.
2. They fill in the registration form.
3. Immediately after registration, the app retrieves the saved code and applies it automatically.
4. The user is redirected based on their onboarding status (profile completion if needed, otherwise home).

### Important details

- The code is saved in two ways: in the URL (`?redeem_code=XXXX`) and in local browser storage (localStorage).
- The URL takes priority. If both exist, the URL version is used.
- After the code is successfully applied, it is cleared from storage.
- Social auth (Google/Apple) also triggers the automatic code application after sign-in.
- When a redeem code is present on `/sign-in`, the "Get started" link routes directly to `/register` instead of `/choose-plan`. This sets the register flow token (sessionStorage) and saves the code to localStorage before navigating, so the user can register and redeem in one flow without visiting the plan page.
- **2-step workaround:** There is no atomic register+redeem endpoint. The app performs `POST /api/register` then `POST /api/redeem-codes/apply` as two separate calls. If register succeeds but apply fails, the frontend should retry the apply.
- **Rate limit:** Both validate and apply endpoints are limited to 10 requests/min per IP.

---

## 13. Profile Completion

**Page**: `/account/complete`

New users (especially those coming from Whop or embedded checkout) may need to complete their profile before accessing content.

### The wizard has 3 or 4 steps

The number of steps depends on how the user arrived:

- **From Embedded Checkout ([Section 3](#3-embedded-checkout-payment-first-onboarding)):** 4 steps — Password → Photo → Details → Complete
- **All other flows (Whop OAuth, registration, etc.):** 3 steps — Photo → Details → Complete

The wizard reads the URL query parameter `?set_password=1` to determine whether to include the Password step.

#### Step 1: Password (conditional, skippable)

Only shown when `/account/complete?set_password=1` is in the URL — i.e., the user came from the embedded checkout flow and has a random password they don't know.

1. The user sees a "Set your password" heading with the subtitle "Create a password so you can sign in to your account anytime."
2. They enter a new password. Requirements are shown in real time as they type:
   - At least 8 characters
   - Contains a number
   - Contains an uppercase letter
   - Contains a lowercase letter
3. They confirm the password. A match/mismatch indicator appears in real time.
4. Clicking "Set Password" calls `POST /api/auth/set-initial-password`, which reads the encrypted `_pw_hint` cookie (containing the random password) as the current password, and updates it to the user's chosen password.
5. On success, a toast says "Password set successfully!" and the wizard moves to the Photo step.
6. **Skippable:** The user can click "Skip for now" and set a password later from Settings > Security or via the Forgot Password flow.
7. **Session expired:** If the `_pw_hint` cookie has expired (10-minute TTL), the step shows "Session expired" with instructions: "Your password setup session has expired. You can set a password anytime from **Settings > Security**, or use **Forgot Password**." A "Continue" button proceeds to the Photo step.

**Source:** `src/app/account/complete/components/password-step.tsx`, `src/app/api/auth/set-initial-password/route.ts`

#### Step 2: Profile Photo (optional)

1. The user sees a placeholder avatar.
2. They can upload a photo or skip this step.
3. Clicking "Next" moves to the Details step.

#### Step 3: Profile Details (required)

1. The user must fill in:
   - Display Name
   - Username (handle) - checked for availability in real time as they type
   - First Name
   - Last Name
   - Gender
   - Country (dropdown)
2. Phone number is optional.
3. Fields are pre-filled with data from the user's registration (e.g., first name, last name) via a fresh fetch from the `/me` API on mount. Only empty fields are filled; any user edits are preserved.
4. Clicking "Save" submits the profile and moves to the Completion step.

#### Step 4: Completion

1. The user sees a summary of their profile.
2. They click "Done" or "Continue".
3. The app decides where to send them:
   - If they are subscribed: home page.
   - If they are not subscribed: `/choose-plan`.

### Username (handler) availability check

As the user types a username, the app checks availability against the backend in real time. If the username is taken, a warning appears immediately.

### Username (handler) change rules

1. **First-time set** (handler is `null`): Free — does not consume a change.
2. **Subsequent changes:** Each change decrements `handler_changes_remaining` (default: 1 for new users).
3. **No changes left** (`handler_changes_remaining <= 0`): Returns error, change is blocked.
4. Case changes (e.g., `JohnDoe` → `johndoe`) count as a change because handlers are stored lowercase.

### Password for auto-created users

Users who were created through the Whop OAuth flow or the embedded checkout flow have a random password generated by the backend. They don't know this password. There are two ways to set a real password:

- **Embedded checkout users:** The Password step in the onboarding wizard (`POST /api/auth/set-initial-password`) allows them to set a password immediately after checkout. If they skip it or the session expires, they can use the Forgot Password flow later.
- **Whop OAuth users:** They need to use the "Forgot Password" flow to set a password (`POST /api/forget-password` → `POST /api/reset-password`).

---

## 14. Access Gate (Content Protection)

The Access Gate is an invisible layer that runs on every page navigation. It ensures users have completed onboarding before they can access content.

### Rules (checked in this order)

1. **Is the user logged in?**
   - No: The gate does nothing. Public pages are accessible.
   - Yes: Continue checking.

2. **Is the user on `/account/complete` with a complete profile?**
   - Yes: Redirect to `/` (home). This prevents completed users from re-entering the onboarding wizard.

3. **Is the user on an exempt page?**
   - Pages like `/choose-plan`, `/redeem`, `/account/*`, `/payment/*`, and `/auth/whop-callback` are always accessible.
   - If yes: The gate does nothing.

4. **Is the user's profile complete?**
   - No: Redirect to `/account/complete`.

5. **Is the user on a content page and not subscribed?**
   - Content pages include videos, shorts, courses, creators, and similar.
   - Non-content pages like `/profile`, `/account`, and `/account/subscription` are accessible without a subscription.
   - If on a content page without a subscription: Redirect to `/choose-plan`.

6. **All checks passed**: Show the page normally.

### Route protection (middleware)

The following routes are public (no authentication required):
- `/sign-in`, `/register`, `/forgot-password`, `/reset-password` — auth pages
- `/choose-plan` — plan selection (browseable by guests)
- `/auth/whop-callback` — OAuth callback
- `/redeem` — redeem code entry
- `/creators` — creator profile pages

Note: `/account/complete` is **not** a public route — it requires authentication. All paths to this page (whop-callback, AccessGate redirect, onboarding helper, embedded checkout post-checkout) authenticate the user first.

**Removed pages**: `/verify-email` and `/confirm-password` have been removed. These routes will return 404.

### Edge case protection

The gate has built-in protection against redirect loops. If it detects it has redirected the user to the same page more than 3 times within 5 seconds, it stops redirecting and shows the page content to prevent an infinite loop.

---

## 15. Session & "Remember Me"

### How sessions work

When a user logs in, the app stores their authentication token in a secure cookie. This cookie is:
- **HttpOnly**: JavaScript on the page cannot read it (protection against XSS attacks).
- **Secure**: Only sent over HTTPS in production.
- **SameSite=Lax**: Protection against CSRF attacks.

### Cookie duration

| Setting | Duration | When it's used |
|---|---|---|
| "Remember Me" checked | 30 days | User explicitly checks the box |
| "Remember Me" unchecked | Session only (until browser closes) | User explicitly unchecks the box |
| Default (social login, registration) | 7 days | Any login/register without the checkbox |

### What happens when the session expires

1. The next time the user tries to access a protected page, the backend responds with a 401 (Unauthorized) error.
2. The app clears the local session data.
3. The user is redirected to `/sign-in`.
4. They need to sign in again.

### Background session verification

When a user opens the app (or refreshes the page), the app performs a background check:

1. It reads the cached user data from local storage (so the page loads instantly).
2. In the background, it asks the backend "is this token still valid?" by calling the `/me` endpoint.
3. If the token is valid: Nothing changes, the user continues normally.
4. If the token is expired or invalid: The app clears the session and the Access Gate redirects them as needed.

This means the user sees the page immediately (no loading spinner), but if their session expired, they'll be redirected to sign in after a brief moment.

---

## 16. Quick Reference: Where Does the User End Up?

After any login or registration action, the app checks the user's status and redirects them to the appropriate page.

| User's status | Where they go |
|---|---|
| Profile incomplete (missing name, username, gender, or country) | `/account/complete` |
| Profile incomplete + came from embedded checkout | `/account/complete?set_password=1` |
| Profile complete, but not subscribed | `/choose-plan` |
| Profile complete and subscribed | `/` (home page) |
| Had a `?redirect=` parameter in the URL | That redirect target (if it's a valid internal path) |

### Onboarding priority

The checks happen in this order:
1. Profile completion is checked first.
2. Subscription is checked second.
3. The redirect parameter is used last (only if both profile and subscription are OK).

---

## Appendix: Flow Diagrams

### A. New User: Full Journey (Happy Path — Register-First Fallback)

```
Visit /choose-plan
    |
    v
See plans, click "Start free trial"
    |
    v
Not logged in + no embedded checkout -> redirect to /register
    |
    v
Fill in name, email, password -> submit
    |
    v
Account created, logged in automatically
    |
    v
Profile incomplete? --yes--> /account/complete (3-step wizard)
    |                              |
    no                             v
    |                         Complete profile -> Save
    v                              |
Not subscribed -> /choose-plan     v
    |                         Not subscribed -> /choose-plan
    v                              |
Select plan -> Checkout modal      v
    |                         Select plan -> Checkout modal
    v                              |
Complete payment                   v
    |                         Complete payment
    v                              |
Subscription confirmed             v
    |                         Subscription confirmed
    v                              |
Home page (/)                      v
                              Home page (/)
```

### B. Existing User: Redeem Code (Happy Path)

```
Visit /choose-plan (already logged in)
    |
    v
Click "Have a redeem code?"
    |
    v
Enter code -> Click "Redeem"
    |
    v
Code validated -> Shows plan info
    |
    v
Click "Activate"
    |
    v
Subscription activated
    |
    v
Home page (/)
```

### C. External Checkout: New User

```
Purchase on whop.com
    |
    v
Redirected to /auth/whop-callback?code=XXX
    |
    v
Loading animation with progress dots
    |
    v
Account created automatically
    |
    v
Redirect to /account/complete
    |
    v
Complete profile wizard
    |
    v
Home page (/)
```

### D. External Checkout: Existing User (Not Logged In)

```
Purchase on whop.com
    |
    v
Redirected to /auth/whop-callback?code=XXX
    |
    v
Loading animation with progress dots
    |
    v
"Subscription activated! Redirecting to sign in..."
    |
    v (after 3 seconds)
/sign-in with email pre-filled and green banner
    |
    v
User signs in with their password
    |
    v
Home page (/)
```

### E. New User: Embedded Checkout (Payment-First)

```
Visit /choose-plan (not logged in)
    |
    v
See plans, click "Start free trial"
    |
    v
LeadModal appears → enter email
    |
    v
Checkout intent created (JWT cookie)
    |
    v
Whop embedded checkout modal opens
    |
    v
Complete payment
    |
    v
/auth/checkout-claim called
    |
    ├─ No existing user?
    │  └─ Account created (random password)
    │     └─ /account/complete?set_password=1
    │        └─ Password step → Photo → Details → Done → Home (/)
    │
    ├─ Webhook already created user (last_login = null)?
    │  └─ Auto-claimed (no password step)
    │     └─ /account/complete
    │        └─ Photo → Details → Done → Home (/)
    │
    └─ Genuine existing user (last_login ≠ null)?
       └─ 409 → /sign-in with green banner
          └─ Sign in → Home (/)
```
