# SDK Usage Examples

## Basic Setup

```tsx
import { SamsProvider, useSteamAuth } from '@finndb/sams-client';

function App() {
  return (
    <SamsProvider samsUrl="https://your-sams-instance.vercel.app">
      <YourApp />
    </SamsProvider>
  );
}
```

## React Hook Usage

```tsx
import { useSteamAuth } from '@finndb/sams-client';

function LoginComponent() {
  const { user, login, logout, loading, error } = useSteamAuth();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.displayName}!</h1>
          <img src={user.avatarUrl} alt="Avatar" />
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={login}>Login with Steam</button>
      )}
    </div>
  );
}
```

## Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/@finndb/sams-client@latest/dist/index.js"></script>
</head>
<body>
  <button id="loginBtn">Login with Steam</button>
  <div id="userInfo"></div>

  <script>
    const client = new SamsClient({
      samsUrl: 'https://your-sams-instance.vercel.app'
    });

    document.getElementById('loginBtn').onclick = () => client.login();

    // Check if user is logged in
    client.getUser().then(user => {
      if (user) {
        document.getElementById('userInfo').innerHTML = `
          <h1>Welcome, ${user.displayName}!</h1>
          <img src="${user.avatarUrl}" alt="Avatar" />
        `;
      }
    });
  </script>
</body>
</html>
```

## Environment Variables

For Next.js apps, use environment variables:

```bash
# .env.local
NEXT_PUBLIC_SAMS_URL=https://your-sams-instance.vercel.app
```

```tsx
const SAMS_URL = process.env.NEXT_PUBLIC_SAMS_URL || 'https://your-sams-instance.vercel.app';
```
