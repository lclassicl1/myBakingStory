import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => undefined);
  const postId = typeof body?.postId === "string" ? body.postId : "";

  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("post_reads")
    .upsert(
      {
        post_id: postId,
        read_at: new Date().toISOString(),
        user_id: user.id,
      },
      {
        onConflict: "post_id,user_id",
      },
    );

  if (error) {
    console.error("Failed to mark post as read", {
      code: error.code,
      message: error.message,
      postId,
    });

    return NextResponse.json({ error: "Failed to mark post as read" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
