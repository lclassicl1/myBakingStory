# Supabase profiles 테이블

작성일: 2026-05-24

## 목적

Supabase Auth의 `auth.users`는 로그인 인증을 담당한다. 앱에서 사용할 이름, 회원 등급, 포인트, 사용 여부는 `public.profiles` 테이블에서 관리한다.

## 중요한 설계 결정

비밀번호는 `profiles` 테이블에 저장하지 않는다.

Supabase Auth가 비밀번호 해시를 `auth` schema 내부에서 안전하게 관리한다. 앱 테이블에 비밀번호 원문이나 별도 비밀번호 컬럼을 두면 보안 위험이 커지므로 제외한다.

## 컬럼 구성

| 컬럼 | 의미 |
| --- | --- |
| `id` | `auth.users.id`를 참조하는 사용자 고유 ID |
| `email` | 이메일 형식 로그인 ID |
| `display_name` | 이름 또는 닉네임 |
| `role` | 권한 역할, `user` 또는 `admin` |
| `member_grade` | 추후 등급제용 회원 등급 |
| `member_points` | 추후 등급제용 회원 포인트 |
| `use_yn` | 앱 내 사용 여부 |
| `created_at` | 생성 시각 |
| `updated_at` | 수정 시각 |

## 적용 방법

Supabase Dashboard에서 다음 순서로 실행한다.

1. Supabase 프로젝트 접속
2. `SQL Editor` 이동
3. [202605240001_create_profiles.sql](../supabase/migrations/202605240001_create_profiles.sql) 내용 전체 복사
4. SQL Editor에 붙여넣기
5. `Run` 실행

이미 Dashboard에서 `public.profiles` 테이블을 수동 생성한 상태여도 같은 SQL을 다시 실행한다. 이 SQL은 누락된 컬럼을 보정하고, 회원가입 직후 profile을 만드는 trigger/function을 함께 생성한다.

## 회원가입 실패 시 확인할 것

### `over_email_send_rate_limit`

서버 로그에 `code: 'over_email_send_rate_limit'`, `message: 'email rate limit exceeded'`가 표시되면 DB 저장 문제가 아니라 Supabase Auth 인증 메일 발송 한도에 걸린 상태다.

개발 중에는 다음 중 하나로 처리한다.

- 잠시 기다린 뒤 다시 시도한다.
- Supabase Dashboard의 `Authentication` 설정에서 `Confirm email`을 잠시 끄고 테스트한다.
- 운영 전에는 자체 SMTP를 연결해서 인증 메일 발송 한도를 늘리고 발송 안정성을 확보한다.

이 경우 `public.profiles`에 값이 저장되지 않는 것은 회원가입 요청 자체가 429로 거절되었기 때문이다.

### DB trigger 오류

회원가입 화면에 `profiles 테이블과 회원 생성 trigger 설정을 확인해 주세요` 메시지가 표시되면 대부분 DB trigger 또는 테이블 컬럼 구성이 맞지 않는 상태다.

이 경우 Supabase Dashboard의 `SQL Editor`에서 [202605240001_create_profiles.sql](../supabase/migrations/202605240001_create_profiles.sql)을 전체 실행한 뒤 다시 회원가입을 시도한다.

trigger가 설치되어 있는지 확인하려면 SQL Editor에서 다음 쿼리를 실행한다.

```sql
select tgname
from pg_trigger
where tgrelid = 'auth.users'::regclass
  and tgname = 'on_auth_user_created_create_profile';
```

결과가 1행이어야 한다.

## 회원가입 후 동작

새 사용자가 Supabase Auth로 회원가입하면 `auth.users`에 사용자가 생성된다. 이후 trigger가 자동으로 `public.profiles`에 다음 기본 값을 만든다.

```text
role: user
member_grade: basic
member_points: 0
use_yn: true
```

닉네임은 회원가입 시 전달한 `nickname` metadata를 우선 사용한다. 없으면 이메일 앞부분을 기본 이름으로 사용한다.

이미 회원가입 테스트로 생성된 기존 사용자도 migration 실행 시 한 번 backfill된다.

## 회원가입 양식과 저장 컬럼 매핑

현재 회원가입 양식은 다음 값들을 Supabase Auth로 보낸다.

| 회원가입 입력값 | 저장 위치 |
| --- | --- |
| 닉네임 | `auth.users.raw_user_meta_data.nickname` → trigger로 `public.profiles.display_name` 저장 |
| 이메일 | `auth.users.email` → trigger로 `public.profiles.email` 저장 |
| 비밀번호 | `auth` schema 내부에서 Supabase Auth가 해시로 관리 |
| 비밀번호 확인 | 저장하지 않음, 클라이언트/서버 검증용 |

`public.profiles`의 등급/포인트/사용 여부는 회원가입 시 다음 기본값으로 자동 생성된다.

| 컬럼 | 기본값 |
| --- | --- |
| `role` | `user` |
| `member_grade` | `basic` |
| `member_points` | `0` |
| `use_yn` | `true` |

로그인 후 앱에서 사용자 정보를 조회할 때는 `public.profiles`를 우선 사용한다.

## RLS 정책

초기 정책은 안전하게 시작한다.

- 로그인한 사용자는 본인의 profile만 조회 가능
- profile 생성은 Auth trigger가 처리
- 사용자 직접 update 정책은 아직 열지 않음

프로필 수정 기능을 만들 때 update 정책 또는 서버 액션을 별도로 추가한다.
