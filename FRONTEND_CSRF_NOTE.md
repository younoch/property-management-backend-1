# 🛡️ CSRF Protection - Frontend Implementation Note

## Quick Overview
CSRF protection prevents malicious websites from making unauthorized requests on behalf of your users. You need to include a CSRF token in all state-changing requests (POST, PUT, DELETE, PATCH).

## 🔑 Key Points

### 1. **Get CSRF Token After Login**
```javascript
// After successful login, immediately get CSRF token
const response = await fetch('/csrf/token', {
  credentials: 'include'  // Important: Include cookies
});

const csrfToken = response.headers.get('X-CSRF-Token');
// Store this token for use in subsequent requests
```

### 2. **Include Token in All State-Changing Requests**
```javascript
// ✅ CORRECT - Include CSRF token
fetch('/auth/signout', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken  // ← Required for CSRF protection
  }
});

// ❌ WRONG - Missing CSRF token
fetch('/auth/signout', {
  method: 'POST',
  credentials: 'include'
  // Missing X-CSRF-Token header
});
```

### 3. **Required Headers for Protected Endpoints**
```javascript
const protectedRequest = (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include',  // Always include cookies
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,  // Always include CSRF token
      ...options.headers
    }
  });
};
```

## 📋 Protected Endpoints (Require CSRF Token)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/auth/signout` | User logout |
| `PATCH` | `/auth/:id` | Update user |
| `DELETE` | `/auth/:id` | Delete user |
| `POST` | `/csrf/refresh` | Refresh CSRF token |

## 🚀 Implementation Examples

### Vanilla JavaScript
```javascript
class CsrfManager {
  constructor() {
    this.token = null;
  }

  async getToken() {
    const response = await fetch('/csrf/token', { credentials: 'include' });
    this.token = response.headers.get('X-CSRF-Token');
    return this.token;
  }

  async makeProtectedRequest(url, options = {}) {
    if (!this.token) await this.getToken();
    
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'X-CSRF-Token': this.token,
        ...options.headers
      }
    });
  }
}

// Usage
const csrf = new CsrfManager();
await csrf.getToken(); // After login
await csrf.makeProtectedRequest('/auth/signout', { method: 'POST' });
```

### React Hook
```typescript
import { useState, useCallback } from 'react';

export const useCsrf = () => {
  const [token, setToken] = useState<string | null>(null);

  const getToken = useCallback(async () => {
    const response = await fetch('/csrf/token', { credentials: 'include' });
    const newToken = response.headers.get('X-CSRF-Token');
    setToken(newToken);
    return newToken;
  }, []);

  const protectedRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    if (!token) await getToken();
    
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'X-CSRF-Token': token!,
        ...options.headers
      }
    });
  }, [token, getToken]);

  return { token, getToken, protectedRequest };
};

// Usage in component
const { token, getToken, protectedRequest } = useCsrf();

useEffect(() => {
  getToken(); // After login
}, [getToken]);

const handleLogout = () => {
  protectedRequest('/auth/signout', { method: 'POST' });
};
```

### Axios Interceptor
```javascript
import axios from 'axios';

// Create axios instance with CSRF support
const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

// Add CSRF token to all requests
api.interceptors.request.use((config) => {
  const csrfToken = localStorage.getItem('csrfToken'); // Or get from state
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// Handle CSRF token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh CSRF token
      const response = await axios.get('/csrf/token', { withCredentials: true });
      const newToken = response.headers['x-csrf-token'];
      localStorage.setItem('csrfToken', newToken);
      
      // Retry original request
      error.config.headers['X-CSRF-Token'] = newToken;
      return axios.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

## ⚠️ Common Mistakes

1. **Forgetting `credentials: 'include'`**
   ```javascript
   // ❌ Wrong
   fetch('/csrf/token'); // Cookies won't be sent
   
   // ✅ Correct
   fetch('/csrf/token', { credentials: 'include' });
   ```

2. **Missing CSRF Token Header**
   ```javascript
   // ❌ Wrong - Will get 401 Unauthorized
   fetch('/auth/signout', { method: 'POST', credentials: 'include' });
   
   // ✅ Correct
   fetch('/auth/signout', {
     method: 'POST',
     credentials: 'include',
     headers: { 'X-CSRF-Token': csrfToken }
   });
   ```

3. **Not Handling Token Expiry**
   ```javascript
   // ❌ Wrong - No error handling
   const response = await fetch('/auth/signout', { ... });
   
   // ✅ Correct - Handle 401 and refresh token
   try {
     const response = await fetch('/auth/signout', { ... });
   } catch (error) {
     if (error.status === 401) {
       await refreshCsrfToken();
       // Retry request
     }
   }
   ```

## 🔄 Token Refresh Strategy

```javascript
const refreshCsrfToken = async () => {
  const response = await fetch('/csrf/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRF-Token': currentToken // Use current token to refresh
    }
  });
  
  const newToken = response.headers.get('X-CSRF-Token');
  // Update stored token
  return newToken;
};
```

## 📱 Mobile/App Considerations

- **Native Apps**: Include CSRF token in all API requests
- **PWA**: Same as web - include in headers
- **Mobile Web**: Ensure cookies are enabled and sent

## 🧪 Testing

Test CSRF protection by:
1. Making a request without CSRF token → Should get 401
2. Making a request with invalid token → Should get 401
3. Making a request with valid token → Should succeed

## 🆘 Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Missing CSRF token | Include `X-CSRF-Token` header |
| `CSRF token missing` | No token in header | Get token from `/csrf/token` |
| `CSRF token invalid` | Token expired/wrong | Refresh token from `/csrf/refresh` |
| CORS errors | Missing credentials | Add `credentials: 'include'` |

## 📚 Quick Reference

```javascript
// 1. Get token after login
const token = await fetch('/csrf/token', { credentials: 'include' })
  .then(res => res.headers.get('X-CSRF-Token'));

// 2. Use in all protected requests
fetch('/protected-endpoint', {
  method: 'POST',
  credentials: 'include',
  headers: { 'X-CSRF-Token': token }
});

// 3. Refresh when needed
fetch('/csrf/refresh', {
  method: 'POST',
  credentials: 'include',
  headers: { 'X-CSRF-Token': token }
});
```

**Remember**: Always include `credentials: 'include'` and `X-CSRF-Token` header for state-changing operations!
