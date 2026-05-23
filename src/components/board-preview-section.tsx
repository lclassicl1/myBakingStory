import { ArrowRight, LockKeyhole, MessageCircle } from "lucide-react";

import { canCreatePost, getHrefWithAuth, type Viewer } from "@/lib/auth";
import type { BoardConfig, PostPreview } from "@/lib/boards";
import { ProtectedAction } from "@/components/protected-action";
import { WriteActionButton } from "@/components/write-action-button";

type BoardPreviewSectionProps = {
  board: BoardConfig;
  posts: PostPreview[];
  viewer?: Viewer;
};

export function BoardPreviewSection({ board, posts, viewer }: BoardPreviewSectionProps) {
  const boardHref = getHrefWithAuth(board.href, viewer);
  const writeHref = getHrefWithAuth(`${board.href}/write`, viewer);
  const showWriteButton = Boolean(board.allowsWriting);
  const canWrite = canCreatePost(board, viewer);
  const canRead = Boolean(viewer);
  const readRequiredMessage = "로그인을 하지 않으면 볼 수 없습니다.";
  const writeRequiredMessage = !viewer
    ? "로그인을 하지 않으면 글을 작성할 수 없습니다."
    : "공지사항은 사이트 운영자만 작성할 수 있습니다.";

  return (
    <section className="board-card" aria-labelledby={`${board.key}-title`}>
      <div className="board-card__header">
        <div>
          <h2 className="board-card__title" id={`${board.key}-title`}>
            {board.title}
          </h2>
          <p className="board-card__description">{board.description}</p>
        </div>
        <div className="board-card__actions">
          {showWriteButton ? (
            <WriteActionButton
              canWrite={canWrite}
              href={writeHref}
              label={`${board.title} 글쓰기`}
              message={writeRequiredMessage}
            />
          ) : null}
          <ProtectedAction
            canAccess={canRead}
            className="icon-link"
            href={boardHref}
            label={`${board.title} 전체보기`}
            lockedClassName="icon-link icon-link--muted"
            message={readRequiredMessage}
            title="게시판 이동"
          >
            <ArrowRight aria-hidden="true" size={18} />
          </ProtectedAction>
        </div>
      </div>

      <ul className="post-list">
        {posts.map((post) => (
          <li className={post.isLocked ? "post-item post-item--locked" : "post-item"} key={post.id}>
            <ProtectedAction
              canAccess={canRead && !post.isLocked}
              className="post-item__link"
              href={getHrefWithAuth(`${board.href}/${post.id}`, viewer)}
              label={`${post.title} 글 보기`}
              message={readRequiredMessage}
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
            </ProtectedAction>
          </li>
        ))}
      </ul>
    </section>
  );
}
