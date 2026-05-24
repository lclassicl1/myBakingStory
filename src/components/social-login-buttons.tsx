"use client";

import { Chrome, MessageCircle } from "lucide-react";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type SocialProvider = "google" | "kakao";

const providerLabels: Record<SocialProvider, string> = {
  google: "Google",
  kakao: "Kakao",
};

export function SocialLoginButtons() {
  const [message, setMessage] = useState("");

  async function handleOAuth(provider: SocialProvider) {
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(`${providerLabels[provider]} 로그인 설정을 확인해 주세요.`);
    }
  }

  return (
    <div className="social-login" aria-label="소셜 로그인">
      <button className="social-button social-button--google" type="button" onClick={() => void handleOAuth("google")}>
        <Chrome aria-hidden="true" size={18} />
        Google로 계속하기
      </button>
      <button className="social-button social-button--kakao" type="button" onClick={() => void handleOAuth("kakao")}>
        <MessageCircle aria-hidden="true" size={18} />
        Kakao로 계속하기
      </button>
      {message ? (
        <p className="inline-notice" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
