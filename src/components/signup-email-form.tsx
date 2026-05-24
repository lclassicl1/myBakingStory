"use client";

import { X } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";

import { signupWithEmail } from "@/app/signup/actions";

type SignupEmailFormProps = {
  message?: string;
};

export function SignupEmailForm({ message }: SignupEmailFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalTitleId = useId();

  const hasConfirmationInput = passwordConfirm.length > 0;
  const isPasswordMismatch = hasConfirmationInput && password !== passwordConfirm;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (password !== passwordConfirm) {
      event.preventDefault();
      setIsModalOpen(true);
      return;
    }
  }

  return (
    <>
      <form action={signupWithEmail} className="auth-form" onSubmit={handleSubmit} ref={formRef}>
        <label className="form-field">
          <span>닉네임</span>
          <input autoComplete="nickname" name="nickname" placeholder="베이킹 닉네임" required type="text" />
        </label>
        <label className="form-field">
          <span>이메일</span>
          <input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
        </label>
        <label className="form-field">
          <span>비밀번호</span>
          <input
            autoComplete="new-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="8자 이상 권장"
            required
            type="password"
            value={password}
          />
        </label>
        <label className="form-field">
          <span>비밀번호 확인</span>
          <input
            aria-describedby={isPasswordMismatch ? "password-confirm-error" : undefined}
            aria-invalid={isPasswordMismatch}
            autoComplete="new-password"
            name="passwordConfirm"
            onChange={(event) => setPasswordConfirm(event.target.value)}
            placeholder="비밀번호를 한 번 더 입력하세요"
            required
            type="password"
            value={passwordConfirm}
          />
        </label>
        {isPasswordMismatch ? (
          <p className="field-error" id="password-confirm-error" role="status">
            비밀번호가 일치하지 않습니다.
          </p>
        ) : null}
        <button className="primary-button primary-button--full" type="submit">
          이메일로 회원가입
        </button>
        {message ? (
          <p className="inline-notice" role="status">
            {message}
          </p>
        ) : null}
      </form>

      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-dialog__close" type="button" aria-label="닫기" onClick={() => setIsModalOpen(false)}>
              <X aria-hidden="true" size={18} />
            </button>
            <span className="modal-dialog__icon modal-dialog__icon--permission" aria-hidden="true">
              !
            </span>
            <h2 id={modalTitleId}>비밀번호가 일치하지 않습니다</h2>
            <p>비밀번호와 비밀번호 확인란에 같은 값을 입력한 뒤 다시 회원가입을 진행해 주세요.</p>
            <div className="modal-dialog__actions">
              <button className="primary-button" type="button" onClick={() => setIsModalOpen(false)}>
                확인했어요
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
