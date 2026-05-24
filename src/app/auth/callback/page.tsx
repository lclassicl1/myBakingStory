import Link from "next/link";

import { PageHeader } from "@/components/page-header";

type AuthCallbackPageProps = {
  searchParams?: Promise<{
    code?: string;
    error?: string;
    error_description?: string;
  }>;
};

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const params = await searchParams;
  const hasCode = Boolean(params?.code);
  const hasError = Boolean(params?.error);

  return (
    <main className="app-shell">
      <PageHeader activeAuth="login" />

      <section className="notice-panel auth-callback" aria-live="polite">
        <p className="eyebrow">Auth callback</p>
        {hasError ? (
          <>
            <h1>로그인 연결 중 오류가 발생했습니다.</h1>
            <p>{params?.error_description ?? "OAuth provider 설정을 확인해 주세요."}</p>
          </>
        ) : hasCode ? (
          <>
            <h1>인증 코드를 받았습니다.</h1>
            <p>Supabase client 연결 후 이 화면에서 세션 쿠키를 저장하고 메인화면으로 이동합니다.</p>
          </>
        ) : (
          <>
            <h1>인증 콜백 준비 중입니다.</h1>
            <p>Google/Kakao 로그인 후 돌아올 주소입니다. 실제 provider 연결 후 세션 처리 로직을 추가합니다.</p>
          </>
        )}
        <Link className="text-link" href="/">
          메인으로
        </Link>
      </section>
    </main>
  );
}
