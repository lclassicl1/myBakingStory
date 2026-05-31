import { BoardPreviewSection } from "@/components/board-preview-section";
import { PageHeader } from "@/components/page-header";
import { getServerViewer } from "@/lib/auth-server";
import { getBoardPreviewPosts, getBoards, hasUnreadTodayPosts } from "@/lib/board-data";
import { MAIN_PREVIEW_LIMIT } from "@/lib/boards";

export const dynamic = "force-dynamic";

export default async function Home() {
  const viewer = await getServerViewer();
  const boards = await getBoards();
  const boardPreviews = await Promise.all(
    boards.map(async (board) => ({
      board,
      hasNewPosts: await hasUnreadTodayPosts(board, viewer),
      posts: await getBoardPreviewPosts(board, viewer),
    })),
  );

  return (
    <main className="app-shell">
      <PageHeader viewer={viewer} />

      <section className="hero-section" aria-labelledby="home-title">
        <div className="hero-section__copy">
          <p className="eyebrow">Bake stories</p>
          <h1 id="home-title">오늘의 베이킹 이야기를 가볍게 둘러보세요.</h1>
          <p>
            공지, 레시피, 이벤트와 커뮤니티 글을 한 화면에서 확인하고 로그인 후 바로 참여할 수 있습니다.
          </p>
        </div>
        <div className="home-summary" aria-label="메인화면 표시 기준">
          <span>게시판 {boards.length}개</span>
          <span>최신순 {MAIN_PREVIEW_LIMIT}개</span>
          <span>{viewer ? "내 레시피 표시 중" : "로그인 후 참여 가능"}</span>
        </div>
      </section>

      <section className="board-section" aria-labelledby="latest-board-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Latest posts</p>
            <h2 id="latest-board-title">게시판별 최신 글</h2>
          </div>
        </div>

        <div className="board-grid">
          {boardPreviews.map(({ board, hasNewPosts, posts }) => (
            <BoardPreviewSection
              board={board}
              hasNewPosts={hasNewPosts}
              key={board.key}
              posts={posts}
              viewer={viewer}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
