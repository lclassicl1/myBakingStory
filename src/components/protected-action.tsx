"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { X } from "lucide-react";

type ProtectedActionProps = {
  canAccess: boolean;
  href: string;
  label: string;
  message: string;
  children: ReactNode;
  className?: string;
  lockedClassName?: string;
  title?: string;
};

export function ProtectedAction({
  canAccess,
  href,
  label,
  message,
  children,
  className,
  lockedClassName,
  title,
}: ProtectedActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  if (canAccess) {
    return (
      <Link className={className} href={href} aria-label={label} title={title}>
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
            <h2 id={titleId}>로그인 필요</h2>
            <p>{message}</p>
            <button className="primary-button" type="button" onClick={() => setIsOpen(false)}>
              확인
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
