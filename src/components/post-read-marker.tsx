"use client";

import { useEffect } from "react";

type PostReadMarkerProps = {
  postId: string;
};

export function PostReadMarker({ postId }: PostReadMarkerProps) {
  useEffect(() => {
    void fetch("/api/post-reads", {
      body: JSON.stringify({ postId }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  }, [postId]);

  return null;
}
