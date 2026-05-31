import type { SupabaseClient } from "@supabase/supabase-js";

import type { Viewer } from "@/lib/auth";
import {
  boardConfigs,
  getBoardByKey,
  getBoardPosts,
  getBoardPreviews,
  getLockedRecipePreviews,
  getPostById,
  MAIN_PREVIEW_LIMIT,
  type BoardConfig,
  type BoardKey,
  type BoardVisibility,
  type BoardWritePermission,
  type PostPreview,
} from "@/lib/boards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BoardRow = {
  id: string;
  key: string;
  title: string;
  description: string;
  visibility: BoardVisibility;
  write_permission: "none" | BoardWritePermission;
  display_order: number;
  use_yn: boolean;
};

type PostRow = {
  id: string;
  author_id: string;
  author_display_name: string | null;
  title: string;
  content: string;
  comment_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  visibility: BoardVisibility;
};

type PostWithBoardRow = PostRow & {
  boards?: {
    key: string;
  } | null;
};

type RecipePublicationRow = {
  source_post_id: string;
  published_at: string;
  hidden_at: string | null;
};

function toBoardConfig(row: BoardRow): BoardConfig {
  return {
    id: row.id,
    key: row.key as BoardKey,
    title: row.title,
    description: row.description,
    href: `/boards/${row.key}`,
    visibility: row.visibility,
    allowsWriting: row.write_permission !== "none",
    writePermission: row.write_permission === "none" ? undefined : row.write_permission,
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(new Date(value))
    .replace(/\. /g, "-")
    .replace(".", "");
}

function getAuthorName(row: PostRow) {
  return row.author_display_name || "사용자";
}

function toPostPreview(
  row: PostWithBoardRow,
  boardKey: string,
  options: Partial<PostPreview> = {},
): PostPreview {
  return {
    id: row.id,
    boardKey: boardKey as BoardKey,
    title: row.title,
    author: getAuthorName(row),
    content: row.content,
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
    commentCount: row.comment_count,
    likeCount: row.like_count,
    ownerId: row.author_id,
    sortAt: row.created_at,
    visibility: row.visibility,
    ...options,
  };
}

function toUnavailableRecipePreview(publication: RecipePublicationRow): PostPreview {
  return {
    id: publication.source_post_id,
    boardKey: "public-recipes",
    title: "비공개된 레시피입니다.",
    author: "비공개",
    content: "작성자가 비공개로 전환한 레시피입니다.",
    createdAt: formatDate(publication.published_at),
    commentCount: 0,
    likeCount: 0,
    isUnavailable: true,
    sourceBoardKey: "private-recipes",
    sortAt: publication.hidden_at ?? publication.published_at,
    visibility: "owner-only",
  };
}

function canReadPrivateRecipe(post: PostRow, viewer?: Viewer) {
  return Boolean(viewer && (viewer.role === "admin" || viewer.id === post.author_id));
}

const postSelectColumns =
  "id, author_id, author_display_name, title, content, visibility, comment_count, like_count, created_at, updated_at";

function getKoreanTodayRange() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const start = new Date(Date.UTC(year, month - 1, day, -9, 0, 0, 0));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    end: end.toISOString(),
    start: start.toISOString(),
  };
}

async function getSupabase() {
  try {
    return await createSupabaseServerClient();
  } catch (error) {
    console.error("Supabase client unavailable for board data", error);
    return undefined;
  }
}

async function getBoardsFromDb(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("boards")
    .select("id, key, title, description, visibility, write_permission, display_order, use_yn")
    .eq("use_yn", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to load boards from Supabase", {
      code: error.code,
      message: error.message,
    });
    return undefined;
  }

  return data?.map((row) => toBoardConfig(row as BoardRow));
}

async function getDirectPostForDetail(supabase: SupabaseClient, board: BoardConfig, postId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(postSelectColumns)
    .eq("id", postId)
    .eq("board_id", board.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("Failed to load direct post detail from Supabase", {
      boardKey: board.key,
      code: error.code,
      message: error.message,
      postId,
    });
    return undefined;
  }

  return data ? toPostPreview(data as PostWithBoardRow, board.key) : undefined;
}

async function getPublicRecipePosts(
  supabase: SupabaseClient,
  board: BoardConfig,
  viewer?: Viewer,
  limit?: number,
) {
  if (!viewer) {
    return [];
  }

  const directQuery = supabase
    .from("posts")
    .select(postSelectColumns)
    .eq("board_id", board.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (limit) {
    directQuery.limit(limit);
  }

  const { data: directData, error: directError } = await directQuery;

  if (directError) {
    console.error("Failed to load direct public recipes from Supabase", {
      code: directError.code,
      message: directError.message,
    });
    return getBoardPosts(board, { viewerId: viewer.id });
  }

  const publicationQuery = supabase
    .from("recipe_publications")
    .select("source_post_id, published_at, hidden_at")
    .order("published_at", { ascending: false });

  if (limit) {
    publicationQuery.limit(limit);
  }

  const { data: publicationData, error: publicationError } = await publicationQuery;

  if (publicationError) {
    console.error("Failed to load recipe publications from Supabase", {
      code: publicationError.code,
      message: publicationError.message,
    });
    return (directData ?? []).map((row) => toPostPreview(row as PostWithBoardRow, board.key));
  }

  const publications = (publicationData ?? []) as RecipePublicationRow[];
  const visiblePublicationIds = publications
    .filter((publication) => !publication.hidden_at)
    .map((publication) => publication.source_post_id);
  const sourcePostMap = new Map<string, PostWithBoardRow>();

  if (visiblePublicationIds.length) {
    const { data: sourceData, error: sourceError } = await supabase
      .from("posts")
      .select(postSelectColumns)
      .in("id", visiblePublicationIds)
      .is("deleted_at", null);

    if (sourceError) {
      console.error("Failed to load published private recipe source posts from Supabase", {
        code: sourceError.code,
        message: sourceError.message,
      });
    } else {
      for (const row of sourceData ?? []) {
        sourcePostMap.set(row.id, row as PostWithBoardRow);
      }
    }
  }

  const directPosts = (directData ?? []).map((row) => toPostPreview(row as PostWithBoardRow, board.key));
  const publishedPosts = publications.map((publication) => {
    const sourcePost = sourcePostMap.get(publication.source_post_id);

    if (publication.hidden_at || !sourcePost) {
      return toUnavailableRecipePreview(publication);
    }

    return toPostPreview(sourcePost, board.key, {
      createdAt: formatDate(publication.published_at),
      isUnavailable: false,
      sourceBoardKey: "private-recipes",
      sortAt: publication.published_at,
    });
  });

  const posts = [...directPosts, ...publishedPosts].sort((a, b) =>
    (b.sortAt ?? "").localeCompare(a.sortAt ?? ""),
  );

  return limit ? posts.slice(0, limit) : posts;
}

async function getPublishedRecipeForDetail(supabase: SupabaseClient, postId: string, viewer?: Viewer) {
  if (!viewer) {
    return undefined;
  }

  const { data: publicationData, error: publicationError } = await supabase
    .from("recipe_publications")
    .select("source_post_id, published_at, hidden_at")
    .eq("source_post_id", postId)
    .maybeSingle();

  if (publicationError) {
    console.error("Failed to load recipe publication detail from Supabase", {
      code: publicationError.code,
      message: publicationError.message,
      postId,
    });
    return undefined;
  }

  if (!publicationData) {
    return undefined;
  }

  const publication = publicationData as RecipePublicationRow;

  if (publication.hidden_at) {
    return toUnavailableRecipePreview(publication);
  }

  const { data: sourceData, error: sourceError } = await supabase
    .from("posts")
    .select(postSelectColumns)
    .eq("id", postId)
    .is("deleted_at", null)
    .maybeSingle();

  if (sourceError) {
    console.error("Failed to load published private recipe detail from Supabase", {
      code: sourceError.code,
      message: sourceError.message,
      postId,
    });
    return undefined;
  }

  if (!sourceData) {
    return toUnavailableRecipePreview(publication);
  }

  return toPostPreview(sourceData as PostWithBoardRow, "public-recipes", {
    createdAt: formatDate(publication.published_at),
    sourceBoardKey: "private-recipes",
    sortAt: publication.published_at,
  });
}

async function getReadPostIds(supabase: SupabaseClient, viewer: Viewer, postIds: string[]) {
  if (!postIds.length) {
    return new Set<string>();
  }

  const { data, error } = await supabase
    .from("post_reads")
    .select("post_id")
    .eq("user_id", viewer.id)
    .in("post_id", postIds);

  if (error) {
    console.error("Failed to load post read states from Supabase", {
      code: error.code,
      message: error.message,
    });
    return new Set<string>();
  }

  return new Set((data ?? []).map((row) => String(row.post_id)));
}

async function hasUnreadDirectPostsToday(supabase: SupabaseClient, board: BoardConfig, viewer: Viewer) {
  const { start, end } = getKoreanTodayRange();
  const query = supabase
    .from("posts")
    .select("id, author_id")
    .eq("board_id", board.id)
    .is("deleted_at", null)
    .gte("created_at", start)
    .lt("created_at", end);

  if (board.visibility === "owner-only") {
    query.eq("author_id", viewer.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load today's posts from Supabase", {
      boardKey: board.key,
      code: error.code,
      message: error.message,
    });
    return false;
  }

  const postIds = (data ?? []).map((row) => String(row.id));
  const readIds = await getReadPostIds(supabase, viewer, postIds);

  return postIds.some((postId) => !readIds.has(postId));
}

async function hasUnreadPublicRecipesToday(supabase: SupabaseClient, board: BoardConfig, viewer: Viewer) {
  const { start, end } = getKoreanTodayRange();
  const { data: directData, error: directError } = await supabase
    .from("posts")
    .select("id")
    .eq("board_id", board.id)
    .is("deleted_at", null)
    .gte("created_at", start)
    .lt("created_at", end);

  if (directError) {
    console.error("Failed to load today's direct public recipes from Supabase", {
      code: directError.code,
      message: directError.message,
    });
    return false;
  }

  const { data: publicationData, error: publicationError } = await supabase
    .from("recipe_publications")
    .select("source_post_id")
    .gte("published_at", start)
    .lt("published_at", end);

  if (publicationError) {
    console.error("Failed to load today's recipe publications from Supabase", {
      code: publicationError.code,
      message: publicationError.message,
    });
    return false;
  }

  const postIds = [
    ...(directData ?? []).map((row) => String(row.id)),
    ...(publicationData ?? []).map((row) => String(row.source_post_id)),
  ];
  const uniquePostIds = Array.from(new Set(postIds));
  const readIds = await getReadPostIds(supabase, viewer, uniquePostIds);

  return uniquePostIds.some((postId) => !readIds.has(postId));
}

export async function getBoards() {
  const supabase = await getSupabase();

  if (!supabase) {
    return boardConfigs;
  }

  const boards = await getBoardsFromDb(supabase);
  return boards?.length ? boards : boardConfigs;
}

export async function getBoard(boardKey: string) {
  const boards = await getBoards();
  return boards.find((board) => board.key === boardKey) ?? getBoardByKey(boardKey);
}

export async function getBoardPreviewPosts(board: BoardConfig, viewer?: Viewer, limit = MAIN_PREVIEW_LIMIT) {
  if (board.visibility === "owner-only" && !viewer) {
    return getLockedRecipePreviews(limit);
  }

  const supabase = await getSupabase();

  if (!supabase || !board.id) {
    return getBoardPreviews(board, { limit, viewerId: viewer?.id });
  }

  if (board.key === "public-recipes") {
    return getPublicRecipePosts(supabase, board, viewer, limit);
  }

  const query = supabase
    .from("posts")
    .select(postSelectColumns)
    .eq("board_id", board.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (board.visibility === "owner-only") {
    query.eq("author_id", viewer?.id ?? "");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load post previews from Supabase", {
      boardKey: board.key,
      code: error.code,
      message: error.message,
    });
    return getBoardPreviews(board, { limit, viewerId: viewer?.id });
  }

  const rows = (data ?? []) as PostWithBoardRow[];

  return rows.map((row) => toPostPreview(row, board.key));
}

export async function getBoardPostsForList(board: BoardConfig, viewer?: Viewer) {
  if (board.visibility === "owner-only" && !viewer) {
    return getLockedRecipePreviews(MAIN_PREVIEW_LIMIT);
  }

  const supabase = await getSupabase();

  if (!supabase || !board.id) {
    return getBoardPosts(board, { viewerId: viewer?.id });
  }

  if (board.key === "public-recipes") {
    return getPublicRecipePosts(supabase, board, viewer);
  }

  const query = supabase
    .from("posts")
    .select(postSelectColumns)
    .eq("board_id", board.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (board.visibility === "owner-only") {
    query.eq("author_id", viewer?.id ?? "");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load board posts from Supabase", {
      boardKey: board.key,
      code: error.code,
      message: error.message,
    });
    return getBoardPosts(board, { viewerId: viewer?.id });
  }

  const rows = (data ?? []) as PostWithBoardRow[];

  return rows.map((row) => toPostPreview(row, board.key));
}

export async function getPostForDetail(board: BoardConfig, postId: string, viewer?: Viewer) {
  const supabase = await getSupabase();

  if (!supabase || !board.id) {
    return getPostById(postId, { viewerId: viewer?.id });
  }

  if (board.key === "public-recipes") {
    const directPost = await getDirectPostForDetail(supabase, board, postId);

    if (directPost) {
      return directPost;
    }

    return getPublishedRecipeForDetail(supabase, postId, viewer);
  }

  const { data, error } = await supabase
    .from("posts")
    .select(postSelectColumns)
    .eq("id", postId)
    .eq("board_id", board.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("Failed to load post detail from Supabase", {
      boardKey: board.key,
      code: error.code,
      message: error.message,
      postId,
    });
    return getPostById(postId, { viewerId: viewer?.id });
  }

  if (!data) {
    return undefined;
  }

  const row = data as PostWithBoardRow;

  if (board.key === "private-recipes" && !canReadPrivateRecipe(row, viewer)) {
    return undefined;
  }

  return toPostPreview(row, board.key);
}

export async function hasUnreadTodayPosts(board: BoardConfig, viewer?: Viewer) {
  if (!viewer) {
    return false;
  }

  const supabase = await getSupabase();

  if (!supabase || !board.id) {
    return false;
  }

  if (board.key === "public-recipes") {
    return hasUnreadPublicRecipesToday(supabase, board, viewer);
  }

  return hasUnreadDirectPostsToday(supabase, board, viewer);
}
