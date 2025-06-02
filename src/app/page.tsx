// src/app/page.tsx
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const endpoints = [
    {
      method: "GET",
      path: "/api/auth/steam?origin={ORIGIN}&redirectTo={PATH}",
      description:
        "Begin Steam login flow. Provide your front-end’s origin + path (redirectTo).",
      params: ["origin", "redirectTo (optional)"],
    },
    {
      method: "GET",
      path: "/api/auth/callback?state={STATE}&openid.*",
      description:
        "Steam callback endpoint. Verifies OpenID, issues tokens, and redirects to origin+redirectTo.",
      params: ["state", "openid.* from Steam"],
    },
    {
      method: "POST",
      path: "/api/auth/verify",
      description:
        "Verify an access token. Body: { token: string }. Returns { valid: true, user: { steamId } }. 401 if invalid.",
      params: ["token (in JSON body)"],
    },
    {
      method: "POST",
      path: "/api/auth/refresh",
      description:
        "Rotate tokens using the refresh cookie. Issues new tokens. 401 if refresh invalid. Rate-limited.",
      params: ["steam_refresh cookie (auto)"],
    },
    {
      method: "POST",
      path: "/api/auth/logout",
      description:
        "Logout current session: revokes the refresh session and clears cookies. Returns { success: true }. ",
      params: ["steam_refresh cookie (auto)"],
    },
    {
      method: "GET",
      path: "/api/auth/me",
      description:
        "Retrieve current user’s Steam profile (steam_access cookie auto). Returns { steamId, displayName, avatarUrl, profileUrl } or 401.",
      params: ["steam_access cookie (auto)"],
    },
  ];

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Steam-Auth Microservice</h1>
      <p className="text-gray-700 mb-8">
        Use these endpoints in your Next.js or React apps to authenticate via Steam.
      </p>

      <div className="space-y-6">
        {endpoints.map((ep) => (
          <Card key={ep.path} className="border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-mono">{ep.method}</span>
                <span className="text-lg font-semibold">{ep.path}</span>
                <Badge variant="secondary">{ep.method}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-2 text-gray-600">
                {ep.description}
              </CardDescription>
              <h3 className="font-medium mt-4">Parameters:</h3>
              <ul className="list-disc list-inside text-gray-700">
                {ep.params.map((param) => (
                  <li key={param} className="ml-2">
                    <code className="bg-gray-100 px-1 rounded">{param}</code>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
