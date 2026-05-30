import { LockKeyhole, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { getServerViewer } from "@/lib/auth-server";
import { getBoard, getBoardPostsForList } from "@/lib/board-data";
import { boardConfigs } from "@/lib/boards";

export const dynamic = "force-dynamic";

type BoardPageProps = {
  params: Promise<{
    boardKey: string;
  }>;
};

export function generateStaticParams() {
  return boardConfigs.map((board) => ({
    boardKey: board.key,
  }));
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardKey } = await params;
  const board = await getBoard(boardKey);

  if (!board) {
    notFound();
  }

  const viewer = await getServerViewer();
  const posts = await getBoardPostsForList(board, viewer);

  return (
    <main className="app-shell">
      <PageHeader viewer={viewer} />

      <section className="board-page-header" aria-labelledby="board-title">
        <div>
          <p className="eyebrow">Board</p>
          <h1 id="board-title">{board.title}</h1>
          <p>{board.description}</p>
        </div>
        <Link className="text-link" href="/">
          메인으로
        </Link>
      </section>

      {!viewer ? (
        <section className="notice-panel" aria-live="polite">
          <LockKeyhole aria-hidden="true" size={24} />
          <h2>로그인을 하지 않으면 볼 수 없습니다</h2>
          <p>게시판의 글 목록을 보려면 먼저 로그인해 주세요.</p>
          <Link className="text-link" href="/login">
            로그인하러 가기
          </Link>
        </section>
      ) : (
        <section className="board-list-panel" aria-label={`${board.title} 글 목록`}>
          <ul className="post-list post-list--full">
            {posts.map((post) => (
              <li className={post.isLocked ? "post-item post-item--locked" : "post-item"} key={post.id}>
                <Link
                  className="post-item__link"
                  href={post.isLocked ? "/login" : `/boards/${board.key}/${post.id}`}
                >
                  <span className="post-item__title">
                    {post.isLocked ? <LockKeyhole aria-hidden="true" size={16} /> : null}
                    {post.title}
                  </span>
                  <span className="post-item__meta">
                    <span>{post.author}</span>
                    {post.createdAt ? <time dateTime={post.createdAt}>{post.createdAt}</time> : null}
                    {!post.isLocked ? (
                      <span className="post-item__comments">
                        <MessageCircle aria-hidden="true" size={14} />
                        {post.commentCount}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
