import { LockKeyhole, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { getAuthQuery, getViewerFromParams } from "@/lib/auth";
import { boardConfigs, getBoardByKey, getPostById } from "@/lib/boards";

type PostPageProps = {
  params: Promise<{
    boardKey: string;
    postId: string;
  }>;
  searchParams?: Promise<{
    login?: string;
    role?: string;
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
  const board = getBoardByKey(boardKey);
  const viewer = getViewerFromParams(query);
  const authQuery = getAuthQuery(viewer);
  const post = getPostById(postId, { viewerId: viewer?.id });

  if (!board) {
    notFound();
  }

  return (
    <main className="app-shell">
      <PageHeader viewer={viewer} />

      <section className="board-page-header" aria-labelledby="post-title">
        <div>
          <p className="eyebrow">{board.title}</p>
          <h1 id="post-title">{post?.title ?? "게시글"}</h1>
          <p>{board.description}</p>
        </div>
        <Link className="text-link" href={`${board.href}${authQuery}`}>
          게시판으로
        </Link>
      </section>

      {!viewer ? (
        <section className="notice-panel" aria-live="polite">
          <LockKeyhole aria-hidden="true" size={24} />
          <h2>로그인을 하지 않으면 볼 수 없습니다</h2>
          <p>게시글 내용을 보려면 먼저 로그인해 주세요.</p>
          <Link className="text-link" href="/?login=1">
            로그인 미리보기
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
            실제 게시글 본문은 Supabase 데이터 연동 단계에서 연결합니다. 지금은 메인화면과 게시판 흐름을
            확인하기 위한 미리보기 화면입니다.
          </p>
        </article>
      )}
    </main>
  );
}
