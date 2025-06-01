// src/app/login/page.tsx
"use client";

import React, { useEffect, useState } from "react";

interface SteamProfile {
  steamId: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
}

export default function LoginPage() {
  const [profile, setProfile] = useState<SteamProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data: SteamProfile = await res.json();
          setProfile(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  if (loading) {
    return <p className="p-6 text-center">Loading…</p>;
  }

  if (!profile) {
    return (
      <main className="flex flex-col items-center justify-center h-screen p-6">
        <h1 className="text-3xl font-bold mb-4">Login with Steam</h1>
        <a
          href={`/api/auth/steam?origin=${encodeURIComponent(origin + "/login")}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
        >
          Sign in via Steam
        </a>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen p-6">
      <img
        src={profile.avatarUrl}
        alt="Avatar"
        className="rounded-full w-32 h-32 mb-4"
      />
      <h2 className="text-2xl font-semibold mb-2">{profile.displayName}</h2>
      <p className="text-gray-600 mb-4">Steam ID: {profile.steamId}</p>
      <a
        href={profile.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        View Steam Profile
      </a>
    </main>
  );
}
