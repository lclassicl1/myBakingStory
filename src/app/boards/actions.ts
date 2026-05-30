"use server";

import { redirect } from "next/navigation";

import { canCreatePost, canManagePost } from "@/lib/auth";
import { getServerViewer } from "@/lib/auth-server";
import { getBoard, getPostForDetail } from "@/lib/board-data";
import { withMessage } from "@/lib/redirect-message";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getCreatePostErrorMessage(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("row-level security") || lowerMessage.includes("permission")) {
    return "게시글 작성 권한이 없습니다. 로그인 상태와 게시판 권한을 확인해 주세요.";
  }

  if (lowerMessage.includes("violates check constraint")) {
    return "제목과 내용을 입력 조건에 맞게 작성해 주세요.";
  }

  return "게시글 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}

function getUpdatePostErrorMessage(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("row-level security") || lowerMessage.includes("permission")) {
    return "게시글을 수정할 권한이 없습니다.";
  }

  if (lowerMessage.includes("violates check constraint")) {
    return "제목과 내용을 입력 조건에 맞게 작성해 주세요.";
  }

  return "게시글 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}

function getDeletePostErrorMessage(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("row-level security") || lowerMessage.includes("permission")) {
    return "게시글을 삭제할 권한이 없습니다.";
  }

  return "게시글 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}

export async function createPost(formData: FormData) {
  const boardKey = String(formData.get("boardKey") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const board = await getBoard(boardKey);

  if (!board || !board.allowsWriting) {
    redirect(withMessage("/", "글을 작성할 수 없는 게시판입니다."));
  }

  if (!board.id) {
    redirect(withMessage(`/boards/${boardKey}/write`, "게시판 DB 테이블이 아직 연결되지 않았습니다. Supabase migration을 먼저 실행해 주세요."));
  }

  const viewer = await getServerViewer();

  if (!viewer) {
    redirect(withMessage(`/boards/${boardKey}/write`, "로그인을 하지 않으면 글을 작성할 수 없습니다."));
  }

  if (!canCreatePost(board, viewer)) {
    redirect(withMessage(`/boards/${boardKey}/write`, "글쓰기 권한이 없습니다."));
  }

  if (!title || !content) {
    redirect(withMessage(`/boards/${boardKey}/write`, "제목과 내용을 모두 입력해 주세요."));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_display_name: viewer.name,
      author_id: viewer.id,
      board_id: board.id,
      content,
      title,
      visibility: board.visibility === "owner-only" ? "owner-only" : "public",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Supabase post insert failed", {
      boardKey,
      code: error?.code,
      message: error?.message,
    });

    redirect(withMessage(`/boards/${boardKey}/write`, getCreatePostErrorMessage(error?.message ?? "")));
  }

  redirect(`/boards/${boardKey}/${data.id}`);
}

export async function updatePost(formData: FormData) {
  const boardKey = String(formData.get("boardKey") ?? "").trim();
  const postId = String(formData.get("postId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const board = await getBoard(boardKey);

  if (!board || !postId) {
    redirect(withMessage("/", "게시글 정보를 찾을 수 없습니다."));
  }

  const viewer = await getServerViewer();

  if (!viewer) {
    redirect(withMessage(`/boards/${boardKey}/${postId}/edit`, "로그인을 하지 않으면 글을 수정할 수 없습니다."));
  }

  const post = await getPostForDetail(board, postId, viewer);

  if (!post) {
    redirect(withMessage(`/boards/${boardKey}`, "게시글이 없거나 접근 권한이 없습니다."));
  }

  if (!canManagePost(post.ownerId, viewer)) {
    redirect(withMessage(`/boards/${boardKey}/${postId}`, "게시글을 수정할 권한이 없습니다."));
  }

  if (!title || !content) {
    redirect(withMessage(`/boards/${boardKey}/${postId}/edit`, "제목과 내용을 모두 입력해 주세요."));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("posts")
    .update({
      content,
      title,
    })
    .eq("id", postId)
    .eq("board_id", board.id)
    .is("deleted_at", null);

  if (error) {
    console.error("Supabase post update failed", {
      boardKey,
      code: error.code,
      message: error.message,
      postId,
    });

    redirect(withMessage(`/boards/${boardKey}/${postId}/edit`, getUpdatePostErrorMessage(error.message)));
  }

  redirect(`/boards/${boardKey}/${postId}`);
}

export async function deletePost(formData: FormData) {
  const boardKey = String(formData.get("boardKey") ?? "").trim();
  const postId = String(formData.get("postId") ?? "").trim();
  const confirmText = String(formData.get("confirmText") ?? "").trim();
  const board = await getBoard(boardKey);

  if (!board || !postId) {
    redirect(withMessage("/", "게시글 정보를 찾을 수 없습니다."));
  }

  if (confirmText !== "삭제") {
    redirect(withMessage(`/boards/${boardKey}/${postId}`, "삭제하려면 확인란에 '삭제'를 입력해 주세요."));
  }

  const viewer = await getServerViewer();

  if (!viewer) {
    redirect(withMessage(`/boards/${boardKey}/${postId}`, "로그인을 하지 않으면 글을 삭제할 수 없습니다."));
  }

  const post = await getPostForDetail(board, postId, viewer);

  if (!post) {
    redirect(withMessage(`/boards/${boardKey}`, "게시글이 없거나 접근 권한이 없습니다."));
  }

  if (!canManagePost(post.ownerId, viewer)) {
    redirect(withMessage(`/boards/${boardKey}/${postId}`, "게시글을 삭제할 권한이 없습니다."));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("posts")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("board_id", board.id)
    .is("deleted_at", null);

  if (error) {
    console.error("Supabase post delete failed", {
      boardKey,
      code: error.code,
      message: error.message,
      postId,
    });

    redirect(withMessage(`/boards/${boardKey}/${postId}`, getDeletePostErrorMessage(error.message)));
  }

  redirect(withMessage(`/boards/${boardKey}`, "게시글이 삭제되었습니다."));
}
