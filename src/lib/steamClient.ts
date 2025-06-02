import { getEnv } from "@/lib/env";

const ENV = getEnv();

export class SteamClient {
  static steamAuthUrl(state: string): string {
    const params = new URLSearchParams({
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": `${ENV.AUTH_SERVICE_URL}/api/auth/callback?state=${encodeURIComponent(
        state
      )}`,
      "openid.realm": ENV.AUTH_SERVICE_URL,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    });
    return `https://steamcommunity.com/openid/login?${params.toString()}`;
  }

  static async verifyCallback(
    query: Record<string, string>
  ): Promise<{ steamId: string }> {
    if (query["openid.mode"] !== "id_res") {
      throw new Error("Invalid OpenID mode");
    }

    const verifyParams = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => verifyParams.set(k, v));
    verifyParams.set("openid.mode", "check_authentication");

    const res = await fetch("https://steamcommunity.com/openid/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyParams,
    });
    const body = await res.text();
    if (!body.includes("is_valid:true")) {
      throw new Error("Steam OpenID verification failed");
    }

    const claimedId = query["openid.claimed_id"];
    const match = claimedId.match(/\/id\/(\d+)$/);
    if (!match) {
      throw new Error("SteamID not found in claimed_id");
    }
    return { steamId: match[1] };
  }
}
