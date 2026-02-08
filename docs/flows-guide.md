# TabooTV - User Flows Guide

**Audience**: QA, Product Managers, Stakeholders
**Last updated**: February 2026

This document describes how every login, registration, subscription, and redeem code flow is expected to work from the user's perspective. Use it as a reference when testing or when discussing product behaviour.

---

## Table of Contents

1. [How Users Enter the Platform](#1-how-users-enter-the-platform)
2. [Choose a Plan (Primary Entry Point)](#2-choose-a-plan-primary-entry-point)
3. [Paying with the Embedded Checkout](#3-paying-with-the-embedded-checkout)
4. [Paying with the Redirect Checkout (Fallback)](#4-paying-with-the-redirect-checkout-fallback)
5. [Registration](#5-registration)
6. [Login](#6-login)
7. [Social Login (Google & Apple)](#7-social-login-google--apple)
8. [Password Recovery](#8-password-recovery)
9. [Whop External Purchase (OAuth Callback)](#9-whop-external-purchase-oauth-callback)
10. [Redeem Code - Existing User](#10-redeem-code---existing-user)
11. [Redeem Code - New User](#11-redeem-code---new-user)
12. [Profile Completion](#12-profile-completion)
13. [Access Gate (Content Protection)](#13-access-gate-content-protection)
14. [Session & "Remember Me"](#14-session--remember-me)
15. [Quick Reference: Where Does the User End Up?](#15-quick-reference-where-does-the-user-end-up)

---

## 1. How Users Enter the Platform

Understanding the entry points is essential for testing. The platform is designed so that **`/choose-plan` is the primary way new users discover and enter TabooTV**. There is no prominent "Sign Up" button that takes users directly to a registration form. Instead, the journey starts with choosing a plan.

### Entry points (in order of how common they are)

| Entry point | Who uses it | How they get there |
|---|---|---|
| `/choose-plan` | **Most new users** | Marketing links, landing pages, word of mouth, or redirected by the Access Gate when they try to watch content without a subscription |
| `/sign-in` | Returning users | Direct navigation, bookmarks, or redirected by the Access Gate when their session expires |
| `/auth/whop-callback` | Users who buy on whop.com | Automatic redirect from Whop after an external purchase |
| `/redeem` | Users with a gift/promo code | Shared links like `taboo.tv/redeem` |
| `/register` | **Nobody directly** | Users only reach this page when redirected from `/choose-plan` (after clicking "Start free trial" as a guest). In `/sign-in`, by clicking the "Create an account" link, they will go to `/choose-plan`. There is no public "Sign Up" button or marketing link that points here. |

### The typical new-user journey

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
Not logged in --> redirected to /register?redirect=/choose-plan
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

The key takeaway: **registration is a step within the subscription flow, not a standalone destination**.

---

## 2. Choose a Plan (Primary Entry Point)

**Page**: `/choose-plan`

This is the main entry point for new users and the first page unsubscribed users see. No login is required to view plans, but login is required to check out.

### What the user sees

1. A toggle to switch between **Monthly** and **Yearly** plans.
2. The yearly plan shows how much the user saves compared to monthly (e.g., "Save 17%").
3. The price displayed in the user's regional currency (if the backend supports it and the user's country was detected).
4. A list of benefits included in the plan.
5. A call-to-action button. If the plan includes a free trial, the button says "Start X-day free trial". Otherwise it says "Start free trial".
6. Below the button: pricing summary and "Cancel anytime" note.
7. A collapsible "Have a redeem code?" section — **only shown to logged-in users** (see [Section 10](#10-redeem-code---existing-user)). Guests cannot see this because the redeem API requires authentication.
8. A "Have an account? Sign in" link (only shown to guests).

### Country detection and regional pricing

The app attempts to detect the user's country automatically from server headers. If detected, the country is sent to the backend when fetching plans, which can return region-specific pricing and currency. If country detection fails, the backend defaults to US pricing.

### What happens when they click the subscribe button

- **If the user is not logged in**: They are redirected to `/register?redirect=/choose-plan`. After registering, they are sent back to `/choose-plan` to continue with checkout. See [Section 5](#5-registration) for details on the registration form.
- **If the plan has a Whop Plan ID**: The embedded checkout modal opens (see [Section 3](#3-paying-with-the-embedded-checkout)).
- **If the plan only has a Whop URL (no Plan ID)**: The user is redirected to Whop's hosted checkout page (see [Section 4](#4-paying-with-the-redirect-checkout-fallback)).

---

## 3. Paying with the Embedded Checkout

This is the **preferred** payment method. The user never leaves the TabooTV website.

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

## 4. Paying with the Redirect Checkout (Fallback)

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

## 5. Registration

**Page**: `/register`

This page exists for account creation, but **users never land here by clicking a "Sign Up" button**. They arrive here only through redirects from other flows:

- From `/choose-plan`: When a guest clicks "Start free trial", the app redirects them to `/register?redirect=/choose-plan` so they create an account before checking out.
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
3. Social login buttons for Google and Apple (see [Section 7](#7-social-login-google--apple)).
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
6. The app decides where to send the user next (see [Section 15](#15-quick-reference-where-does-the-user-end-up)). In most cases this means going back to `/choose-plan` to complete checkout.

### Error scenarios

| What went wrong | What the user sees |
|---|---|
| Email already taken | Error message below the email field |
| Password too short | Error message below the password field |
| Passwords don't match | Error message below the confirm password field |
| Server error | A toast notification saying registration failed |

---

## 6. Login

**Page**: `/sign-in`

An existing user signs in with their email and password. Users arrive here by:

- Clicking "Have an account? Sign in" on `/choose-plan`.
- Being redirected by the Access Gate when their session expires or when they try to access protected content.
- Direct navigation (bookmarks, typing the URL).
- Being redirected from the Whop OAuth callback (Scenario C, see [Section 9](#9-whop-external-purchase-oauth-callback)).

### What the user sees

1. A form with Email and Password fields.
2. A "Remember Me" checkbox.
3. Social login buttons for Google and Apple.
4. A "Forgot password?" link.
5. A link to register if they don't have an account yet.

### Special banners

The sign-in page can show contextual banners depending on how the user arrived:

- **Subscription activated banner** (green): Appears when the user arrives from a Whop external purchase (`?subscription_activated=true`). Says: "Your subscription has been activated! Sign in to start watching."
- **Redeem code banner** (amber): Appears when the user arrives with a redeem code in the URL (`?redeem_code=XXXX`). Says: "Sign in to redeem your code."
- **Email pre-fill**: If the URL contains `?email=user@example.com`, the email field is pre-filled automatically.

### What happens when they submit

1. The app validates email and password are present.
2. The app sends the credentials to the backend.
3. If the credentials are correct, the backend returns a token.
4. The app stores the token in a secure cookie. The cookie duration depends on the "Remember Me" checkbox (see [Section 14](#14-session--remember-me)).
5. If there is a pending redeem code, the app applies it in the background.
6. The app decides where to send the user next (see [Section 15](#15-quick-reference-where-does-the-user-end-up)).

### Error scenarios

| What went wrong | What the user sees |
|---|---|
| Wrong email or password | Toast: "Invalid email or password" |
| Account doesn't exist | Error from backend displayed below email field |
| Server error | Toast with a generic error message |

---

## 7. Social Login (Google & Apple)

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

## 8. Password Recovery

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

## 9. Whop External Purchase (OAuth Callback)

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
5. After a moment, the user is redirected to `/account/complete` to finish setting up their profile (see [Section 12](#12-profile-completion)).

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

## 10. Redeem Code - Existing User

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

## 11. Redeem Code - New User

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

## 12. Profile Completion

**Page**: `/account/complete`

New users (especially those coming from Whop) may need to complete their profile before accessing content.

### The wizard has 3 steps

#### Step 1: Profile Photo (optional)

1. The user sees a placeholder avatar.
2. They can upload a photo or skip this step.
3. Clicking "Next" moves to step 2.

#### Step 2: Profile Details (required)

1. The user must fill in:
   - Display Name
   - Username (handle) - checked for availability in real time as they type
   - First Name
   - Last Name
   - Gender
   - Country (dropdown)
2. Phone number is optional.
3. Fields are pre-filled with data from the user's registration (e.g., first name, last name) via a fresh fetch from the `/me` API on mount. Only empty fields are filled; any user edits are preserved.
4. Clicking "Save" submits the profile and moves to step 3.

#### Step 3: Completion

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

### Known limitation: Password for Whop users

Users who were created through the Whop OAuth flow have a random password generated by the backend. They don't know this password. If they want to set a password, they need to use the "Forgot Password" flow to reset it (`POST /api/forget-password` → `POST /api/reset-password`). This adds some friction but works. There is no `set-initial-password` endpoint yet.

---

## 13. Access Gate (Content Protection)

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

Note: `/account/complete` is **not** a public route — it requires authentication. All paths to this page (whop-callback, AccessGate redirect, onboarding helper) authenticate the user first.

**Removed pages**: `/verify-email` and `/confirm-password` have been removed. These routes will return 404.

### Edge case protection

The gate has built-in protection against redirect loops. If it detects it has redirected the user to the same page more than 3 times within 5 seconds, it stops redirecting and shows the page content to prevent an infinite loop.

---

## 14. Session & "Remember Me"

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

## 15. Quick Reference: Where Does the User End Up?

After any login or registration action, the app checks the user's status and redirects them to the appropriate page.

| User's status | Where they go |
|---|---|
| Profile incomplete (missing name, username, gender, or country) | `/account/complete` |
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

### A. New User: Full Journey (Happy Path)

```
Visit /choose-plan
    |
    v
See plans, click "Start free trial"
    |
    v
Not logged in -> redirect to /register
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

### C. Whop External Purchase: New User

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

### D. Whop External Purchase: Existing User (Not Logged In)

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
