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

const boardIconMap: Record<BoardConfig["key"], string> = {
  notice: "!",
  "public-recipes": "R",
  "private-recipes": "L",
  free: "C",
  events: "E",
  suggestions: "S",
};

const boardModalToneMap: Record<BoardConfig["key"], "login" | "permission" | "private"> = {
  notice: "permission",
  "public-recipes": "login",
  "private-recipes": "private",
  free: "login",
  events: "login",
  suggestions: "login",
};

export function BoardPreviewSection({ board, posts, viewer }: BoardPreviewSectionProps) {
  const boardHref = getHrefWithAuth(board.href, viewer);
  const writeHref = getHrefWithAuth(`${board.href}/write`, viewer);
  const showWriteButton = Boolean(board.allowsWriting);
  const canWrite = canCreatePost(board, viewer);
  const canRead = Boolean(viewer);
  const readRequiredMessage = "로그인을 하지 않으면 볼 수 없습니다.";
  const boardIcon = boardIconMap[board.key];
  const boardModalTone = boardModalToneMap[board.key];
  const writeRequiredMessage = !viewer
    ? "로그인을 하지 않으면 글을 작성할 수 없습니다."
    : "공지사항은 사이트 운영자만 작성할 수 있습니다.";

  return (
    <section className="board-card" aria-labelledby={`${board.key}-title`}>
      <div className="board-card__header">
        <div className="board-card__identity">
          <span className={`board-card__mark board-card__mark--${board.key}`} aria-hidden="true">
            {boardIcon}
          </span>
          <div>
            <h2 className="board-card__title" id={`${board.key}-title`}>
              {board.title}
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
              icon={boardIcon}
            />
          ) : null}
          <ProtectedAction
            actionHref="/login"
            canAccess={canRead}
            className="icon-link"
            href={boardHref}
            icon={boardIcon}
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
          <li className={post.isLocked ? "post-item post-item--locked" : "post-item"} key={post.id}>
            <ProtectedAction
              actionHref="/login"
              canAccess={canRead && !post.isLocked}
              className="post-item__link"
              href={getHrefWithAuth(`${board.href}/${post.id}`, viewer)}
              label={`${post.title} 글 보기`}
              message={
                post.isLocked
                  ? "나만의 레시피는 작성자 본인에게만 보여요. 로그인 후 내 레시피 목록에서 확인할 수 있습니다."
                  : readRequiredMessage
              }
              modalTitle={post.isLocked ? "비공개 레시피예요" : "로그인이 필요해요"}
              modalTone={post.isLocked ? "private" : boardModalTone}
              icon={boardIcon}
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
