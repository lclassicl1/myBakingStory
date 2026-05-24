# 인증 구현 계획

작성일: 2026-05-24

## 목표

myBakingStory의 인증은 Supabase Auth를 기준으로 구성한다. 초기 구현 범위는 화면과 라우트 구조를 먼저 만들고, 실제 Supabase 프로젝트 키와 Google/Kakao OAuth 설정은 이후 연결한다.

## 인증 방식

초기 지원 방식은 다음과 같다.

| 방식 | 상태 | 비고 |
| --- | --- | --- |
| 이메일 회원가입/로그인 | 구조 구현 | Supabase 키 연결 후 실제 동작 |
| Google 로그인 | 버튼/흐름 구현 | Google OAuth Client ID/Secret 필요 |
| Kakao 로그인 | 버튼/흐름 구현 | Kakao REST API Key/Client Secret 필요 |
| Apple 로그인 | 제외 | 현재 범위에서 제외 |

## 필요한 환경변수

실제 연결 시 `.env.local`에 다음 값을 설정한다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Google/Kakao provider secret은 클라이언트 코드에 직접 넣지 않는다. Supabase Dashboard의 Auth Provider 설정에 등록한다.

## 라우트 구조

| 라우트 | 역할 |
| --- | --- |
| `/login` | 로그인 화면 |
| `/signup` | 이메일 회원가입 화면 |
| `/auth/callback` | OAuth 인증 후 돌아오는 콜백 화면 |

## Supabase 설정 예정

Supabase Dashboard에서 다음 설정이 필요하다.

- `Authentication` > `URL Configuration`
  - Site URL: `http://localhost:3000`
  - Redirect URLs: `http://localhost:3000/auth/callback`
- `Authentication` > `Providers`
  - Email provider 활성화
  - Google provider 활성화 후 Client ID/Secret 등록
  - Kakao provider 활성화 후 REST API Key/Client Secret 등록

## 현재 구현 정책

- 실제 키가 없는 상태에서는 로그인/회원가입 form 제출 시 준비 중 메시지를 보여준다.
- Google/Kakao 버튼은 provider 연결 전 상태임을 안내한다.
- 화면 구조, 카피, 버튼 배치, 모바일 대응을 먼저 고정한다.
- 이후 Supabase client와 server action을 붙이면서 현재 placeholder 동작을 실제 인증 호출로 교체한다.

## 향후 교체 지점

- 로그인 form submit
  - `supabase.auth.signInWithPassword`
- 회원가입 form submit
  - `supabase.auth.signUp`
- Google/Kakao 버튼
  - `supabase.auth.signInWithOAuth`
- `/auth/callback`
  - Supabase code exchange 및 세션 쿠키 저장
- 임시 query 로그인
  - 실제 Supabase 세션 기반 viewer 조회로 교체
