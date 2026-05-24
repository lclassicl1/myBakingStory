"use server";

import { redirect } from "next/navigation";

import { withMessage } from "@/lib/redirect-message";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loginWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(withMessage("/login", "이메일과 비밀번호를 입력해 주세요."));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(withMessage("/login", "이메일 또는 비밀번호를 확인해 주세요."));
  }

  redirect("/");
}
