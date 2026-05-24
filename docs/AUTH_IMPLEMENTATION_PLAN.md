# 인증 구현 계획

작성일: 2026-05-24

## 목표

myBakingStory의 인증은 Supabase Auth를 기준으로 구성한다. Supabase 프로젝트 키를 연결해 이메일 인증 흐름을 동작 가능한 구조로 구성하고, Google/Kakao OAuth는 Supabase Provider 설정이 끝나면 바로 provider 인증으로 이동하도록 준비한다.

## 인증 방식

초기 지원 방식은 다음과 같다.

| 방식 | 상태 | 비고 |
| --- | --- | --- |
| 이메일 회원가입/로그인 | 연결 완료 | Supabase Auth 사용 |
| Google 로그인 | 버튼/흐름 연결 | Supabase Google Provider 설정 필요 |
| Kakao 로그인 | 버튼/흐름 연결 | Supabase Kakao Provider 설정 필요 |
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
| `/auth/callback` | OAuth 인증 후 돌아오는 콜백 Route Handler |

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

- 이메일 로그인/회원가입은 Supabase Server Action으로 처리한다.
- Google/Kakao 버튼은 Supabase OAuth provider 호출로 연결되어 있다.
- Provider 설정이 완료되지 않은 경우 Supabase에서 provider 설정 오류가 발생할 수 있다.
- 인증 후 viewer 조회는 Supabase 세션을 우선 사용하고, 기존 query 기반 로그인은 개발 미리보기 용도로만 남긴다.

## 향후 교체 지점

- `profiles` 테이블 생성 및 role 정책 연결
- Google/Kakao Provider 키 등록
- 운영자 role을 DB 기준으로 조회
- 임시 query 로그인은 실제 Supabase 세션 기반 viewer 조회가 안정화되면 제거
