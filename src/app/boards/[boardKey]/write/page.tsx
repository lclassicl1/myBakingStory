import { LockKeyhole, PenLine } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { canCreatePost, getAuthQuery } from "@/lib/auth";
import { getServerViewer } from "@/lib/auth-server";
import { boardConfigs, getBoardByKey } from "@/lib/boards";

type BoardWritePageProps = {
  params: Promise<{
    boardKey: string;
  }>;
  searchParams?: Promise<{
    login?: string;
    role?: string;
  }>;
};

export function generateStaticParams() {
  return boardConfigs
    .filter((board) => board.allowsWriting)
    .map((board) => ({
      boardKey: board.key,
    }));
}

export default async function BoardWritePage({ params, searchParams }: BoardWritePageProps) {
  const { boardKey } = await params;
  const query = await searchParams;
  const board = getBoardByKey(boardKey);

  if (!board || !board.allowsWriting) {
    notFound();
  }

  const viewer = await getServerViewer(query);
  const authQuery = getAuthQuery(viewer);
  const canWrite = canCreatePost(board, viewer);

  return (
    <main className="app-shell">
      <PageHeader viewer={viewer} />

      <section className="board-page-header" aria-labelledby="write-title">
        <div>
          <p className="eyebrow">Write</p>
          <h1 id="write-title">{board.title} 글쓰기</h1>
          <p>작성 권한을 확인한 뒤 게시글 입력 화면으로 진입합니다.</p>
        </div>
        <Link className="text-link" href={`${board.href}${authQuery}`}>
          게시판으로
        </Link>
      </section>

      {!viewer ? (
        <section className="notice-panel" aria-live="polite">
          <LockKeyhole aria-hidden="true" size={24} />
          <h2>로그인을 하지 않으면 글을 작성할 수 없습니다</h2>
          <p>글쓰기는 로그인한 사용자에게만 열립니다. 공지사항은 운영자 권한이 필요합니다.</p>
          <Link className="text-link" href="/?login=1">
            로그인 미리보기
          </Link>
        </section>
      ) : !canWrite ? (
        <section className="notice-panel" aria-live="polite">
          <LockKeyhole aria-hidden="true" size={24} />
          <h2>글쓰기 권한이 없습니다</h2>
          <p>공지사항은 사이트 운영자만 작성할 수 있습니다. 운영자 계정으로 다시 확인해 주세요.</p>
          <Link className="text-link" href="/?login=1&role=admin">
            운영자 미리보기
          </Link>
        </section>
      ) : (
        <section className="write-panel" aria-label={`${board.title} 글쓰기 입력`}>
          <div className="write-panel__title">
            <PenLine aria-hidden="true" size={22} />
            <h2>새 글 작성</h2>
          </div>
          <label className="form-field">
            <span>제목</span>
            <input type="text" placeholder={`${board.title}에 올릴 제목을 입력하세요`} />
          </label>
          <label className="form-field">
            <span>내용</span>
            <textarea placeholder="베이킹 이야기를 자세히 적어주세요" rows={8} />
          </label>
          <div className="form-actions">
            <button className="primary-button" type="button">
              등록 준비 중
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
