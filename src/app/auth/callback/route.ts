import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const origin = requestUrl.origin;

  if (errorDescription) {
    return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(errorDescription)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent("인증 코드를 받지 못했습니다.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent("소셜 로그인 연결에 실패했습니다.")}`);
  }

  return NextResponse.redirect(origin);
}
