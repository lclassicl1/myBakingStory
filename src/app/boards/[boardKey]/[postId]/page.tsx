import { LockKeyhole, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { getServerViewer } from "@/lib/auth-server";
import { getBoard, getPostForDetail } from "@/lib/board-data";
import { boardConfigs } from "@/lib/boards";

export const dynamic = "force-dynamic";

type PostPageProps = {
  params: Promise<{
    boardKey: string;
    postId: string;
  }>;
};

export function generateStaticParams() {
  return boardConfigs.map((board) => ({
    boardKey: board.key,
    postId: "preview",
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { boardKey, postId } = await params;
  const board = await getBoard(boardKey);
  const viewer = await getServerViewer();

  if (!board) {
    notFound();
  }

  const post = await getPostForDetail(board, postId, viewer);

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
            <span className="post-item__comments">
              <MessageCircle aria-hidden="true" size={14} />
              {post.commentCount}
            </span>
          </div>
          <p className="post-detail__body">
            {post.content}
          </p>
        </article>
      )}
    </main>
  );
}
