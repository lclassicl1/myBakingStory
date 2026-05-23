import type { BoardConfig } from "@/lib/boards";

export type ViewerRole = "user" | "admin";

export type Viewer = {
  id: string;
  name: string;
  role: ViewerRole;
};

type AuthParams = {
  login?: string;
  role?: string;
};

export function getViewerFromParams(params?: AuthParams): Viewer | undefined {
  if (params?.login !== "1") {
    return undefined;
  }

  const isAdmin = params.role === "admin";

  return {
    id: isAdmin ? "site-owner" : "demo-user",
    name: isAdmin ? "운영자" : "나",
    role: isAdmin ? "admin" : "user",
  };
}

export function getAuthQuery(viewer?: Viewer) {
  if (!viewer) {
    return "";
  }

  const params = new URLSearchParams({ login: "1" });

  if (viewer.role === "admin") {
    params.set("role", "admin");
  }

  return `?${params.toString()}`;
}

export function getHrefWithAuth(href: string, viewer?: Viewer) {
  return `${href}${getAuthQuery(viewer)}`;
}

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
