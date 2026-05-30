import Link from "next/link";
import { LogIn, UserPlus, UserRound } from "lucide-react";

import type { Viewer } from "@/lib/auth";

type PageHeaderProps = {
  activeAuth?: "login" | "signup";
  viewer?: Viewer;
};

export function PageHeader({ activeAuth, viewer }: PageHeaderProps) {
  const isLoggedIn = Boolean(viewer);
  const isAdmin = viewer?.role === "admin";

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
      {isLoggedIn ? (
        <div className="user-chip" aria-label="로그인 사용자">
          <UserRound aria-hidden="true" size={18} />
          <span>
            <strong>{viewer?.name}</strong>
            <small>{isAdmin ? "운영자" : `${viewer?.memberGrade ?? "basic"} · ${viewer?.memberPoints ?? 0}P`}</small>
          </span>
        </div>
      ) : (
        <nav className="auth-nav" aria-label="계정 메뉴">
          <Link className={activeAuth === "login" ? "auth-nav__link auth-nav__link--active" : "auth-nav__link"} href="/login">
            <LogIn aria-hidden="true" size={16} />
            로그인
          </Link>
          <Link
            className={activeAuth === "signup" ? "auth-nav__link auth-nav__link--active" : "auth-nav__link"}
            href="/signup"
          >
            <UserPlus aria-hidden="true" size={16} />
            회원가입
          </Link>
        </nav>
      )}
    </header>
  );
}
