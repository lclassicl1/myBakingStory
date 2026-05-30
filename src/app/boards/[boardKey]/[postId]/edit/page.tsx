import { LockKeyhole, PenLine } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updatePost } from "@/app/boards/actions";
import { PageHeader } from "@/components/page-header";
import { canManagePost } from "@/lib/auth";
import { getServerViewer } from "@/lib/auth-server";
import { getBoard, getPostForDetail } from "@/lib/board-data";
import { boardConfigs } from "@/lib/boards";

export const dynamic = "force-dynamic";

type EditPostPageProps = {
  params: Promise<{
    boardKey: string;
    postId: string;
  }>;
  searchParams?: Promise<{
    message?: string;
  }>;
};

export function generateStaticParams() {
  return boardConfigs.map((board) => ({
    boardKey: board.key,
    postId: "preview",
  }));
}

export default async function EditPostPage({ params, searchParams }: EditPostPageProps) {
  const { boardKey, postId } = await params;
  const query = await searchParams;
  const board = await getBoard(boardKey);
  const viewer = await getServerViewer();

  if (!board) {
    notFound();
  }

  const post = await getPostForDetail(board, postId, viewer);
  const canEdit = canManagePost(post?.ownerId, viewer);

  return (
    <main className="app-shell">
      <PageHeader viewer={viewer} />

      <section className="board-page-header" aria-labelledby="edit-title">
        <div>
          <p className="eyebrow">Edit</p>
          <h1 id="edit-title">{board.title} 글 수정</h1>
          <p>작성자 본인 또는 운영자만 게시글을 수정할 수 있습니다.</p>
        </div>
        <Link className="text-link" href={post ? `${board.href}/${post.id}` : board.href}>
          돌아가기
        </Link>
      </section>

      {!viewer ? (
        <section className="notice-panel" aria-live="polite">
          <LockKeyhole aria-hidden="true" size={24} />
          <h2>로그인을 하지 않으면 글을 수정할 수 없습니다</h2>
          <p>게시글을 수정하려면 먼저 로그인해 주세요.</p>
          <Link className="text-link" href="/login">
            로그인하러 가기
          </Link>
        </section>
      ) : !post ? (
        <section className="notice-panel" aria-live="polite">
          <LockKeyhole aria-hidden="true" size={24} />
          <h2>게시글을 볼 수 없습니다</h2>
          <p>게시글이 없거나 접근 권한이 없습니다.</p>
        </section>
      ) : !canEdit ? (
        <section className="notice-panel" aria-live="polite">
          <LockKeyhole aria-hidden="true" size={24} />
          <h2>게시글을 수정할 권한이 없습니다</h2>
          <p>작성자 본인 또는 운영자만 이 게시글을 수정할 수 있습니다.</p>
        </section>
      ) : (
        <form action={updatePost} className="write-panel" aria-label={`${board.title} 글 수정 입력`}>
          <input name="boardKey" type="hidden" value={board.key} />
          <input name="postId" type="hidden" value={post.id} />
          <div className="write-panel__title">
            <PenLine aria-hidden="true" size={22} />
            <h2>게시글 수정</h2>
          </div>
          <label className="form-field">
            <span>제목</span>
            <input
              defaultValue={post.title}
              maxLength={120}
              name="title"
              required
              type="text"
              placeholder={`${board.title}에 올릴 제목을 입력하세요`}
            />
          </label>
          <label className="form-field">
            <span>내용</span>
            <textarea
              defaultValue={post.content}
              maxLength={20000}
              name="content"
              required
              placeholder="베이킹 이야기를 자세히 적어주세요"
              rows={8}
            />
          </label>
          {query?.message ? (
            <p className="inline-notice" role="status">
              {query.message}
            </p>
          ) : null}
          <div className="form-actions">
            <button className="primary-button" type="submit">
              수정 완료
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

