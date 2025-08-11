# CORS Configuration for JWT Cookies

This document explains how to configure CORS (Cross-Origin Resource Sharing) for the JWT cookie-based authentication system.

## Overview

The application uses JWT tokens stored in HttpOnly cookies for authentication. CORS must be properly configured to allow:
- Cross-origin requests from your frontend domains
- Credentials (cookies) to be sent with requests
- Preflight OPTIONS requests to work correctly

## Environment Configuration

### Development Environment

```bash
# .env.development
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
JWT_ACCESS_SECRET=your-dev-secret
JWT_ACCESS_EXPIRES_IN=15m
```

**Cookie Settings:**
- `SameSite=Lax` (no Secure required for localhost)
- `HttpOnly=true`
- `Path=/`

### Production Environment

```bash
# .env.production
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
JWT_ACCESS_SECRET=your-production-secret
JWT_ACCESS_EXPIRES_IN=15m
```

**Cookie Settings:**
- `SameSite=None` (for cross-origin)
- `Secure=true` (HTTPS required)
- `HttpOnly=true`
- `Path=/`

## Frontend Configuration

### JavaScript/Fetch API

```javascript
// Login request
const response = await fetch('https://api.yourdomain.com/auth/signin', {
  method: 'POST',
  credentials: 'include', // Required for cookies
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// Subsequent requests
const userData = await fetch('https://api.yourdomain.com/auth/whoami', {
  credentials: 'include', // Required for cookies
  headers: {
    'Content-Type': 'application/json',
  }
});
```

### Axios

```javascript
import axios from 'axios';

// Configure axios to include credentials
axios.defaults.withCredentials = true;

// Or per-request
const response = await axios.post('/auth/signin', {
  email: 'user@example.com',
  password: 'password123'
}, {
  withCredentials: true
});
```

### React Query

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';

// Configure default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Use in components
const loginMutation = useMutation({
  mutationFn: (credentials) => 
    fetch('/auth/signin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
});
```

## CORS Headers Explained

### Request Headers (Automatically Set)
- `Origin`: Set by browser
- `Cookie`: Contains JWT token

### Response Headers (Set by Server)
- `Access-Control-Allow-Origin`: Your frontend domain
- `Access-Control-Allow-Credentials`: `true`
- `Access-Control-Allow-Methods`: `GET, POST, PUT, DELETE, PATCH, OPTIONS`
- `Access-Control-Allow-Headers`: `Content-Type, Authorization, X-Requested-With, Cookie, Accept, Origin`
- `Set-Cookie`: JWT token cookie

## Common Issues and Solutions

### Issue: Cookies Not Being Sent
**Solution:** Ensure `credentials: 'include'` is set in frontend requests

### Issue: CORS Preflight Fails
**Solution:** Server properly handles OPTIONS requests with correct headers

### Issue: SameSite Cookie Warnings
**Solution:** 
- Development: Use `SameSite=Lax`
- Production: Use `SameSite=None` with `Secure=true`

### Issue: Cross-Origin Requests Blocked
**Solution:** Verify `ALLOWED_ORIGINS` includes your frontend domain

## Security Considerations

1. **HTTPS Required in Production**: `Secure` flag requires HTTPS
2. **Origin Validation**: Only allow trusted frontend domains
3. **Cookie Security**: HttpOnly prevents XSS attacks
4. **CORS Credentials**: Only enable for trusted origins

## Testing CORS

Run the CORS tests to verify configuration:

```bash
pnpm test:e2e --testNamePattern="CORS Configuration"
```

## Troubleshooting

### Check CORS Headers
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8000/auth/signin
```

### Verify Cookie Settings
Check browser DevTools → Application → Cookies to ensure:
- Cookie is set with correct domain
- HttpOnly flag is present
- SameSite and Secure flags are correct for environment

### Environment Variables
Ensure these are set correctly:
- `NODE_ENV`: Determines cookie security settings
- `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend domains
- `JWT_ACCESS_SECRET`: Strong secret for signing tokens
