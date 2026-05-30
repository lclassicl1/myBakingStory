import type { BoardConfig } from "@/lib/boards";

export type ViewerRole = "user" | "admin";

export type Viewer = {
  email?: string;
  id: string;
  memberGrade?: string;
  memberPoints?: number;
  name: string;
  role: ViewerRole;
  useYn?: boolean;
};

export function canCreatePost(board: BoardConfig, viewer?: Viewer) {
  if (!board.allowsWriting) {
    return false;
  }

  if (!viewer) {
    return false;
  }

  if (board.writePermission === "admin") {
    return viewer.role === "admin";
  }

  return true;
}

export function canManagePost(postAuthorId?: string, viewer?: Viewer) {
  if (!viewer || !postAuthorId) {
    return false;
  }

  return viewer.role === "admin" || viewer.id === postAuthorId;
}
