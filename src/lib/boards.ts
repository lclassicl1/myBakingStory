export type BoardKey =
  | "notice"
  | "public-recipes"
  | "private-recipes"
  | "free"
  | "events"
  | "suggestions";

export type BoardVisibility = "public" | "owner-only";
export type BoardWritePermission = "admin" | "authenticated";

export type BoardConfig = {
  id?: string;
  key: BoardKey;
  title: string;
  description: string;
  href: string;
  visibility: BoardVisibility;
  allowsWriting?: boolean;
  writePermission?: BoardWritePermission;
};

export type PostPreview = {
  id: string;
  boardKey: BoardKey;
  title: string;
  author: string;
  content?: string;
  createdAt: string;
  commentCount: number;
  ownerId?: string;
  isLocked?: boolean;
};

export const MAIN_PREVIEW_LIMIT = 4;

export const boardConfigs: BoardConfig[] = [
  {
    key: "notice",
    title: "공지사항",
    description: "서비스 소식과 운영 안내",
    href: "/boards/notice",
    visibility: "public",
    allowsWriting: true,
    writePermission: "admin",
  },
  {
    key: "public-recipes",
    title: "모두의 레시피",
    description: "함께 나누는 베이킹 레시피",
    href: "/boards/public-recipes",
    visibility: "public",
  },
  {
    key: "private-recipes",
    title: "나만의 레시피",
    description: "내가 기록한 개인 레시피",
    href: "/boards/private-recipes",
    visibility: "owner-only",
    allowsWriting: true,
    writePermission: "authenticated",
  },
  {
    key: "free",
    title: "자유게시판",
    description: "베이킹 이야기와 일상 대화",
    href: "/boards/free",
    visibility: "public",
    allowsWriting: true,
    writePermission: "authenticated",
  },
  {
    key: "events",
    title: "이벤트 게시판",
    description: "진행 중인 이벤트와 발표",
    href: "/boards/events",
    visibility: "public",
  },
  {
    key: "suggestions",
    title: "건의 게시판",
    description: "더 나은 서비스를 위한 제안",
    href: "/boards/suggestions",
    visibility: "public",
    allowsWriting: true,
    writePermission: "authenticated",
  },
];

const postPreviews: PostPreview[] = [
  {
    id: "notice-4",
    boardKey: "notice",
    title: "초기 베타 운영 기간 안내",
    author: "운영팀",
    createdAt: "2026-05-23",
    commentCount: 3,
  },
  {
    id: "notice-3",
    boardKey: "notice",
    title: "레시피 이미지 업로드 기준",
    author: "운영팀",
    createdAt: "2026-05-22",
    commentCount: 1,
  },
  {
    id: "notice-2",
    boardKey: "notice",
    title: "커뮤니티 이용 규칙",
    author: "운영팀",
    createdAt: "2026-05-21",
    commentCount: 0,
  },
  {
    id: "notice-1",
    boardKey: "notice",
    title: "myBakingStory를 시작합니다",
    author: "운영팀",
    createdAt: "2026-05-20",
    commentCount: 7,
  },
  {
    id: "public-recipes-5",
    boardKey: "public-recipes",
    title: "말차 파운드 케이크의 쌉싸름한 균형",
    author: "greenoven",
    createdAt: "2026-05-23",
    commentCount: 12,
  },
  {
    id: "public-recipes-4",
    boardKey: "public-recipes",
    title: "버터 풍미를 살린 스콘 반죽 온도",
    author: "crumbs",
    createdAt: "2026-05-22",
    commentCount: 8,
  },
  {
    id: "public-recipes-3",
    boardKey: "public-recipes",
    title: "호두 브라우니를 촉촉하게 굽는 법",
    author: "bake-lab",
    createdAt: "2026-05-21",
    commentCount: 16,
  },
  {
    id: "public-recipes-2",
    boardKey: "public-recipes",
    title: "바닐라 마들렌 배꼽 안정화 기록",
    author: "madeleine",
    createdAt: "2026-05-20",
    commentCount: 5,
  },
  {
    id: "private-recipes-4",
    boardKey: "private-recipes",
    title: "생크림 케이크 시트 2호 배합",
    author: "나",
    createdAt: "2026-05-23",
    commentCount: 0,
    ownerId: "demo-user",
  },
  {
    id: "private-recipes-3",
    boardKey: "private-recipes",
    title: "저당 레몬 커드 테스트",
    author: "나",
    createdAt: "2026-05-22",
    commentCount: 0,
    ownerId: "demo-user",
  },
  {
    id: "private-recipes-2",
    boardKey: "private-recipes",
    title: "크루아상 3차 발효 체크리스트",
    author: "나",
    createdAt: "2026-05-21",
    commentCount: 0,
    ownerId: "demo-user",
  },
  {
    id: "private-recipes-1",
    boardKey: "private-recipes",
    title: "초코칩 쿠키 단맛 조절 메모",
    author: "나",
    createdAt: "2026-05-20",
    commentCount: 0,
    ownerId: "demo-user",
  },
  {
    id: "free-4",
    boardKey: "free",
    title: "오늘 오븐 예열 시간이 유난히 길었나요?",
    author: "oven-note",
    createdAt: "2026-05-23",
    commentCount: 9,
  },
  {
    id: "free-3",
    boardKey: "free",
    title: "베이킹 도구 보관 팁 공유해요",
    author: "toolbox",
    createdAt: "2026-05-22",
    commentCount: 21,
  },
  {
    id: "free-2",
    boardKey: "free",
    title: "첫 사워도우 성공 후기",
    author: "starter",
    createdAt: "2026-05-21",
    commentCount: 14,
  },
  {
    id: "free-1",
    boardKey: "free",
    title: "동네 재료상 추천 목록",
    author: "market",
    createdAt: "2026-05-20",
    commentCount: 6,
  },
  {
    id: "events-4",
    boardKey: "events",
    title: "5월 홈베이킹 사진전 접수 시작",
    author: "운영팀",
    createdAt: "2026-05-23",
    commentCount: 4,
  },
  {
    id: "events-3",
    boardKey: "events",
    title: "식빵 굽기 챌린지 참여 안내",
    author: "운영팀",
    createdAt: "2026-05-22",
    commentCount: 11,
  },
  {
    id: "events-2",
    boardKey: "events",
    title: "베이킹 클래스 초대권 이벤트",
    author: "운영팀",
    createdAt: "2026-05-21",
    commentCount: 18,
  },
  {
    id: "events-1",
    boardKey: "events",
    title: "지난 이벤트 당첨자 발표",
    author: "운영팀",
    createdAt: "2026-05-20",
    commentCount: 2,
  },
  {
    id: "suggestions-4",
    boardKey: "suggestions",
    title: "레시피 난이도 필터가 있으면 좋겠어요",
    author: "flourish",
    createdAt: "2026-05-23",
    commentCount: 5,
  },
  {
    id: "suggestions-3",
    boardKey: "suggestions",
    title: "재료 단위 변환 기능 제안",
    author: "scale-up",
    createdAt: "2026-05-22",
    commentCount: 13,
  },
  {
    id: "suggestions-2",
    boardKey: "suggestions",
    title: "내가 저장한 레시피 모아보기",
    author: "bookmark",
    createdAt: "2026-05-21",
    commentCount: 7,
  },
  {
    id: "suggestions-1",
    boardKey: "suggestions",
    title: "사진 여러 장 업로드 개선 요청",
    author: "gallery",
    createdAt: "2026-05-20",
    commentCount: 3,
  },
];

const lockedRecipePreviews: PostPreview[] = Array.from({ length: 4 }, (_, index) => ({
  id: `private-recipes-locked-${index + 1}`,
  boardKey: "private-recipes",
  title: "이 레시피는 공개되지 않았습니다",
  author: "비공개",
  createdAt: "",
  commentCount: 0,
  isLocked: true,
}));

type PreviewOptions = {
  viewerId?: string;
  limit?: number;
};

export function getBoardPreviews(
  board: BoardConfig,
  { viewerId, limit = MAIN_PREVIEW_LIMIT }: PreviewOptions = {},
) {
  if (board.visibility === "owner-only" && !viewerId) {
    return lockedRecipePreviews.slice(0, limit);
  }

  return postPreviews
    .filter((post) => {
      if (post.boardKey !== board.key) {
        return false;
      }

      if (board.visibility === "owner-only") {
        return post.ownerId === viewerId;
      }

      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function getBoardByKey(boardKey: string) {
  return boardConfigs.find((board) => board.key === boardKey);
}

export function getBoardPosts(board: BoardConfig, { viewerId }: PreviewOptions = {}) {
  if (board.visibility === "owner-only" && !viewerId) {
    return lockedRecipePreviews.slice(0, MAIN_PREVIEW_LIMIT);
  }

  return postPreviews
    .filter((post) => {
      if (post.boardKey !== board.key) {
        return false;
      }

      if (board.visibility === "owner-only") {
        return post.ownerId === viewerId;
      }

      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPostById(postId: string, { viewerId }: PreviewOptions = {}) {
  const post = postPreviews.find((item) => item.id === postId);

  if (!post) {
    return undefined;
  }

  const board = getBoardByKey(post.boardKey);

  if (!board) {
    return undefined;
  }

  if (board.visibility === "owner-only" && post.ownerId !== viewerId) {
    return undefined;
  }

  return post;
}

export function getLockedRecipePreviews(limit = MAIN_PREVIEW_LIMIT) {
  return lockedRecipePreviews.slice(0, limit);
}
