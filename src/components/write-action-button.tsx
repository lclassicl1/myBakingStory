"use client";

import { Plus } from "lucide-react";

import { ProtectedAction } from "@/components/protected-action";

type WriteActionButtonProps = {
  canWrite: boolean;
  href: string;
  label: string;
  message: string;
};

export function WriteActionButton({ canWrite, href, label, message }: WriteActionButtonProps) {
  return (
    <ProtectedAction
      canAccess={canWrite}
      className="icon-link"
      href={href}
      label={label}
      lockedClassName="icon-link icon-link--muted"
      message={message}
      title={canWrite ? label : "로그인 필요"}
    >
      <Plus aria-hidden="true" size={18} />
    </ProtectedAction>
  );
}
