import { LockKeyhole, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { getAuthQuery, getHrefWithAuth } from "@/lib/auth";
import { getServerViewer } from "@/lib/auth-server";
import { boardConfigs, getBoardByKey, getBoardPosts } from "@/lib/boards";

type BoardPageProps = {
  params: Promise<{
    boardKey: string;
  }>;
  searchParams?: Promise<{
    login?: string;
    role?: string;
  }>;
};

export function generateStaticParams() {
  return boardConfigs.map((board) => ({
    boardKey: board.key,
  }));
}

export default async function BoardPage({ params, searchParams }: BoardPageProps) {
  const { boardKey } = await params;
  const query = await searchParams;
  const board = getBoardByKey(boardKey);

  if (!board) {
    notFound();
  }

  const viewer = await getServerViewer(query);
  const authQuery = getAuthQuery(viewer);
  const posts = getBoardPosts(board, { viewerId: viewer?.id });

  return (
    <main className="app-shell">
      <PageHeader viewer={viewer} />

      <section className="board-page-header" aria-labelledby="board-title">
        <div>
          <p className="eyebrow">Board</p>
          <h1 id="board-title">{board.title}</h1>
          <p>{board.description}</p>
        </div>
        <Link className="text-link" href={`/${authQuery}`}>
          메인으로
        </Link>
      </section>

      {!viewer ? (
        <section className="notice-panel" aria-live="polite">
          <LockKeyhole aria-hidden="true" size={24} />
          <h2>로그인을 하지 않으면 볼 수 없습니다</h2>
          <p>게시판의 글 목록을 보려면 먼저 로그인해 주세요. 메인화면의 로그인 미리보기로 접근 상태를 확인할 수 있습니다.</p>
          <Link className="text-link" href="/?login=1">
            로그인 미리보기
          </Link>
        </section>
      ) : (
        <section className="board-list-panel" aria-label={`${board.title} 글 목록`}>
          <ul className="post-list post-list--full">
            {posts.map((post) => (
              <li className={post.isLocked ? "post-item post-item--locked" : "post-item"} key={post.id}>
                <Link
                  className="post-item__link"
                  href={post.isLocked ? "/login" : getHrefWithAuth(`/boards/${board.key}/${post.id}`, viewer)}
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
