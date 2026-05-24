import Link from "next/link";

import { AuthReadyForm } from "@/components/auth-ready-form";
import { PageHeader } from "@/components/page-header";
import { SocialLoginButtons } from "@/components/social-login-buttons";

export default function LoginPage() {
  return (
    <main className="app-shell">
      <PageHeader activeAuth="login" />

      <section className="auth-layout" aria-labelledby="login-title">
        <div className="auth-copy">
          <p className="eyebrow">Sign in</p>
          <h1 id="login-title">다시 오신 걸 환영합니다.</h1>
          <p>로그인하면 게시판 글 보기, 글쓰기, 나만의 레시피 관리가 가능해집니다.</p>
        </div>

        <div className="auth-panel">
          <SocialLoginButtons />

          <div className="auth-divider">
            <span>또는 이메일로 로그인</span>
          </div>

          <AuthReadyForm
            buttonLabel="이메일로 로그인"
            readyMessage="Supabase 환경변수 연결 후 이메일 로그인이 활성화됩니다."
          >
            <label className="form-field">
              <span>이메일</span>
              <input autoComplete="email" name="email" placeholder="you@example.com" type="email" />
            </label>
            <label className="form-field">
              <span>비밀번호</span>
              <input autoComplete="current-password" name="password" placeholder="비밀번호" type="password" />
            </label>
          </AuthReadyForm>

          <p className="auth-switch">
            아직 계정이 없나요? <Link href="/signup">회원가입</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
