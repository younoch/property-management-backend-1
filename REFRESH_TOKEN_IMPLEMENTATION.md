# Refresh Token Implementation

## Overview
This document describes the implementation of a refresh token system for the Property Management Backend API, which addresses the issue of access token expiration and provides seamless authentication renewal.

## Problem Solved
Previously, when the `access_token` expired (after 15 minutes), users had to manually log in again. Now, the system automatically uses a `refresh_token` to obtain new tokens without requiring re-authentication.

## Implementation Details

### 1. Environment Configuration
Add these variables to your `.env` file:

```bash
# JWT Refresh Token Configuration (Optional - falls back to ACCESS_SECRET if not set)
JWT_REFRESH_SECRET=replace-with-strong-random-secret-for-refresh
JWT_REFRESH_EXPIRES_IN=7d
```

**Note**: If `JWT_REFRESH_SECRET` is not set, the system will use `JWT_ACCESS_SECRET` as a fallback.

### 2. Token Lifecycle

#### Access Token
- **Lifetime**: 15 minutes (configurable via `JWT_ACCESS_EXPIRES_IN`)
- **Purpose**: Short-term authentication for API requests
- **Storage**: HTTP-only cookie named `access_token`

#### Refresh Token
- **Lifetime**: 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)
- **Purpose**: Long-term token for obtaining new access tokens
- **Storage**: HTTP-only cookie named `refresh_token`

### 3. Authentication Flow

#### Initial Login (POST `/auth/signin`)
1. User provides email/password
2. System validates credentials
3. System generates both `access_token` and `refresh_token`
4. Both tokens are set as HTTP-only cookies
5. User receives user information (ID, email, name, role)

#### Token Refresh (POST `/auth/refresh`)
1. System reads `refresh_token` from cookies
2. System validates the refresh token
3. If valid, system generates new `access_token` and `refresh_token`
4. Both new tokens are set as cookies
5. User receives success message

#### Logout (POST `/auth/signout`)
1. System clears both `access_token` and `refresh_token` cookies
2. User receives logout confirmation

### 4. Swagger Integration

The refresh token system is fully integrated with Swagger UI:

- **Authentication**: Both `access_token` and `refresh_token` cookies are configured
- **Endpoints**: All authentication endpoints are properly documented
- **Testing**: Users can test the complete authentication flow in Swagger UI

#### Swagger Endpoints
- `POST /auth/signin` - Login and get both tokens
- `POST /auth/refresh` - Refresh tokens using refresh token
- `POST /auth/signout` - Logout and clear all tokens
- `GET /auth/whoami` - Get current user info (requires access token)

### 5. Security Features

- **HTTP-only Cookies**: Tokens cannot be accessed via JavaScript
- **Secure Cookies**: In production, cookies are only sent over HTTPS
- **SameSite Policy**: Configured for cross-site request handling
- **Automatic Expiration**: Tokens automatically expire based on configuration
- **Token Rotation**: Refresh tokens are rotated on each use

### 6. Error Handling

The system provides clear error messages for various scenarios:

- **Invalid Refresh Token**: "Invalid refresh token"
- **Expired Refresh Token**: "Refresh token expired"
- **Missing Refresh Token**: "Refresh token not found"
- **Invalid Token Type**: "Invalid token type"

### 7. Usage in Swagger UI

1. **Login**: Use `POST /auth/signin` with email/password
2. **Automatic Cookie Handling**: Swagger UI automatically includes cookies in requests
3. **Token Refresh**: When access token expires, use `POST /auth/refresh`
4. **Protected Endpoints**: All endpoints with lock icons (🔒) require valid access tokens

### 8. Frontend Integration

For frontend applications, the system works seamlessly:

```javascript
// Example: Automatic token refresh
async function makeAuthenticatedRequest() {
  try {
    const response = await fetch('/api/protected-endpoint', {
      credentials: 'include' // Important: Include cookies
    });
    return response.json();
  } catch (error) {
    if (error.status === 401) {
      // Access token expired, try to refresh
      await fetch('/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      // Retry the original request
      return makeAuthenticatedRequest();
    }
    throw error;
  }
}
```

## Benefits

1. **Seamless User Experience**: No need to re-login every 15 minutes
2. **Security**: Short-lived access tokens reduce exposure window
3. **Scalability**: Refresh tokens can be revoked independently
4. **Compliance**: Meets security best practices for token management
5. **Developer Experience**: Full Swagger integration for testing

## Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `JWT_REFRESH_SECRET` | `JWT_ACCESS_SECRET` | Secret for refresh tokens |

## Testing

1. Start the application: `npm run start:dev`
2. Access Swagger UI: `http://localhost:8000/api`
3. Test the complete authentication flow:
   - Sign in → Get both tokens
   - Use protected endpoints → Verify access token works
   - Wait for access token to expire (or manually expire it)
   - Use refresh endpoint → Get new tokens
   - Continue using protected endpoints

## Troubleshooting

### Common Issues

1. **"Refresh token not found"**: Ensure cookies are enabled and `credentials: 'include'` is set
2. **"Invalid refresh token"**: Check if refresh token has expired or is malformed
3. **Cookies not persisting**: Verify cookie settings (secure, sameSite, domain)

### Debug Steps

1. Check browser developer tools → Application → Cookies
2. Verify environment variables are set correctly
3. Check server logs for JWT-related errors
4. Ensure HTTPS is used in production (for secure cookies)
