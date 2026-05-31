"use client";

import Link from "next/link";
import { useId, useState, type AriaRole, type ReactNode } from "react";
import { LockKeyhole, X } from "lucide-react";

type ProtectedActionProps = {
  actionHref?: string;
  actionLabel?: string;
  canAccess: boolean;
  href: string;
  label: string;
  message: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  lockedClassName?: string;
  modalTitle?: string;
  modalTone?: "login" | "permission" | "private";
  role?: AriaRole;
  secondaryLabel?: string;
  title?: string;
};

export function ProtectedAction({
  actionHref,
  actionLabel = "로그인하러 가기",
  canAccess,
  href,
  label,
  message,
  children,
  className,
  icon = <LockKeyhole aria-hidden="true" size={24} />,
  lockedClassName,
  modalTitle,
  modalTone = "login",
  role,
  secondaryLabel = "지금은 둘러보기",
  title,
}: ProtectedActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  if (canAccess) {
    return (
      <Link className={className} href={href} aria-label={label} role={role} title={title}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button
        className={lockedClassName ?? className}
        type="button"
        aria-label={label}
        role={role}
        title={title ?? "로그인 필요"}
        onClick={() => setIsOpen(true)}
      >
        {children}
      </button>

      {isOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsOpen(false)}>
          <div
            className="modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-dialog__close" type="button" aria-label="닫기" onClick={() => setIsOpen(false)}>
              <X aria-hidden="true" size={18} />
            </button>
            <span className={`modal-dialog__icon modal-dialog__icon--${modalTone}`} aria-hidden="true">
              {icon}
            </span>
            <h2 id={titleId}>
              {modalTitle ??
                (modalTone === "permission"
                  ? "작성 권한이 없어요"
                  : modalTone === "private"
                    ? "비공개 레시피예요"
                    : "로그인이 필요해요")}
            </h2>
            <p>{message}</p>
            <div className="modal-dialog__actions">
              {actionHref ? (
                <Link className="primary-button" href={actionHref}>
                  {actionLabel}
                </Link>
              ) : null}
              <button className="secondary-button" type="button" onClick={() => setIsOpen(false)}>
                {secondaryLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
