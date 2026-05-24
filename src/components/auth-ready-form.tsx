"use client";

import { useState, type FormEvent } from "react";

type AuthReadyFormProps = {
  buttonLabel: string;
  children: React.ReactNode;
  requirePasswordConfirmation?: boolean;
  readyMessage: string;
};

export function AuthReadyForm({
  buttonLabel,
  children,
  readyMessage,
  requirePasswordConfirmation = false,
}: AuthReadyFormProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (requirePasswordConfirmation) {
      const formData = new FormData(event.currentTarget);
      const password = formData.get("password");
      const passwordConfirm = formData.get("passwordConfirm");

      if (password !== passwordConfirm) {
        setMessage("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        return;
      }
    }

    setMessage(readyMessage);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {children}
      <button className="primary-button primary-button--full" type="submit">
        {buttonLabel}
      </button>
      {message ? (
        <p className="inline-notice" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
