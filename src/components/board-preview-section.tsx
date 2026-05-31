import {
  ArrowRight,
  ChefHat,
  Lightbulb,
  LockKeyhole,
  Megaphone,
  MessageCircle,
  NotebookTabs,
  PartyPopper,
} from "lucide-react";
import type { ReactNode } from "react";

import { canCreatePost, type Viewer } from "@/lib/auth";
import type { BoardConfig, PostPreview } from "@/lib/boards";
import { ProtectedAction } from "@/components/protected-action";
import { WriteActionButton } from "@/components/write-action-button";

type BoardPreviewSectionProps = {
  board: BoardConfig;
  hasNewPosts?: boolean;
  posts: PostPreview[];
  viewer?: Viewer;
};

function getBoardIcon(boardKey: BoardConfig["key"], size: number): ReactNode {
  switch (boardKey) {
    case "notice":
      return <Megaphone aria-hidden="true" size={size} />;
    case "public-recipes":
      return <ChefHat aria-hidden="true" size={size} />;
    case "private-recipes":
      return <NotebookTabs aria-hidden="true" size={size} />;
    case "free":
      return <MessageCircle aria-hidden="true" size={size} />;
    case "events":
      return <PartyPopper aria-hidden="true" size={size} />;
    case "suggestions":
      return <Lightbulb aria-hidden="true" size={size} />;
    default:
      return <MessageCircle aria-hidden="true" size={size} />;
  }
}

function getBoardModalTone(boardKey: BoardConfig["key"]): "login" | "permission" | "private" {
  if (boardKey === "notice") {
    return "permission";
  }

  if (boardKey === "private-recipes") {
    return "private";
  }

  return "login";
}

export function BoardPreviewSection({ board, hasNewPosts = false, posts, viewer }: BoardPreviewSectionProps) {
  const boardHref = board.href;
  const writeHref = `${board.href}/write`;
  const showWriteButton = Boolean(board.allowsWriting);
  const canWrite = canCreatePost(board, viewer);
  const canRead = Boolean(viewer);
  const readRequiredMessage = "로그인을 하지 않으면 볼 수 없습니다.";
  const boardModalTone = getBoardModalTone(board.key);
  const writeRequiredMessage = !viewer
    ? "로그인을 하지 않으면 글을 작성할 수 없습니다."
    : "공지사항은 사이트 운영자만 작성할 수 있습니다.";

  return (
    <section className="board-card" aria-labelledby={`${board.key}-title`}>
      <div className="board-card__header">
        <div className="board-card__identity">
          <span className={`board-card__mark board-card__mark--${board.key}`} aria-hidden="true">
            {getBoardIcon(board.key, 20)}
          </span>
          <div>
            <h2 className="board-card__title" id={`${board.key}-title`}>
              {board.title}
              {hasNewPosts ? <span className="new-badge" aria-label="읽지 않은 새 글">N</span> : null}
            </h2>
            <p className="board-card__description">{board.description}</p>
          </div>
        </div>
        <div className="board-card__actions">
          {showWriteButton ? (
            <WriteActionButton
              canWrite={canWrite}
              href={writeHref}
              label={`${board.title} 글쓰기`}
              message={writeRequiredMessage}
              modalTone={!viewer ? boardModalTone : "permission"}
              icon={getBoardIcon(board.key, 24)}
            />
          ) : null}
          <ProtectedAction
            actionHref="/login"
            canAccess={canRead}
            className="icon-link"
            href={boardHref}
            icon={getBoardIcon(board.key, 24)}
            label={`${board.title} 전체보기`}
            lockedClassName="icon-link icon-link--muted"
            message={readRequiredMessage}
            modalTitle={board.key === "private-recipes" ? "비공개 레시피예요" : "로그인이 필요해요"}
            modalTone={boardModalTone}
            title="게시판 이동"
          >
            <ArrowRight aria-hidden="true" size={18} />
          </ProtectedAction>
        </div>
      </div>

      <ul className="post-list">
        {posts.map((post) => (
          <li className={post.isLocked || post.isUnavailable ? "post-item post-item--locked" : "post-item"} key={post.id}>
            <ProtectedAction
              actionHref={post.isUnavailable ? undefined : "/login"}
              canAccess={canRead && !post.isLocked && !post.isUnavailable}
              className="post-item__link"
              href={`${board.href}/${post.id}`}
              label={`${post.title} 글 보기`}
              message={
                post.isUnavailable
                  ? "작성자가 비공개로 전환한 레시피입니다."
                  : post.isLocked
                    ? "나만의 레시피는 작성자 본인에게만 보여요. 로그인 후 내 레시피 목록에서 확인할 수 있습니다."
                    : readRequiredMessage
              }
              modalTitle={
                post.isUnavailable
                  ? "비공개된 레시피입니다"
                  : post.isLocked
                    ? "비공개 레시피예요"
                    : "로그인이 필요해요"
              }
              modalTone={post.isLocked || post.isUnavailable ? "private" : boardModalTone}
              secondaryLabel={post.isUnavailable ? "닫기" : undefined}
              icon={
                post.isLocked || post.isUnavailable ? (
                  <LockKeyhole aria-hidden="true" size={24} />
                ) : (
                  getBoardIcon(board.key, 24)
                )
              }
            >
              <span className="post-item__title">
                {post.isLocked || post.isUnavailable ? <LockKeyhole aria-hidden="true" size={16} /> : null}
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
            </ProtectedAction>
          </li>
        ))}
      </ul>
    </section>
  );
}
