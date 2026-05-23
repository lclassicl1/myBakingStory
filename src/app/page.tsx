import { BoardPreviewSection } from "@/components/board-preview-section";
import { PageHeader } from "@/components/page-header";
import { getViewerFromParams } from "@/lib/auth";
import { boardConfigs, getBoardPreviews, MAIN_PREVIEW_LIMIT } from "@/lib/boards";

type HomeProps = {
  searchParams?: Promise<{
    login?: string;
    role?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const viewer = getViewerFromParams(params);

  return (
    <main className="app-shell">
      <PageHeader viewer={viewer} />

      <section className="hero-section" aria-labelledby="home-title">
        <div className="hero-section__copy">
          <p className="eyebrow">Bake, share, remember</p>
          <h1 id="home-title">오늘의 베이킹 이야기를 한눈에 모아보세요.</h1>
          <p>
            공지, 레시피, 자유로운 대화와 이벤트까지 최신 글을 게시판별로 빠르게 확인할 수 있습니다.
          </p>
        </div>
        <div className="hero-section__panel" aria-label="메인화면 표시 기준">
          <span>게시판 {boardConfigs.length}개</span>
          <strong>최신순 {MAIN_PREVIEW_LIMIT}개</strong>
          <span>{viewer ? "내 레시피 표시 중" : "개인 레시피 비공개"}</span>
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
          {boardConfigs.map((board) => (
            <BoardPreviewSection
              board={board}
              key={board.key}
              posts={getBoardPreviews(board, { viewerId: viewer?.id })}
              viewer={viewer}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
