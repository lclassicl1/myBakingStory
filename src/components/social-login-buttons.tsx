"use client";

import { Chrome, MessageCircle } from "lucide-react";
import { useState } from "react";

const providerMessages = {
  google: "Google 로그인은 Supabase Google provider 키를 연결한 뒤 활성화됩니다.",
  kakao: "Kakao 로그인은 Kakao Developers 앱 키를 Supabase에 연결한 뒤 활성화됩니다.",
};

export function SocialLoginButtons() {
  const [message, setMessage] = useState("");

  return (
    <div className="social-login" aria-label="소셜 로그인">
      <button className="social-button social-button--google" type="button" onClick={() => setMessage(providerMessages.google)}>
        <Chrome aria-hidden="true" size={18} />
        Google로 계속하기
      </button>
      <button className="social-button social-button--kakao" type="button" onClick={() => setMessage(providerMessages.kakao)}>
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
