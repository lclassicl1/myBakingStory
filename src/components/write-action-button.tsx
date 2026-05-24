"use client";

import { Plus } from "lucide-react";

import { ProtectedAction } from "@/components/protected-action";

type WriteActionButtonProps = {
  canWrite: boolean;
  href: string;
  icon: string;
  label: string;
  message: string;
  modalTone?: "login" | "permission" | "private";
};

export function WriteActionButton({ canWrite, href, icon, label, message, modalTone = "login" }: WriteActionButtonProps) {
  return (
    <ProtectedAction
      actionHref={modalTone === "login" ? "/login" : undefined}
      canAccess={canWrite}
      className="icon-link"
      href={href}
      icon={icon}
      label={label}
      lockedClassName="icon-link icon-link--muted"
      message={message}
      modalTitle={modalTone === "permission" ? "작성 권한이 없어요" : undefined}
      modalTone={modalTone}
      secondaryLabel={modalTone === "permission" ? "닫기" : "지금은 둘러보기"}
      title={canWrite ? label : "로그인 필요"}
    >
      <Plus aria-hidden="true" size={18} />
    </ProtectedAction>
  );
}
