"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"
export function OAuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      {/* Apple SDK — uncomment when NEXT_PUBLIC_APPLE_CLIENT_ID is configured
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        onLoad={() => {
          const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID
          if (!clientId || !(window as any).AppleID) return
          ;(window as any).AppleID.auth.init({
            clientId,
            scope: "email name",
            redirectURI: window.location.origin,
            usePopup: true,
          })
        }}
      />
      */}
      {children}
    </GoogleOAuthProvider>
  )
}
