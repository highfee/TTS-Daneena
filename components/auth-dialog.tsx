"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useGoogleLogin } from "@react-oauth/google";

export function AuthDialog() {
  const { isAuthDialogOpen, closeAuthDialog, setUser } = useAuthStore();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [token, setToken] = useState("");

  // ── Shared: send provider token to backend ──────────────────────────────
  const handleOAuthSuccess = async (
    provider: string,
    tokenPayload: { access_token?: string; id_token?: string }
  ) => {
    try {
      const res = await fetch(`/api/auth/oauth/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(tokenPayload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || `${provider} sign-in failed. Please try again.`);
        return;
      }
      setUser({
        id: data.user_id,
        email: data.email ?? "",
        name: data.email?.split("@")[0] ?? provider,
        accessToken: data.access_token,
      });
      toast({ title: "Login successful" });
      closeAuthDialog();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setOauthLoading(null);
    }
  };

  // ── Google ───────────────────────────────────────────────────────────────
  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) =>
      handleOAuthSuccess("google", { access_token: tokenResponse.access_token }),
    onError: () => {
      setError("Google sign-in failed. Please try again.");
      setOauthLoading(null);
    },
  });

  const handleGoogleClick = () => {
    setError("");
    setOauthLoading("google");
    googleLogin();
  };

  // ── Microsoft (commented out — not yet configured) ──────────────────────
  // const handleMicrosoftLogin = async () => {
  //   setError("");
  //   setOauthLoading("microsoft");
  //   try {
  //     const { PublicClientApplication } = await import("@azure/msal-browser");
  //     const msal = new PublicClientApplication({
  //       auth: {
  //         clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!,
  //         authority: "https://login.microsoftonline.com/common",
  //         redirectUri: window.location.origin,
  //       },
  //       cache: { cacheLocation: "sessionStorage", storeAuthStateInCookie: false },
  //     });
  //     await msal.initialize();
  //     const result = await msal.loginPopup({
  //       scopes: ["openid", "profile", "email", "User.Read"],
  //     });
  //     await handleOAuthSuccess("microsoft", { access_token: result.accessToken });
  //   } catch (e: any) {
  //     if (e?.errorCode !== "user_cancelled") {
  //       setError("Microsoft sign-in failed. Please try again.");
  //     }
  //     setOauthLoading(null);
  //   }
  // };

  // ── Apple (commented out — not yet configured) ───────────────────────────
  // const handleAppleLogin = async () => {
  //   setError("");
  //   setOauthLoading("apple");
  //   try {
  //     const appleAuth = (window as any).AppleID?.auth;
  //     if (!appleAuth) {
  //       setError("Apple Sign In is not available. Please try again.");
  //       setOauthLoading(null);
  //       return;
  //     }
  //     const response = await appleAuth.signIn();
  //     await handleOAuthSuccess("apple", { id_token: response.authorization.id_token });
  //   } catch (e: any) {
  //     if (e?.error !== "popup_closed_by_user") {
  //       setError("Apple sign-in failed. Please try again.");
  //     }
  //     setOauthLoading(null);
  //   }
  // };

  // ── Email / token flow ───────────────────────────────────────────────────
  const handleContinue = async () => {
    if (!email) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.detail || "An error occurred. Please try again.");
        return;
      }
      setShowTokenInput(true);
      toast({
        title: "Token sent",
        description: "A verification token has been sent to your email.",
      });
    } catch {
      setLoading(false);
      setError("An error occurred. Please try again.");
    }
  };

  const handleVerifyToken = async () => {
    if (!email || !token) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.detail || "Invalid token. Please try again.");
        return;
      }
      setUser({
        id: data.user_id,
        email: data.email ?? email,
        name: email.split("@")[0],
        accessToken: data.access_token,
      });
      toast({ title: "Login successful" });
      closeAuthDialog();
      setEmail("");
      setToken("");
      setShowTokenInput(false);
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isAuthDialogOpen} onOpenChange={closeAuthDialog}>
      <DialogContent className="max-w-md border-border/40 bg-[#2f2f2f] p-0 text-white sm:rounded-2xl">
        <div className="relative p-8">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-semibold">Log in or sign up</h2>
            <p className="text-sm text-gray-400">
              You'll get smarter responses and can upload files, images, and more.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded bg-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Google */}
            <Button
              variant="outline"
              className="w-full justify-center gap-3 border-border/40 bg-transparent py-6 text-base font-normal hover:bg-white/5"
              onClick={handleGoogleClick}
              disabled={!!oauthLoading}
            >
              {oauthLoading === "google" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </Button>

            {/* Apple — commented out until configured
            <Button
              variant="outline"
              className="w-full justify-center gap-3 border-border/40 bg-transparent py-6 text-base font-normal hover:bg-white/5"
              onClick={handleAppleLogin}
              disabled={!!oauthLoading}
            >
              {oauthLoading === "apple" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              )}
              Continue with Apple
            </Button>
            */}

            {/* Microsoft — commented out until configured
            <Button
              variant="outline"
              className="w-full justify-center gap-3 border-border/40 bg-transparent py-6 text-base font-normal hover:bg-white/5"
              onClick={handleMicrosoftLogin}
              disabled={!!oauthLoading}
            >
              {oauthLoading === "microsoft" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#f25022" d="M11.4 11.4H2V2h9.4v9.4z" />
                  <path fill="#00a4ef" d="M22 11.4h-9.4V2H22v9.4z" />
                  <path fill="#7fba00" d="M11.4 22H2v-9.4h9.4V22z" />
                  <path fill="#ffb900" d="M22 22h-9.4v-9.4H22V22z" />
                </svg>
              )}
              Continue with Microsoft
            </Button>
            */}

            <Button
              variant="outline"
              className="w-full justify-center gap-3 border-border/40 bg-transparent py-6 text-base font-normal hover:bg-white/5"
              disabled
            >
              <Phone className="h-5 w-5" />
              Continue with phone
            </Button>
          </div>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-sm text-gray-500">OR</span>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-border/40 bg-transparent py-6 text-base placeholder:text-gray-500"
              onKeyDown={(e) => { if (e.key === "Enter") handleContinue(); }}
            />

            {showTokenInput && (
              <div className="flex items-center gap-1">
                <Input
                  type="text"
                  placeholder="Enter the token sent to your email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="border-border/40 bg-transparent py-6 text-base placeholder:text-gray-500"
                  onKeyDown={(e) => { if (e.key === "Enter") handleVerifyToken(); }}
                />
                <Button
                  variant="ghost"
                  className="min-h-full! hover:bg-transparent! text-sm px-0"
                  onClick={() => {
                    setShowTokenInput(false);
                    setToken("");
                    handleContinue();
                  }}
                  disabled={loading}
                >
                  Resend Token
                </Button>
              </div>
            )}

            {showTokenInput ? (
              <Button
                className="w-full bg-white py-6 text-base font-medium text-black hover:bg-gray-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                onClick={handleVerifyToken}
                disabled={loading || !token}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Token"}
              </Button>
            ) : (
              <Button
                className="w-full bg-white py-6 text-base font-medium text-black hover:bg-gray-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                onClick={handleContinue}
                disabled={loading || !email}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue with email"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
