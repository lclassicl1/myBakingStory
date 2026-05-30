import { LockKeyhole, MessageCircle, PenLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deletePost } from "@/app/boards/actions";
import { PageHeader } from "@/components/page-header";
import { canManagePost } from "@/lib/auth";
import { getServerViewer } from "@/lib/auth-server";
import { getBoard, getPostForDetail } from "@/lib/board-data";
import { boardConfigs } from "@/lib/boards";

export const dynamic = "force-dynamic";

type PostPageProps = {
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

export default async function PostPage({ params, searchParams }: PostPageProps) {
  const { boardKey, postId } = await params;
  const query = await searchParams;
  const board = await getBoard(boardKey);
  const viewer = await getServerViewer();

  if (!board) {
    notFound();
  }

  const post = await getPostForDetail(board, postId, viewer);
  const canManage = canManagePost(post?.ownerId, viewer);

  return (
    <main className="app-shell">
      <PageHeader viewer={viewer} />

      <section className="board-page-header" aria-labelledby="post-title">
        <div>
          <p className="eyebrow">{board.title}</p>
          <h1 id="post-title">{post?.title ?? "게시글"}</h1>
          <p>{board.description}</p>
        </div>
        <Link className="text-link" href={board.href}>
          게시판으로
        </Link>
      </section>

      {!viewer ? (
        <section className="notice-panel" aria-live="polite">
          <LockKeyhole aria-hidden="true" size={24} />
          <h2>로그인을 하지 않으면 볼 수 없습니다</h2>
          <p>게시글 내용을 보려면 먼저 로그인해 주세요.</p>
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
      ) : (
        <article className="write-panel">
          <div className="post-detail__meta">
            <span>{post.author}</span>
            <time dateTime={post.createdAt}>{post.createdAt}</time>
            {post.updatedAt && post.updatedAt !== post.createdAt ? <span>수정 {post.updatedAt}</span> : null}
            <span className="post-item__comments">
              <MessageCircle aria-hidden="true" size={14} />
              {post.commentCount}
            </span>
          </div>
          <p className="post-detail__body">
            {post.content}
          </p>
          {query?.message ? (
            <p className="inline-notice" role="status">
              {query.message}
            </p>
          ) : null}
          {canManage ? (
            <div className="post-management">
              <div className="post-management__actions">
                <Link className="secondary-button" href={`${board.href}/${post.id}/edit`}>
                  <PenLine aria-hidden="true" size={16} />
                  수정
                </Link>
              </div>
              <form action={deletePost} className="delete-form">
                <input name="boardKey" type="hidden" value={board.key} />
                <input name="postId" type="hidden" value={post.id} />
                <label className="form-field">
                  <span>삭제 확인</span>
                  <input name="confirmText" placeholder="삭제하려면 '삭제'를 입력하세요" type="text" />
                </label>
                <button className="secondary-button secondary-button--danger" type="submit">
                  <Trash2 aria-hidden="true" size={16} />
                  삭제
                </button>
              </form>
            </div>
          ) : null}
        </article>
      )}
    </main>
  );
}
