import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { SignupEmailForm } from "@/components/signup-email-form";
import { SocialLoginButtons } from "@/components/social-login-buttons";

type SignupPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return (
    <main className="app-shell">
      <PageHeader activeAuth="signup" />

      <section className="auth-layout" aria-labelledby="signup-title">
        <div className="auth-copy">
          <p className="eyebrow">Join</p>
          <h1 id="signup-title">나만의 베이킹 이야기를 시작하세요.</h1>
          <p>레시피를 기록하고, 다른 사람의 노하우를 보고, 베이킹 경험을 함께 쌓아갈 수 있습니다.</p>
        </div>

        <div className="auth-panel">
          <SocialLoginButtons />

          <div className="auth-divider">
            <span>또는 이메일로 회원가입</span>
          </div>

          <SignupEmailForm message={params?.message} />

          <p className="auth-switch">
            이미 계정이 있나요? <Link href="/login">로그인</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
