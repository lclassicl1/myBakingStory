import { getViewerFromParams, type Viewer } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthParams = {
  login?: string;
  role?: string;
};

type ProfileRow = {
  display_name: string;
  email: string;
  member_grade: string;
  member_points: number;
  role: "user" | "admin";
  use_yn: boolean;
};

export async function getServerViewer(params?: AuthParams): Promise<Viewer | undefined> {
  const previewViewer = getViewerFromParams(params);

  if (previewViewer) {
    return previewViewer;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return undefined;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, display_name, role, member_grade, member_points, use_yn")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (profile) {
    if (!profile.use_yn) {
      return undefined;
    }

    return {
      email: profile.email,
      id: user.id,
      memberGrade: profile.member_grade,
      memberPoints: profile.member_points,
      name: profile.display_name,
      role: profile.role,
      useYn: profile.use_yn,
    };
  }

  const nickname = user.user_metadata.nickname;
  const displayName = typeof nickname === "string" && nickname.trim() ? nickname : user.email ?? "사용자";

  return {
    email: user.email,
    id: user.id,
    name: displayName,
    role: user.user_metadata.role === "admin" ? "admin" : "user",
    useYn: true,
  };
}
