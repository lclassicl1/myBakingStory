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
  created_at: string;
  updated_at: string;
};

type PostWithBoardRow = PostRow & {
  boards?: {
    key: string;
  } | null;
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

function toPostPreview(row: PostWithBoardRow, boardKey: string): PostPreview {
  return {
    id: row.id,
    boardKey: boardKey as BoardKey,
    title: row.title,
    author: getAuthorName(row),
    content: row.content,
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
    commentCount: row.comment_count,
    ownerId: row.author_id,
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

  const query = supabase
    .from("posts")
    .select("id, author_id, author_display_name, title, content, comment_count, created_at, updated_at")
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

  const query = supabase
    .from("posts")
    .select("id, author_id, author_display_name, title, content, comment_count, created_at, updated_at")
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

  const { data, error } = await supabase
    .from("posts")
    .select("id, author_id, author_display_name, title, content, comment_count, created_at, updated_at")
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
  return toPostPreview(row, board.key);
}
