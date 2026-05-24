import { BoardPreviewSection } from "@/components/board-preview-section";
import { PageHeader } from "@/components/page-header";
import { getServerViewer } from "@/lib/auth-server";
import { boardConfigs, getBoardPreviews, MAIN_PREVIEW_LIMIT } from "@/lib/boards";

type HomeProps = {
  searchParams?: Promise<{
    login?: string;
    role?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const viewer = await getServerViewer(params);

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
        <div className="hero-section__panel" aria-label="메인화면 표시 기준">
          <div className="hero-section__swatches" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <strong>Warm, soft, mobile-first</strong>
          <p>게시판 {boardConfigs.length}개 · 최신순 {MAIN_PREVIEW_LIMIT}개 · {viewer ? "내 레시피 표시 중" : "로그인 필요"}</p>
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
