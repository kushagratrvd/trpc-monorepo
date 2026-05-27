"use client"

import { useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSignInWithGoogle } from "~/hooks/api/auth"

function GoogleCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get("code")
  const { signInWithGoogleAsync } = useSignInWithGoogle()
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (code && !hasAttempted.current) {
      hasAttempted.current = true;
      signInWithGoogleAsync({ code })
        .then(() => {
          router.replace("/dashboard")
        })
        .catch((err) => {
          console.error("Google Auth Error", err)
          router.replace("/login?error=GoogleAuthFailed")
        })
    } else if (!code) {
      router.replace("/login")
    }
  }, [code, router, signInWithGoogleAsync])

  return null
}

export default function GoogleCallbackPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="size-8 border-4 border-[#84cc16] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-mono text-slate-400">
          <Suspense fallback="Loading...">
            <GoogleCallbackContent />
          </Suspense>
          Authenticating with Google...
        </p>
      </div>
    </div>
  )
}
