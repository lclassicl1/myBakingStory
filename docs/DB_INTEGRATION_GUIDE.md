# DB 연동 개발 가이드

작성일: 2026-05-30

## 목적

myBakingStory는 앞으로 화면 구현과 DB 설계를 분리해서 생각하지 않는다.

새 기능을 만들 때는 UI, Supabase 테이블, RLS 정책, server action/API, 에러 처리까지 한 흐름으로 설계하고 구현한다. 회원가입 구현 중 겪은 것처럼 화면은 정상이어도 Auth 설정, trigger, RLS, 테이블 컬럼이 맞지 않으면 기능 전체가 실패할 수 있기 때문이다.

## 기본 진행 순서

새 기능을 개발할 때는 다음 순서를 기본으로 한다.

1. 기능 요구사항 정리
2. DB 테이블, 컬럼, 관계, 기본값 설계
3. 읽기/쓰기/수정/삭제 권한과 RLS 정책 설계
4. Supabase migration SQL 작성
5. server action 또는 route handler 구현
6. UI 컴포넌트와 form 연결
7. 성공/실패 메시지와 로그 설계
8. 로컬 테스트와 Supabase Dashboard 데이터 확인

## 기능 요구사항 정리 기준

기능을 시작하기 전에 다음 질문을 먼저 확인한다.

| 질문 | 예시 |
| --- | --- |
| 누가 사용할 수 있는가? | 비로그인, 로그인 사용자, 작성자, 운영자 |
| 어떤 데이터를 읽는가? | 게시글 목록, 내 레시피, 댓글, 프로필 |
| 어떤 데이터를 생성하는가? | 게시글, 댓글, 좋아요, 북마크 |
| 수정/삭제 권한은 누구에게 있는가? | 작성자 본인, 운영자 |
| 공개 데이터인가? | 전체 공개, 로그인 사용자 공개, 본인만 공개 |
| DB trigger가 필요한가? | profile 자동 생성, updated_at 갱신, 포인트 변경 |

## DB 설계 체크리스트

테이블을 만들 때는 최소한 다음 항목을 같이 검토한다.

- 테이블 이름
- 컬럼 이름과 타입
- `not null` 여부
- 기본값
- primary key
- foreign key
- unique 제약
- check 제약
- index 필요 여부
- soft delete 필요 여부
- `created_at`, `updated_at` 필요 여부
- 기존 데이터 backfill 필요 여부

## RLS 정책 체크리스트

Supabase 테이블은 기본적으로 RLS를 고려해서 설계한다.

| 작업 | 확인할 권한 |
| --- | --- |
| select | 누가 목록/상세를 볼 수 있는가 |
| insert | 누가 새 데이터를 만들 수 있는가 |
| update | 누가 어떤 컬럼을 수정할 수 있는가 |
| delete | 실제 삭제인지 soft delete인지, 누가 가능한가 |

초기 정책은 넓게 열기보다 좁게 시작한다.

- 공개 게시글: select는 전체 또는 로그인 사용자 기준으로 결정
- 개인 데이터: `auth.uid() = user_id` 기준
- 운영자 기능: profile role 또는 별도 권한 테이블 기준
- trigger로 생성되는 데이터: `security definer` function 필요 여부 확인

## Migration 원칙

Supabase Dashboard에서 수동으로 테이블만 만들고 끝내지 않는다.

모든 DB 변경은 `supabase/migrations` 아래 SQL 파일로 남긴다.

```text
supabase/migrations/YYYYMMDDHHMM_description.sql
```

SQL은 가능하면 재실행해도 안전하게 작성한다.

- `create table if not exists`
- `alter table ... add column if not exists`
- `drop policy if exists` 후 `create policy`
- `drop trigger if exists` 후 `create trigger`
- 기존 수동 생성 테이블을 보정할 수 있는 `alter table` 포함

## Server Action/API 구현 원칙

UI에서 Supabase를 직접 호출하기보다, 보안과 권한 검증이 필요한 작업은 server action 또는 route handler를 우선 사용한다.

구현 시 확인할 것:

- 로그인 사용자 조회
- 입력값 검증
- 권한 검증
- Supabase error code/message 로그
- 사용자에게 보여줄 안전한 메시지
- 성공 후 redirect 또는 revalidate

민감한 키는 클라이언트 코드에 넣지 않는다.

## UI 연결 원칙

UI는 DB 정책과 같은 권한 모델을 따라야 한다.

- 버튼 표시 여부와 실제 서버 권한 검증을 모두 구현한다.
- 클라이언트에서 버튼을 숨겨도 서버에서 다시 검증한다.
- 실패 메시지는 사용자가 다음 행동을 알 수 있게 구체적으로 작성한다.
- 모달, inline notice, form validation은 공통 스타일을 사용한다.

## 테스트 기준

기능 구현 후 최소한 다음을 확인한다.

- `pnpm lint`
- `pnpm build`
- 로컬 화면에서 성공 플로우 확인
- 실패 플로우 확인
- Supabase Dashboard에서 row 생성/수정 확인
- RLS 때문에 예상치 못한 401/403/empty result가 없는지 확인
- 서버 로그에 Supabase error code가 남는지 확인

## 앞으로의 적용 대상

다음 기능부터 이 문서를 기준으로 DB 설계를 먼저 제안하고 구현한다.

- 게시판 테이블
- 게시글 작성/조회/수정/삭제
- 댓글
- 좋아요
- 북마크
- 이미지 업로드
- 회원 등급과 포인트
- 운영자 공지/이벤트 관리

