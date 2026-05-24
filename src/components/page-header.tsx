import Link from "next/link";

import type { Viewer } from "@/lib/auth";

type PageHeaderProps = {
  activeAuth?: "guest" | "login" | "admin";
  viewer?: Viewer;
};

export function PageHeader({ activeAuth, viewer }: PageHeaderProps) {
  const isLoggedIn = Boolean(viewer);
  const isAdmin = viewer?.role === "admin";
  const activeState = activeAuth ?? (isAdmin ? "admin" : isLoggedIn ? "login" : "guest");

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand__mark" aria-hidden="true">
          MB
        </span>
        <span>
          <strong>myBakingStory</strong>
          <small>베이킹 커뮤니티</small>
        </span>
      </Link>
      <nav className="auth-nav" aria-label="로그인 상태 미리보기">
        <Link className={activeState === "guest" ? "auth-nav__link auth-nav__link--active" : "auth-nav__link"} href="/">
          비로그인
        </Link>
        <Link
          className={activeState === "login" ? "auth-nav__link auth-nav__link--active" : "auth-nav__link"}
          href="/login"
        >
          로그인
        </Link>
        <Link
          className={activeState === "admin" ? "auth-nav__link auth-nav__link--active" : "auth-nav__link"}
          href="/?login=1&role=admin"
        >
          운영자
        </Link>
      </nav>
    </header>
  );
}
