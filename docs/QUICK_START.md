# Quick Start Guide

Deploy your own SAMS instance and get it running in 5 minutes!

## 1. Deploy SAMS

### Option A: Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fdbqo/SAMS)

### Option B: Manual Deployment
```bash
git clone https://github.com/fdbqo/SAMS
cd sams
npm install
npm run build
npm start
```

## 2. Configure Environment

Create `.env.local` with your credentials:

```bash
# Required
STEAM_API_KEY=your_steam_api_key_here
JWT_SECRET=your_32_character_secret_here
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
AUTH_SERVICE_URL=https://your-sams-domain.com

# Optional
ALLOWED_ORIGINS=https://your-app.com,https://another-app.com
```

**Note:** Admin password is now stored securely in Redis and will be set during your first admin login.

### Getting Your Credentials

#### Steam API Key
1. Go to [Steam Web API](https://steamcommunity.com/dev/apikey)
2. Register your domain
3. Copy your API key

#### Upstash Redis
1. Sign up at [Upstash](https://upstash.com)
2. Create a Redis database
3. Copy the REST URL and token

#### JWT Secret
Generate a secure 32+ character secret:
```bash
openssl rand -base64 32
```

## 3. Configure Steam

1. Go to [Steam Developer Console](https://steamcommunity.com/dev/apikey)
2. Add your domain:
   - **Domain Name**: `your-sams-domain.com`
   - **Return URL**: `https://your-sams-domain.com/api/auth/callback`

## 4. Test Your Setup

1. Visit your SAMS instance
2. Go to `/admin` and set your admin password (first time only)
3. Add your domain to allowed origins
4. Test the login flow at `/login`

## 5. Use in Your App

### Install SDK
```bash
npm install @finndb/sams-client
```

### React/Next.js
```tsx
import { SamsProvider, useSteamAuth } from '@finndb/sams-client';

function App() {
  return (
    <SamsProvider samsUrl="https://your-sams-domain.vercel.app">
      <LoginPage />
    </SamsProvider>
  );
}

function LoginPage() {
  const { user, login, logout } = useSteamAuth();
  
  return user ? (
    <div>
      <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full" />
      <h1>Welcome, {user.displayName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  ) : (
    <button onClick={login}>Login with Steam</button>
  );
}
```

**That's it!** No additional setup required. The SDK automatically handles:
- ✅ Authentication cookies
- ✅ Token refresh
- ✅ Session management
- ✅ Cross-domain security

### Vanilla JavaScript
```html
<script src="https://unpkg.com/@finndb/sams-client@latest/dist/index.js"></script>
<script>
const client = new SamsClient({
  samsUrl: 'https://your-sams-domain.vercel.app'
});

document.getElementById('loginBtn').onclick = () => client.login();

// Check if user is logged in
client.getUser().then(user => {
  if (user) {
    console.log('Welcome,', user.displayName);
    document.getElementById('userInfo').innerHTML = `
      <img src="${user.avatarUrl}" alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%;">
      <span>${user.displayName}</span>
    `;
  }
});
</script>
```

## 6. Add Your Domain

1. Go to your SAMS admin dashboard
2. Navigate to "Sites" 
3. Add your application's domain
4. Your app can now authenticate users!

## Troubleshooting

### Common Issues

**"Origin not allowed" error**
- Add your domain to allowed origins in admin dashboard
- Ensure your domain is added to the SAMS admin panel

**"Steam login failed"**
- Check your Steam API key and domain configuration
- Ensure return URL matches exactly in Steam developer console

**"Authentication cookies not working"**
- Verify your domain is added to allowed origins
- Check that your SAMS instance is deployed and accessible
- Ensure you're using HTTPS in production

**"Redis connection failed"**
- Verify your Upstash credentials
- Check if your Redis instance is active

**"Admin login not working"**
- Make sure you've set your admin password during first login
- Check Redis connection is working properly

### Getting Help

- Check the [API Reference](API_REFERENCE.md)
- Review [Integration Guide](INTEGRATION_GUIDE.md)
- Open an issue on GitHub

## Next Steps

- [Integration Guide](INTEGRATION_GUIDE.md) - Framework-specific examples
- [API Reference](API_REFERENCE.md) - Complete API documentation
- [Deployment Guide](DEPLOYMENT.md) - Production deployment tips
