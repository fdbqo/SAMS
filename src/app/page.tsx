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
      path: "/api/auth/steam?origin={YOUR_APP_URL}",
      description:
        "Begins the Steam OpenID login flow. Provide your front-end’s `origin` as a query parameter. Redirects to Steam’s login.",
      params: ["origin (required)"],
    },
    {
      method: "GET",
      path: "/api/auth/callback?state={STATE}&openid.*",
      description:
        "Steam’s callback URL. Verifies OpenID response, issues access + refresh tokens, sets cookies, and redirects back to the stored origin.",
      params: ["state (required)", "openid.* parameters from Steam"],
    },
    {
      method: "POST",
      path: "/api/auth/verify",
      description:
        "Verifies a given access token. Accepts JSON `{ token: string }`. Returns `{ valid: true, user: { steamId } }` or `401` if invalid.",
      params: ["token (in JSON body)"],
    },
    {
      method: "POST",
      path: "/api/auth/refresh",
      description:
        "Rotates tokens using the `steam_refresh` cookie. Issues new access + refresh tokens, sets cookies. Returns `{ success: true }` or `401` if refresh is invalid.",
      params: ["steam_refresh cookie (automatically sent)"],
    },
  ];

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Steam-Auth Microservice</h1>
      <p className="text-gray-700 mb-8">
        This service handles Steam OpenID login, issues access & refresh tokens,
        and provides verification/refresh endpoints. Use these endpoints in your
        Next.js or React apps to authenticate via Steam.
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
