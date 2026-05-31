import { Heart, LockKeyhole, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { ProtectedAction } from "@/components/protected-action";
import { RecipeVisibilityToggle } from "@/components/recipe-visibility-toggle";
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
  const totalPosts = posts.length;

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
          <div className="board-table" role="table" aria-label={`${board.title} 게시글 목록`}>
            <div className={board.key === "private-recipes" ? "board-table__head board-table__head--with-toggle" : "board-table__head"} role="row">
              <span role="columnheader">번호</span>
              <span role="columnheader">제목</span>
              <span role="columnheader">작성자</span>
              <span role="columnheader">좋아요</span>
              <span role="columnheader">댓글</span>
              <span role="columnheader">작성일자</span>
              {board.key === "private-recipes" ? <span role="columnheader">공개</span> : null}
            </div>
            <ul className="board-table__body" role="rowgroup">
              {posts.map((post, index) => {
                const canToggleVisibility =
                  board.key === "private-recipes" &&
                  !post.isLocked &&
                  !post.isUnavailable &&
                  (viewer.role === "admin" || viewer.id === post.ownerId);

                return (
                  <li
                    className={
                      post.isLocked || post.isUnavailable
                        ? "board-table__row board-table__row--locked"
                        : "board-table__row"
                    }
                    key={post.id}
                    role="row"
                  >
                    <span className="board-table__number" role="cell">
                      {totalPosts - index}
                    </span>
                    <ProtectedAction
                      actionHref={post.isUnavailable ? undefined : "/login"}
                      canAccess={!post.isLocked && !post.isUnavailable}
                      className="board-table__title"
                      href={post.isLocked ? "/login" : `/boards/${board.key}/${post.id}`}
                      icon={<LockKeyhole aria-hidden="true" size={24} />}
                      label={`${post.title} 글 보기`}
                      lockedClassName="board-table__title"
                      message={
                        post.isUnavailable
                          ? "작성자가 비공개로 전환한 레시피입니다."
                          : "나만의 레시피는 작성자 본인에게만 보여요. 로그인 후 내 레시피 목록에서 확인할 수 있습니다."
                      }
                      modalTitle={post.isUnavailable ? "비공개된 레시피입니다" : "비공개 레시피예요"}
                      modalTone="private"
                      role="cell"
                      secondaryLabel={post.isUnavailable ? "닫기" : undefined}
                    >
                      {post.isLocked || post.isUnavailable ? <LockKeyhole aria-hidden="true" size={16} /> : null}
                      <span>{post.title}</span>
                    </ProtectedAction>
                    <span className="board-table__author" role="cell">{post.author}</span>
                    <span className="board-table__metric" role="cell">
                      <Heart aria-hidden="true" size={14} />
                      {post.likeCount}
                    </span>
                    <span className="board-table__metric" role="cell">
                      <MessageCircle aria-hidden="true" size={14} />
                      {post.commentCount}
                    </span>
                    <span className="board-table__date" role="cell">
                      {post.createdAt ? <time dateTime={post.createdAt}>{post.createdAt}</time> : "-"}
                    </span>
                    {board.key === "private-recipes" ? (
                      <span className="board-table__toggle" role="cell">
                        {canToggleVisibility ? (
                          <RecipeVisibilityToggle
                            postId={post.id}
                            returnPath={board.href}
                            visibility={post.visibility}
                          />
                        ) : (
                          "-"
                        )}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
