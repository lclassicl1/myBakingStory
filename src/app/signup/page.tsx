import Link from "next/link";

import { AuthReadyForm } from "@/components/auth-ready-form";
import { PageHeader } from "@/components/page-header";
import { SocialLoginButtons } from "@/components/social-login-buttons";

export default function SignupPage() {
  return (
    <main className="app-shell">
      <PageHeader activeAuth="login" />

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

          <AuthReadyForm
            buttonLabel="이메일로 회원가입"
            requirePasswordConfirmation
            readyMessage="Supabase 환경변수 연결 후 이메일 회원가입이 활성화됩니다."
          >
            <label className="form-field">
              <span>닉네임</span>
              <input autoComplete="nickname" name="nickname" placeholder="베이킹 닉네임" type="text" />
            </label>
            <label className="form-field">
              <span>이메일</span>
              <input autoComplete="email" name="email" placeholder="you@example.com" type="email" />
            </label>
            <label className="form-field">
              <span>비밀번호</span>
              <input autoComplete="new-password" name="password" placeholder="8자 이상 권장" type="password" />
            </label>
            <label className="form-field">
              <span>비밀번호 확인</span>
              <input autoComplete="new-password" name="passwordConfirm" placeholder="비밀번호를 한 번 더 입력하세요" type="password" />
            </label>
          </AuthReadyForm>

          <p className="auth-switch">
            이미 계정이 있나요? <Link href="/login">로그인</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
