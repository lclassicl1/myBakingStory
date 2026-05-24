"use server";

import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";

import { withMessage } from "@/lib/redirect-message";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSignupErrorMessage(error: AuthError) {
  const message = error.message.toLowerCase();

  if (error.code === "email_provider_disabled" || message.includes("email signups are disabled")) {
    return "Supabase 이메일 회원가입이 비활성화되어 있습니다. Authentication > Sign In / Providers > Email에서 Email provider를 켜 주세요.";
  }

  if (error.code === "over_email_send_rate_limit" || message.includes("rate limit")) {
    return "인증 메일 발송 한도를 초과했습니다. 잠시 후 다시 시도하거나, 개발 중에는 Supabase에서 이메일 확인을 잠시 꺼 주세요.";
  }

  if (message.includes("database error")) {
    return "회원 정보 저장 중 오류가 발생했습니다. Supabase profiles 테이블과 회원 생성 trigger 설정을 확인해 주세요.";
  }

  if (message.includes("already") || message.includes("registered")) {
    return "이미 가입된 이메일입니다. 로그인하거나 다른 이메일을 사용해 주세요.";
  }

  if (message.includes("password")) {
    return "비밀번호 조건을 확인해 주세요. 8자 이상, 문자와 숫자를 함께 사용하는 것을 권장합니다.";
  }

  if (message.includes("email")) {
    return "이메일 주소 또는 Supabase 이메일 인증 설정을 확인해 주세요.";
  }

  if (process.env.NODE_ENV !== "production") {
    return `회원가입에 실패했습니다. Supabase 응답: ${error.message}`;
  }

  return "회원가입에 실패했습니다. 입력 정보를 다시 확인해 주세요.";
}

export async function signupWithEmail(formData: FormData) {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!nickname || !email || !password || !passwordConfirm) {
    redirect(withMessage("/signup", "닉네임, 이메일, 비밀번호를 모두 입력해 주세요."));
  }

  if (password !== passwordConfirm) {
    redirect(withMessage("/signup", "비밀번호와 비밀번호 확인이 일치하지 않습니다."));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
        role: "user",
      },
    },
  });

  if (error) {
    console.error("Supabase signup failed", {
      code: error.code,
      message: error.message,
      name: error.name,
      status: error.status,
    });

    redirect(withMessage("/signup", getSignupErrorMessage(error)));
  }

  redirect(withMessage("/login", "회원가입이 완료되었습니다. 이메일 확인이 필요하면 메일함을 확인해 주세요."));
}
