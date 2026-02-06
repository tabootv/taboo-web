# API Authentication and User Onboarding

**Last Updated**: 2026-02-05
**Version**: 1.0
**Status**: Complete

---

## Table of Contents

1. [Overview](#1-overview)
2. [Standard Authentication (Email/Password)](#2-standard-authentication-emailpassword)
3. [Account Creation (Sign Up)](#3-account-creation-sign-up)
4. [Social Authentication (OAuth2)](#4-social-authentication-oauth2)
5. [Password Recovery](#5-password-recovery)
6. [Session Management](#6-session-management)
7. [Device Token Management](#7-device-token-management)
8. [Technical Specifications](#8-technical-specifications)
9. [Security Notes](#9-security-notes)
10. [Related Files](#10-related-files)

---

## 1. Overview

### Authentication Strategy

TabooTV uses a dual authentication strategy:

| Platform | Method | Storage |
|----------|--------|---------|
| Web (Inertia) | Session-based | Server-side session |
| Mobile/API | Sanctum tokens | `personal_access_tokens` table |

### Supported Authentication Methods

1. **Email/Password** - Traditional login
2. **Google OAuth** - Via Firebase (mobile) or Laravel Socialite (web)
3. **Apple OAuth** - Via Firebase
4. **Whop OAuth** - Payment gateway integration

### User Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEW USER FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Register │───>│  Login   │───>│ Complete │───>│Subscribe │  │
│  │          │    │  (auto)  │    │ Profile  │    │(optional)│  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                 │
│  Profile: profile_completed = false → true                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### API Route Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/login` | POST | No | Email/password login |
| `/api/register` | POST | No | Account creation |
| `/api/logout` | POST | Yes | Logout (revoke token) |
| `/api/auth/firebase-login` | POST | No | Google/Apple OAuth |
| `/api/forget-password` | POST | No | Request OTP for password reset |
| `/api/reset-password` | POST | No | Reset password with OTP |
| `/api/me` | GET | Yes | Get authenticated user |
| `/api/device-token` | POST | Yes | Update FCM device token |

---

## 2. Standard Authentication (Email/Password)

### 2.1 API Login

**Endpoint**: `POST /api/login`
**Controller**: `App\Http\Controllers\Api\Auth\ApiLoginController@store`
**Auth Required**: No
**Rate Limit**: None (security gap - see [Security Notes](#9-security-notes))

#### Request

```json
{
  "email": "user@example.com",
  "password": "secret123",
  "device_token": "fcm_token_here"  // optional - for push notifications
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Any string |
| `device_token` | string | No | FCM token for push notifications |

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "user": {
      "id": 1,
      "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "country_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "display_name": "johndoe",
      "handler": "@johndoe",
      "handler_changes_remaining": 2,
      "email": "user@example.com",
      "gender": "male",
      "phone_number": "+1234567890",
      "profile_completed": true,
      "video_autoplay": true,
      "provider": "whop",
      "badge": "subscriber",
      "is_creator": false,
      "has_courses": false,
      "dp": "https://cdn.example.com/images/placeholder-dp.jpg",
      "medium_dp": "https://cdn.example.com/images/placeholder-dp.jpg",
      "small_dp": "https://cdn.example.com/images/placeholder-dp.jpg"
    },
    "subscribed": true,
    "token": "1|abc123def456ghi789jkl012mno345pqr678stu901"
  }
}
```

#### Error Responses

**Invalid Email (422)**:
```json
{
  "message": "Email does not exist.",
  "errors": {
    "email": ["Email does not exist."]
  }
}
```

**Invalid Password (422)**:
```json
{
  "message": "Invalid password.",
  "errors": {
    "email": ["Invalid password."]
  }
}
```

#### Implementation Details

- Email is normalized to lowercase before lookup
- Uses case-insensitive email search: `WHERE LOWER(email) = ?`
- Device token is stored/updated in `device_tokens` table
- Subscribes device to Firebase `all_users` topic
- Creates Sanctum token named "General Token"

---

### 2.2 API Logout

**Endpoint**: `POST /api/logout`
**Controller**: `App\Http\Controllers\Api\Auth\ApiLoginController@destroy`
**Auth Required**: Yes (`auth:sanctum`)
**Rate Limit**: None

#### Request

```json
{
  "device_token": "fcm_token_here"  // optional - removes specific device
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `device_token` | string | No | If provided, removes this FCM token from user's devices |

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "User Log Out Successfully",
  "data": []
}
```

#### Implementation Details

- Deletes current access token (via `currentAccessToken()->delete()`)
- Optionally removes device token from `device_tokens` table
- Does NOT invalidate other sessions/tokens

---

## 3. Account Creation (Sign Up)

### 3.1 API Registration

**Endpoint**: `POST /api/register`
**Controller**: `App\Http\Controllers\Api\Auth\ApiRegisterController`
**Auth Required**: No
**Rate Limit**: None

#### Request

```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "display_name": "johndoe",
  "referral_code": "ABC123",
  "privacy_policy": true,
  "terms_and_condition": true,
  "device_token": "fcm_token_here"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email, unique in `users` table, lowercase |
| `password` | string | Yes | Min 8 chars, confirmed, meets `Password::defaults()` |
| `password_confirmation` | string | Yes | Must match `password` |
| `first_name` | string | No | User's first name |
| `last_name` | string | No | User's last name |
| `display_name` | string | No | Public display name / username |
| `referral_code` | string | No | Must exist in `users.referral_code` |
| `privacy_policy` | boolean | Yes | Must be `true` |
| `terms_and_condition` | boolean | Yes | Must be `true` |
| `device_token` | string | No | FCM token for push notifications |

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "user": {
      "id": 123,
      "uuid": "new-uuid-here",
      "email": "newuser@example.com",
      "profile_completed": false,
      // ... other user fields
    },
    "subscribed": false,
    "token": "123|abc123def456..."
  }
}
```

#### Error Responses

**Email Already Exists (422)**:
```json
{
  "message": "Email already exists",
  "errors": {
    "email": ["Email already exists"]
  }
}
```

**Terms Not Accepted (422)**:
```json
{
  "message": "Please agree to the terms and conditions and privacy policy",
  "errors": {
    "terms_and_condition": ["Please agree to the terms and conditions and privacy policy"]
  }
}
```

#### Implementation Details

- Email normalized to lowercase
- Password hashed with Bcrypt via `Hash::make()`
- `profile_completed` defaults to `false`
- Fires `Registered` event (for email verification, analytics)
- Links referral if valid referral code provided
- Creates device token entry if provided
- Auto-generates Sanctum token

---

## 4. Social Authentication (OAuth2)

### 4.1 Firebase OAuth - Google/Apple (Mobile)

**Endpoint**: `POST /api/auth/firebase-login`
**Controller**: `App\Http\Controllers\Api\Auth\FirebaseAuthController@firebaseLogin`
**Auth Required**: No
**Rate Limit**: 10 requests per minute (`throttle:10,1`)

#### Request

```json
{
  "firebase_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "device_token": "fcm_token_here",
  "provider": "google"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firebase_token` | string | Yes | Firebase ID Token (JWT from client-side Firebase Auth) |
| `device_token` | string | No | FCM token for push notifications |
| `provider` | string | No | OAuth provider: `google` or `apple`. Auto-detected from token if not provided. |

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "user": {
      "id": 1,
      "uuid": "...",
      "email": "user@gmail.com",
      "display_name": null,
      "profile_completed": false,
      // ... other user fields
    },
    "subscribed": false,
    "requires_username": true,
    "token": "1|abc123..."
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `requires_username` | boolean | `true` if `display_name` is null (user needs to set username) |
| `subscribed` | boolean | Whether user has active subscription |

#### Error Responses

**Missing Email (400)**:
```json
{
  "success": false,
  "message": "Email not provided by authentication provider",
  "data": []
}
```

**Invalid/Expired Token (401)**:
```json
{
  "success": false,
  "message": "Invalid or expired Firebase token",
  "data": []
}
```

**Configuration Error (500)**:
```json
{
  "success": false,
  "message": "Firebase configuration error",
  "data": []
}
```

#### Implementation Details

- Verifies Firebase ID token using Firebase Admin SDK
- Extracts email and Firebase UID from token claims
- Detects provider (Google or Apple) from `providerData`
- **User Mapping Logic**:
  1. Search by `firebase_uid` OR `email` (case-insensitive)
  2. If existing user found without `firebase_uid` → links account
  3. If no user found → creates new user
- New OAuth users have:
  - `password = null`
  - `email_verified_at = now()`
  - `profile_completed = false`
  - `display_name = null`
- Stores device token if provided

---

### 4.2 Google OAuth - Web (Socialite)

**Endpoints**:
- `GET /auth/google` - Redirect to Google
- `GET /auth/google/redirect` - Callback handler

**Controller**: `App\Http\Controllers\Auth\SocialLoginController`
**Auth Required**: No (guest middleware)
**Rate Limit**: None

#### Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      GOOGLE OAUTH FLOW                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User clicks "Sign in with Google"                        │
│                    ↓                                         │
│  2. GET /auth/google → Redirect to Google                    │
│                    ↓                                         │
│  3. User authenticates with Google                           │
│                    ↓                                         │
│  4. GET /auth/google/redirect ← Google callback              │
│                    ↓                                         │
│  5. Create/update user, session login                        │
│                    ↓                                         │
│  6. Redirect to /home                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Implementation Details

- Uses Laravel Socialite driver for Google
- `updateOrCreate` by email (case-insensitive)
- Stores `google_id`, `google_token`, `google_refresh_token`
- Sets random password for OAuth users
- Auto-verifies email (`email_verified_at = now()`)
- Session-based login (web only)
- On error: redirects to `/sign-in` with error message

---

### 4.3 Whop OAuth

**Endpoint**: `GET /whop/handle-redirect`
**Controller**: `App\Http\Controllers\Auth\RegisteredUserController@whop_handle_redirect`
**Auth Required**: No
**Rate Limit**: None

#### Flow

```
┌──────────────────────────────────────────────────────────────┐
│                        WHOP OAUTH FLOW                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User completes Whop payment                              │
│                    ↓                                         │
│  2. Whop redirects to /whop/handle-redirect?code=XXX         │
│                    ↓                                         │
│  3. Exchange code for access token                           │
│                    ↓                                         │
│  4. Fetch user info from Whop                                │
│                    ↓                                         │
│  5. CASE 1: New user → Create, login, profile complete       │
│     CASE 2: Existing + logged in → Redirect home             │
│     CASE 3: Existing + NOT logged in → Block (security)      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Security Features

- **Prevents account takeover**: If email exists and user is NOT logged in, blocks auto-login
- Logs warnings for blocked attempts
- Existing users must login via original method first

#### Implementation Details

- Exchanges OAuth code for Whop access token
- Fetches user profile from Whop API
- Syncs subscriptions from Whop
- Sends welcome email with plan info
- Tracks FirstPromoter affiliate if cookie present
- Sets `needs_password` session flag for password setup

---

## 5. Password Recovery

### 5.1 Request Reset (API) - OTP Flow

**Endpoint**: `POST /api/forget-password`
**Controller**: `App\Http\Controllers\Api\Auth\ApiResetPasswordController@forget`
**Auth Required**: No
**Rate Limit**: None (security gap)

#### Request

```json
{
  "email": "user@example.com"
}
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Success",
  "data": []
}
```

#### Error Response (422)

```json
{
  "message": "Email does not exist",
  "errors": {
    "email": ["Email does not exist"]
  }
}
```

#### Implementation Details

- Generates 6-digit OTP: `rand(100000, 999999)`
- Stores OTP in `users.remember_token` (plaintext - security gap)
- Sends OTP via `ResetPasswordMail`
- **No expiration** on OTP (security gap)

---

### 5.2 Reset Password (API)

**Endpoint**: `POST /api/reset-password`
**Controller**: `App\Http\Controllers\Api\Auth\ApiResetPasswordController@reset`
**Auth Required**: No
**Rate Limit**: None

#### Request

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "password": "NewPass123",
  "password_confirmation": "NewPass123"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email |
| `otp` | string | Yes | 6-digit numeric |
| `password` | string | Yes | Min 6 chars, confirmed |
| `password_confirmation` | string | Yes | Must match password |

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Success",
  "data": []
}
```

#### Error Response (422)

```json
{
  "message": "Invalid OTP",
  "errors": {
    "otp": ["Invalid OTP"]
  }
}
```

#### Implementation Details

- Verifies OTP matches `users.remember_token`
- Updates password with `Hash::make()`
- Clears `remember_token` after successful reset
- **Weaker validation**: `min:6` vs web's `Password::defaults()`

---

### 5.3 Web Password Reset

**Endpoints**:
- `GET /forgot-password` - Show request form
- `POST /forgot-password` - Send reset link
- `GET /reset-password/{token}` - Show reset form
- `POST /reset-password` - Process reset

**Controllers**:
- `PasswordResetLinkController`
- `NewPasswordController`

#### Token Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   WEB PASSWORD RESET FLOW                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. POST /forgot-password { email }                          │
│                    ↓                                         │
│  2. Generate hashed token → password_reset_tokens table      │
│                    ↓                                         │
│  3. Send email with link: /reset-password/{token}            │
│                    ↓                                         │
│  4. User clicks link → GET /reset-password/{token}           │
│                    ↓                                         │
│  5. POST /reset-password { token, password, confirmation }   │
│                    ↓                                         │
│  6. Verify token hash, check 60min expiration                │
│                    ↓                                         │
│  7. Update password, delete token, redirect to login         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Security Features

| Feature | API (OTP) | Web (Token) |
|---------|-----------|-------------|
| Token Storage | Plaintext | Hashed |
| Expiration | None | 60 minutes |
| Rate Limit | None | 60 sec throttle |
| Password Rules | min:6 | Password::defaults() |
| Logging | None | Detailed `password_reset` channel |

---

## 6. Session Management

### 6.1 Get Authenticated User

**Endpoint**: `GET /api/me`
**Action**: `App\Actions\GetAuthUser`
**Auth Required**: Yes (`auth:sanctum`)
**Rate Limit**: None

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "user": {
      // Full UserResource
    },
    "subscribed": true
  }
}
```

#### Use Cases

- Validate token is still valid
- Fetch updated user profile
- Check subscription status
- Mobile app session refresh

---

## 7. Device Token Management

### 7.1 Update FCM Token

**Endpoint**: `POST /api/device-token`
**Controller**: `App\Http\Controllers\Api\Auth\ApiLoginController@device_token`
**Auth Required**: Yes (`auth:sanctum`)
**Rate Limit**: None

#### Request

```json
{
  "device_token": "fcm_token_abc123...",
  "platform": "ios"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `device_token` | string | No | Any string |
| `platform` | string | No | Device platform: `ios`, `android`, or `web` |

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Device token stored successfully",
  "data": []
}
```

#### Implementation Details

- Creates or updates entry in `device_tokens` table
- Updates `last_used` timestamp
- Subscribes token to Firebase `all_users` topic
- If subscription fails, logs warning but doesn't fail request

---

## 8. Technical Specifications

### 8.1 Password Hashing

- **Algorithm**: Bcrypt (Laravel default)
- **Auto-casting**: User model has `'password' => 'hashed'` cast
- **Hash verification**: `Hash::check($plaintext, $hashed)`

### 8.2 Token Authentication (Sanctum)

#### Token Lifecycle

| Stage | Description |
|-------|-------------|
| Creation | On login/register via `$user->createToken('General Token')` |
| Format | `{id}|{plaintext}` (stored as SHA-256 hash) |
| Storage | `personal_access_tokens` table |
| Expiration | None by default |
| Revocation | On logout, current token deleted |

#### Usage

```
Authorization: Bearer {id}|{plaintext_token}
```

### 8.3 Rate Limiting Summary

| Endpoint | Limit | Key |
|----------|-------|-----|
| Web Login | 5/min | email + IP |
| Firebase Auth | 10/min | IP |
| TV Session | 5/min | IP |
| Redeem Code | 10/min | IP |
| **API Login** | **None** | - |
| **API Password Reset** | **None** | - |

### 8.4 CSRF Protection

- **Enabled**: All web routes
- **Excluded**: `/webhook`, `/webhook/*`
- **Configuration**: `bootstrap/app.php`

### 8.5 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful operation |
| 400 | Bad request (e.g., missing email in OAuth) |
| 401 | Unauthorized (invalid credentials/token) |
| 403 | Forbidden (not subscribed, account inactive) |
| 422 | Validation error |
| 500 | Server error |

---

## 9. Security Notes

### Known Security Gaps

| Issue | Location | Risk | Recommendation |
|-------|----------|------|----------------|
| No rate limiting | `POST /api/login` | Brute force attacks | Add `throttle:5,1` middleware |
| No rate limiting | `POST /api/forget-password` | Email enumeration, spam | Add `throttle:3,1` middleware |
| No rate limiting | `POST /api/reset-password` | OTP brute force | Add `throttle:5,1` middleware |
| OTP stored plaintext | `users.remember_token` | Database breach exposure | Hash OTP before storage |
| No OTP expiration | API password reset | OTP valid forever | Add 15-minute expiration |
| Weak password validation | API reset | Easy passwords allowed | Use `Password::defaults()` |

### Security Best Practices Implemented

- Email normalization (lowercase) prevents duplicate accounts
- Case-insensitive email lookup
- Bcrypt password hashing
- Sanctum token authentication for API
- Firebase token verification for OAuth
- Whop auto-login blocked for existing accounts
- Web password reset uses hashed tokens with expiration

---

## 10. Related Files

### Controllers

| File | Purpose |
|------|---------|
| `app/Http/Controllers/Api/Auth/ApiLoginController.php` | API login/logout |
| `app/Http/Controllers/Api/Auth/ApiRegisterController.php` | API registration |
| `app/Http/Controllers/Api/Auth/ApiResetPasswordController.php` | API password reset |
| `app/Http/Controllers/Api/Auth/FirebaseAuthController.php` | Firebase OAuth |
| `app/Http/Controllers/Auth/SocialLoginController.php` | Google Socialite |
| `app/Http/Controllers/Auth/RegisteredUserController.php` | Web registration + Whop |
| `app/Http/Controllers/Auth/PasswordResetLinkController.php` | Web password reset request |
| `app/Http/Controllers/Auth/NewPasswordController.php` | Web password reset |
| `app/Http/Controllers/Auth/AuthenticatedSessionController.php` | Web login/logout |

### Requests & Validation

| File | Purpose |
|------|---------|
| `app/Http/Requests/Auth/LoginRequest.php` | Web login validation + rate limiting |
| `app/Http/Requests/StoreDeviceToken.php` | Device token validation |

### Actions

| File | Purpose |
|------|---------|
| `app/Actions/GetAuthUser.php` | Get authenticated user endpoint |
| `app/Actions/RedeemCode/RegisterWithRedeemCode.php` | Registration with redeem code |

### Resources

| File | Purpose |
|------|---------|
| `app/Http/Resources/UserResource.php` | User API response formatting |

### Routes

| File | Purpose |
|------|---------|
| `routes/api.php` | API authentication routes |
| `routes/auth.php` | Web authentication routes |

### Configuration

| File | Purpose |
|------|---------|
| `config/auth.php` | Auth guards, providers, password reset settings |
| `config/sanctum.php` | Sanctum token settings |
| `config/services.php` | Firebase, Google OAuth settings |

### Models

| File | Purpose |
|------|---------|
| `app/Models/User.php` | User model with auth traits |
| `app/Models/DeviceToken.php` | FCM device tokens |

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-05 | 1.0 | Initial documentation |
