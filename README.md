# Steam-Auth Microservice

> A serverless Next.js 13 microservice (App Router + TypeScript) that provides Steam OpenID login for multiple downstream apps.  
> Implements rotating refresh tokens with per-session IDs stored in Upstash Redis.

---

## Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [Prerequisites](#prerequisites)  
4. [Project Structure](#project-structure)  
5. [Environment Variables](#environment-variables)  
6. [Getting Started (Local)](#getting-started-local)  
   - [Install & Run](#install--run)  
   - [Testing Endpoints](#testing-endpoints)  
7. [Deploying to Vercel](#deploying-to-vercel)  
8. [Authentication Flow](#authentication-flow)  
9. [Session & Token Rotation](#session--token-rotation)  
10. [License](#license)  

---

## Overview

This microservice handles Steam OpenID login and issues both short-lived access tokens and rotating 7-day refresh tokens for each user session. It is designed to work serverless (e.g. on Vercel) and to be shared by multiple downstream apps that need Steam authentication.

- **Rotating Refresh Tokens**: Each login or refresh call uses a fresh `sessionId` and stores it in Redis under `refresh:<sessionId>`. Old sessions are revoked automatically to prevent replay attacks.  
- **Multi-Session Support**: Users can log in from multiple devices or apps; each one holds its own `sessionId` so you can revoke individual sessions without affecting others.  
- **Upstash Redis**: A serverless Redis database is used to track valid `sessionId` keys and optional metadata.

---

## Features

- Steam OpenID 2.0 login (no Passport.js – minimal external deps)  
- JWT‐based access tokens (15 minute TTL)  
- Rotating JWT refresh tokens (7 day TTL) stored in Upstash Redis  
- Per-session (per client/device) session ID for fine-grained revocation  
- Secure, HttpOnly, SameSite=Lax cookies for tokens  
- Built with Next.js 13 App Router (TypeScript)  
- Tailwind CSS + shadcn/ui for optional documentation UI  

---

## Prerequisites

1. **Node.js** v18 or newer  
2. **npm** (or yarn/pnpm)  
3. **Upstash Redis** account (free tier is fine)  
4. **Steam API Key** (register at https://steamcommunity.com/dev/apikey)  
5. **Steam Developer Console**: register the domain and return URL  
   - **Domain Name**: `localhost` (for local testing)  
   - **Return URL**: `http://localhost:3000/api/auth/callback`  

> **Optional**: If you plan to deploy on Vercel, install the [Vercel CLI](https://vercel.com/docs/cli).

## Environment Variables

Create a file named `.env.local` in the project root and populate it with your own values:

```bash
# .env.local
NODE_ENV=development

STEAM_API_KEY=<your-steam-api-key>
AUTH_SERVICE_URL=http://localhost:3000

# Must be ≥ 32 chars
JWT_SECRET=<a-very-long-random-secret>

UPSTASH_REDIS_REST_URL=https://<your-upstash-instance>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>
```

