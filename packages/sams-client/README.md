# @sams/client

Official SAMS (Steam Authentication MicroService) client SDK for easy Steam authentication integration.

## Installation

```bash
npm install @finndb/sams-client
# or
yarn add @finndb/sams-client
# or
pnpm add @finndb/sams-client
```

## Quick Start

### React/Next.js

```tsx
import { SamsProvider, useSteamAuth } from '@finndb/sams-client';

function App() {
  return (
    <SamsProvider samsUrl="https://your-sams-instance.com">
      <LoginPage />
    </SamsProvider>
  );
}

function LoginPage() {
  const { user, login, logout, loading } = useSteamAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <div>
          <img src={user.avatarUrl} alt="Avatar" />
          <h1>Welcome, {user.displayName}!</h1>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={login}>Login with Steam</button>
      )}
    </div>
  );
}
```

### Vanilla JavaScript

```javascript
import { SamsClient } from '@finndb/sams-client';

const client = new SamsClient({
  samsUrl: 'https://your-sams-instance.com'
});

// Login
document.getElementById('loginBtn').onclick = () => client.login();

// Check auth status
const user = await client.getUser();
if (user) {
  console.log('Logged in as:', user.displayName);
}
```

## API Reference

### SamsProvider

React context provider that wraps your app and provides SAMS configuration.

```tsx
<SamsProvider 
  samsUrl="https://your-sams-instance.com"
  onLogin={(user) => console.log('Logged in:', user)}
  onLogout={() => console.log('Logged out')}
  onError={(error) => console.error('Auth error:', error)}
>
  <App />
</SamsProvider>
```

### useSteamAuth

Main React hook for Steam authentication.

```tsx
const { 
  user,           // SteamUser | null
  loading,        // boolean
  error,          // SamsError | null
  login,          // () => void
  logout,         // () => Promise<void>
  refresh,        // () => void
  isAuthenticated // boolean
} = useSteamAuth();
```

### useSteamUser

Hook for fetching user data.

```tsx
const { 
  user,        // SteamUser | null
  loading,     // boolean
  refreshUser  // () => void
} = useSteamUser();
```

### useSteamSession

Hook for checking authentication status.

```tsx
const { 
  isAuthenticated, // boolean
  loading          // boolean
} = useSteamSession();
```

### SamsClient

Core client class for non-React usage.

```javascript
const client = new SamsClient({
  samsUrl: 'https://your-sams-instance.com'
});

await client.login();           // Redirect to Steam login
const user = await client.getUser(); // Get current user
await client.logout();          // Logout user
const isValid = await client.isAuthenticated(); // Check auth status
```

### Components

#### SteamLoginButton

Ready-to-use login button component.

```tsx
<SteamLoginButton 
  className="bg-blue-500 text-white px-4 py-2 rounded"
  onSuccess={(user) => console.log('Login successful:', user)}
>
  Sign in with Steam
</SteamLoginButton>
```

#### SteamUserProfile

User profile display component.

```tsx
<SteamUserProfile 
  showAvatar={true}
  showSteamId={false}
  showProfileLink={true}
  className="flex items-center space-x-4"
/>
```

## Types

### SteamUser

```typescript
interface SteamUser {
  steamId: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
}
```

### SamsConfig

```typescript
interface SamsConfig {
  samsUrl: string;
  autoRefresh?: boolean;
  storage?: 'cookies' | 'localStorage';
  onLogin?: (user: SteamUser) => void;
  onLogout?: () => void;
  onError?: (error: SamsError) => void;
}
```

## Error Handling

```tsx
const { error } = useSteamAuth();

if (error) {
  switch (error.code) {
    case 'LOGIN_ERROR':
      console.log('Login failed');
      break;
    case 'LOGOUT_ERROR':
      console.log('Logout failed');
      break;
    case 'AUTH_CHECK_ERROR':
      console.log('Auth check failed');
      break;
    default:
      console.log('Unknown error:', error.message);
  }
}
```

## Requirements

- React 16.8+ (for React hooks)
- A deployed SAMS instance
- Your domain added to SAMS allowed origins

## License

MIT
