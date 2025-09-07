"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

interface SteamProfile {
  steamId: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
}

export default function LoginPage() {
  const [profile, setProfile] = useState<SteamProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setProfile(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex items-center space-x-3">
          <Spinner size="md" />
          <span className="text-sm text-white font-mono">Loading...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-8">
          {/* Back Button */}
          <div className="flex justify-start">
            <a
              href="/"
              className="text-xs font-mono text-gray-400 hover:text-white transition-colors flex items-center"
            >
              &lt; back_to_home
            </a>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-mono font-bold text-white">
              Steam Authentication Demo
            </h1>
            <p className="mt-2 text-xs text-gray-400 font-mono">
              Test the Steam authentication flow
            </p>
          </div>

          {/* Demo Information */}
          <div className="bg-gray-900/50 border border-gray-800 rounded p-6 space-y-4">
            <h2 className="text-sm font-mono font-medium text-white">What This Demo Does:</h2>
            <div className="space-y-3 text-xs font-mono text-gray-300">
              <div className="flex items-start space-x-2">
                <span className="text-green-400 mt-0.5">&gt;</span>
                <span>Authenticates you via Steam OpenID 2.0</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-400 mt-0.5">&gt;</span>
                <span>Retrieves your Steam profile information</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-400 mt-0.5">&gt;</span>
                <span>Sets secure HttpOnly cookies for session management</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-400 mt-0.5">&gt;</span>
                <span>Demonstrates JWT token generation and refresh</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-400 mt-0.5">&gt;</span>
                <span>Shows how your app would receive user data</span>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400 font-mono">
                This is a live demo of the SAMS authentication service. 
                Click below to authenticate with your Steam account.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <a
              href={`/api/auth/steam?origin=${encodeURIComponent(
                origin
              )}&redirectTo=${encodeURIComponent(pathname)}`}
              className="inline-block bg-green-600 text-black px-6 py-3 rounded text-sm font-mono font-medium hover:bg-green-700 transition-colors"
            >
              &gt; login_with_steam
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-8">
        {/* Back Button */}
        <div className="flex justify-start">
          <a
            href="/"
            className="text-xs font-mono text-gray-400 hover:text-white transition-colors flex items-center"
          >
            &lt; back_to_home
          </a>
        </div>

        <div className="text-center">
          <h1 className="text-xl font-mono font-bold text-white">
            Steam Authentication Demo
          </h1>
          <p className="mt-2 text-xs text-gray-400 font-mono">
            Successfully authenticated
          </p>
        </div>
        
        <div className="bg-gray-900/50 border border-gray-800 rounded p-6">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="text-sm font-mono font-medium text-white">
                {profile.displayName}
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Steam ID: {profile.steamId}
              </p>
              <a
                href={profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline text-xs font-mono"
              >
                &gt; view_profile
              </a>
            </div>
          </div>

          {/* Authentication Details */}
          <div className="bg-gray-800/50 border border-gray-700 rounded p-4 mb-4">
            <h4 className="text-xs font-mono font-medium text-white mb-2">Authentication Details:</h4>
            <div className="space-y-2 text-xs font-mono text-gray-300">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">&gt;</span>
                <span>Access token: Generated and stored in HttpOnly cookie</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">&gt;</span>
                <span>Refresh token: Available for token renewal</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">&gt;</span>
                <span>Session: Active and managed by SAMS</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full bg-red-600 text-white py-2 px-4 rounded text-xs font-mono hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
          >
            {loggingOut ? (
              <>
                <Spinner size="sm" />
                <span>Logging out...</span>
              </>
            ) : (
              <span>&gt; logout</span>
            )}
          </button>
        </div>

        {/* Integration Info */}
        <div className="bg-gray-900/30 border border-gray-700 rounded p-4">
          <h4 className="text-xs font-mono font-medium text-white mb-2">For Your App:</h4>
          <p className="text-xs text-gray-400 font-mono mb-2">
            Your application would receive this user data via the /api/auth/me endpoint 
            after successful authentication. The session is managed automatically with 
            secure cookies and JWT tokens.
          </p>
          <a
            href="/docs"
            className="text-blue-400 hover:underline text-xs font-mono"
          >
            &gt; view_integration_docs
          </a>
        </div>
      </div>
    </div>
  );
}
