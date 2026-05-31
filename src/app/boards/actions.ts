"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { canCreatePost, canManagePost } from "@/lib/auth";
import { getServerViewer } from "@/lib/auth-server";
import { getBoard, getPostForDetail } from "@/lib/board-data";
import { withMessage } from "@/lib/redirect-message";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getRecipeVisibility(formData: FormData) {
  return formData.getAll("recipeVisibility").map(String).includes("public") ? "public" : "owner-only";
}

function isPrivateRecipeBoard(boardKey: string) {
  return boardKey === "private-recipes";
}

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

async function syncRecipePublication(postId: string, visibility: "public" | "owner-only") {
  const supabase = await createSupabaseServerClient();

  if (visibility === "public") {
    const { error } = await supabase
      .from("recipe_publications")
      .upsert(
        {
          hidden_at: null,
          published_at: new Date().toISOString(),
          source_post_id: postId,
        },
        {
          onConflict: "source_post_id",
        },
      );

    return error;
  }

  const { error } = await supabase
    .from("recipe_publications")
    .update({
      hidden_at: new Date().toISOString(),
    })
    .eq("source_post_id", postId);

  return error;
}

function getVisibilityToggleValue(formData: FormData) {
  return String(formData.get("visibility") ?? "owner-only") === "public" ? "public" : "owner-only";
}

export async function createPost(formData: FormData) {
  const boardKey = String(formData.get("boardKey") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const board = await getBoard(boardKey);
  const visibility = isPrivateRecipeBoard(boardKey) ? getRecipeVisibility(formData) : "public";

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
      visibility,
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

  if (isPrivateRecipeBoard(boardKey)) {
    const publicationError = await syncRecipePublication(data.id, visibility);

    if (publicationError) {
      console.error("Supabase recipe publication sync failed after insert", {
        boardKey,
        code: publicationError.code,
        message: publicationError.message,
      });

      redirect(withMessage(`/boards/${boardKey}/${data.id}`, "레시피 공개 설정 저장에 실패했습니다. 수정 화면에서 다시 시도해 주세요."));
    }
  }

  redirect(`/boards/${boardKey}/${data.id}`);
}

export async function updatePost(formData: FormData) {
  const boardKey = String(formData.get("boardKey") ?? "").trim();
  const postId = String(formData.get("postId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const board = await getBoard(boardKey);
  const visibility = isPrivateRecipeBoard(boardKey) ? getRecipeVisibility(formData) : "public";

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
      visibility,
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

  if (isPrivateRecipeBoard(boardKey)) {
    const publicationError = await syncRecipePublication(postId, visibility);

    if (publicationError) {
      console.error("Supabase recipe publication sync failed after update", {
        boardKey,
        code: publicationError.code,
        message: publicationError.message,
        postId,
      });

      redirect(withMessage(`/boards/${boardKey}/${postId}/edit`, "레시피 공개 설정 저장에 실패했습니다. 다시 시도해 주세요."));
    }
  }

  redirect(`/boards/${boardKey}/${postId}`);
}

export async function updateRecipeVisibility(formData: FormData) {
  const boardKey = String(formData.get("boardKey") ?? "").trim();
  const postId = String(formData.get("postId") ?? "").trim();
  const returnPath = String(formData.get("returnPath") ?? `/boards/${boardKey}`).trim();
  const visibility = getVisibilityToggleValue(formData);
  const board = await getBoard(boardKey);

  if (!board || !postId || !isPrivateRecipeBoard(boardKey)) {
    redirect(withMessage(returnPath || "/", "공개 설정을 변경할 수 없는 게시글입니다."));
  }

  const viewer = await getServerViewer();

  if (!viewer) {
    redirect(withMessage(returnPath, "로그인을 하지 않으면 공개 설정을 변경할 수 없습니다."));
  }

  const post = await getPostForDetail(board, postId, viewer);

  if (!post) {
    redirect(withMessage(returnPath, "게시글이 없거나 접근 권한이 없습니다."));
  }

  if (!canManagePost(post.ownerId, viewer)) {
    redirect(withMessage(returnPath, "공개 설정을 변경할 권한이 없습니다."));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("posts")
    .update({
      visibility,
    })
    .eq("id", postId)
    .eq("board_id", board.id)
    .is("deleted_at", null);

  if (error) {
    console.error("Supabase recipe visibility update failed", {
      boardKey,
      code: error.code,
      message: error.message,
      postId,
    });

    redirect(withMessage(returnPath, getUpdatePostErrorMessage(error.message)));
  }

  const publicationError = await syncRecipePublication(postId, visibility);

  if (publicationError) {
    console.error("Supabase recipe publication sync failed after visibility toggle", {
      boardKey,
      code: publicationError.code,
      message: publicationError.message,
      postId,
    });

    redirect(withMessage(returnPath, "레시피 공개 설정 저장에 실패했습니다. 다시 시도해 주세요."));
  }

  revalidatePath("/");
  revalidatePath("/boards/private-recipes");
  revalidatePath("/boards/public-recipes");
  revalidatePath(`/boards/private-recipes/${postId}`);
  revalidatePath(`/boards/public-recipes/${postId}`);
  redirect(returnPath);
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
