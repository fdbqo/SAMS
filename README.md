# SAMS - Steam Authentication MicroService

> A complete Steam authentication solution with admin dashboard and SDK. Deploy your own instance and use the SDK in your applications.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fdbqo/SAMS)

## ⚡ TLDR - Get Running in 5 Minutes

```bash
# 1. Clone and install
git clone https://github.com/fdbqo/SAMS
cd sams
npm install

# 2. Create environment file
# Create .env.local with your credentials (see below)

# 3. Build and run
npm run build
npm start

# 4. Set up admin (first time only)
# Visit http://localhost:3000/admin and set your admin password

# 5. Use in your app
npm install @finndb/sams-client
```

**Required Environment Variables:**
```bash
STEAM_API_KEY=your_steam_api_key
JWT_SECRET=your_32_character_secret
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
AUTH_SERVICE_URL=http://localhost:3000
```

## 🚀 Quick Start

### 1. Deploy SAMS
```bash
git clone https://github.com/fdbqo/SAMS
cd sams
npm install
npm run build
npm start
```

### 2. Configure Environment
```bash
# .env.local
STEAM_API_KEY=your_steam_api_key
JWT_SECRET=your_32_character_secret
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
AUTH_SERVICE_URL=https://your-sams-domain.vercel.app
ALLOWED_ORIGINS=https://your-app.com,https://another-app.com
```

### 3. Use the SDK
```bash
npm install @finndb/sams-client
```

```tsx
import { SamsProvider, useSteamAuth } from '@finndb/sams-client';

function App() {
  return (
    <SamsProvider samsUrl="https://your-sams-domain.com">
      <LoginButton />
    </SamsProvider>
  );
}

function LoginButton() {
  const { user, login, logout } = useSteamAuth();
  
  return user ? (
    <div>
      <h1>Welcome, {user.displayName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  ) : (
    <button onClick={login}>Login with Steam</button>
  );
}
```

## ✨ Features

### 🔐 Authentication
- **Steam OpenID 2.0** - Secure Steam authentication
- **JWT Tokens** - 15-minute access tokens, 7-day refresh tokens
- **Session Management** - Multi-device support with individual session control
- **CORS Protection** - Dynamic origin validation via Redis

### 🎛️ Admin Dashboard
- **Origin Management** - Add/remove allowed domains
- **Configuration View** - Monitor system settings
- **Usage Statistics** - Track authentication metrics
- **Secure Access** - Redis-stored admin password with session management

### 📦 SDK Package
- **React Hooks** - `useSteamAuth`, `useSteamUser`, `useSteamSession`
- **React Components** - `SteamLoginButton`, `SteamUserProfile`
- **Vanilla JS Client** - Framework-agnostic authentication
- **TypeScript Support** - Full type definitions

### 🏗️ Architecture
- **Serverless Ready** - Deploy to Vercel, Railway, or any platform
- **Redis Storage** - Upstash Redis for session management
- **HttpOnly Cookies** - Secure token storage
- **Rate Limiting** - Built-in protection against abuse

## 📁 Project Structure

```
sams/
├── src/                    # SAMS application
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── admin/         # Admin dashboard
│   │   ├── docs/          # Documentation
│   │   └── login/         # Demo page
│   ├── components/        # React components
│   └── lib/               # Utilities
├── packages/
│   └── sams-client/       # SDK package
└── docs/                  # Documentation
```

## 🛠️ Development

### Build Everything
```bash
npm run build:all
```

### Build SDK Only
```bash
npm run build:sdk
```

### Run Development Server
```bash
npm run dev
```

## 📚 Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Get up and running in 5 minutes

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STEAM_API_KEY` | ✅ | Your Steam API key from [Steam Web API](https://steamcommunity.com/dev/apikey) |
| `JWT_SECRET` | ✅ | 32+ character secret for JWT signing |
| `UPSTASH_REDIS_REST_URL` | ✅ | Redis instance URL from [Upstash](https://upstash.com) |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Redis authentication token |
| `AUTH_SERVICE_URL` | ✅ | Your SAMS instance URL |
| `ALLOWED_ORIGINS` | ❌ | Comma-separated list of allowed origins (optional) |

**Note:** Admin password is now stored securely in Redis and set during first admin login.

## 🚀 Deployment

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fdbqo/SAMS)


### Manual
```bash
npm run build
npm start
```

## 📖 Usage Examples

### React/Next.js
```tsx
import { SamsProvider, useSteamAuth } from '@finndb/sams-client';

export default function App() {
  return (
    <SamsProvider samsUrl="https://your-sams.com">
      <AuthPage />
    </SamsProvider>
  );
}
```


### Vanilla JavaScript
```html
<script src="https://unpkg.com/@finndb/sams-client@latest/dist/index.js"></script>
<script>
const client = new SamsClient({
  samsUrl: 'https://your-sams.com'
});

document.getElementById('loginBtn').onclick = () => client.login();
</script>
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Steam Web API](https://developer.valvesoftware.com/wiki/Steam_Web_API) for authentication
- [Upstash](https://upstash.com) for serverless Redis
- [Next.js](https://nextjs.org) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for styling

