# Supabase boards/posts 테이블

작성일: 2026-05-31

## 목적

메인화면, 게시판 목록, 게시글 상세, 글쓰기를 mock 데이터에서 Supabase DB 기반으로 전환한다.

이번 단계에서는 댓글, 좋아요, 북마크, 이미지 업로드는 아직 구현하지 않는다. 대신 이후 기능이 붙을 수 있도록 `comment_count`, `like_count`, `bookmark_count` 컬럼을 미리 둔다.

## 적용 방법

Supabase Dashboard에서 다음 순서로 실행한다.

1. Supabase 프로젝트 접속
2. `SQL Editor` 이동
3. [202605310001_create_boards_posts.sql](../supabase/migrations/202605310001_create_boards_posts.sql), [202605310002_recipe_publications.sql](../supabase/migrations/202605310002_recipe_publications.sql), [202605310003_create_post_reads.sql](../supabase/migrations/202605310003_create_post_reads.sql)을 순서대로 실행
4. SQL Editor에 붙여넣기
5. `Run` 실행

## 테이블 구성

### `public.boards`

| 컬럼 | 의미 |
| --- | --- |
| `key` | URL에 사용하는 게시판 고유 key |
| `title` | 게시판 이름 |
| `description` | 게시판 설명 |
| `visibility` | `public` 또는 `owner-only` |
| `write_permission` | `none`, `authenticated`, `admin` |
| `display_order` | 메인/목록 정렬 순서 |
| `use_yn` | 게시판 사용 여부 |

초기 게시판 6개는 migration에서 seed로 생성한다.

### `public.posts`

| 컬럼 | 의미 |
| --- | --- |
| `board_id` | `public.boards.id` 참조 |
| `author_id` | `auth.users.id` 참조 |
| `author_display_name` | 게시글 목록에 표시할 작성자명 |
| `title` | 게시글 제목 |
| `content` | 게시글 본문 |
| `visibility` | `public` 또는 `owner-only` |
| `comment_count` | 댓글 수 |
| `like_count` | 좋아요 수 |
| `bookmark_count` | 북마크 수 |
| `deleted_at` | soft delete 시각 |

### `public.recipe_publications`

| 컬럼 | 의미 |
| --- | --- |
| `source_post_id` | 모두의 레시피에 노출한 나만의 레시피 원본 글 |
| `published_at` | 공개 노출 시각 |
| `hidden_at` | 비공개 전환 시각 |

### `public.post_reads`

| 컬럼 | 의미 |
| --- | --- |
| `post_id` | 읽은 원본 게시글 |
| `user_id` | 읽은 사용자 |
| `read_at` | 마지막 읽음 처리 시각 |

## RLS 정책

- `boards`는 사용 중인 게시판만 조회 가능
- `posts`는 삭제되지 않은 글만 조회 가능
- 게시글 조회는 로그인 사용자 기준으로 허용
- 공개 게시판 글은 로그인 사용자가 조회 가능
- `owner-only` 게시판 글은 작성자 본인 또는 운영자만 조회 가능
- 공개된 나만의 레시피 원본은 모두의 레시피 참조를 통해 로그인 사용자가 조회 가능
- 읽음 기록은 로그인 사용자가 본인 기록만 조회/생성/수정 가능
- 글 작성은 로그인 사용자만 가능
- 공지사항은 운영자만 작성 가능
- 작성자 본인 또는 운영자만 게시글 update 가능
- 실제 delete는 운영자만 가능하며, 일반 삭제 UI는 우선 soft delete 방향으로 확장한다.

## 앱 연결 상태

- 메인화면 최신글은 Supabase `boards`, `posts`를 우선 조회한다.
- DB migration이 아직 적용되지 않았거나 조회가 실패하면 기존 mock 데이터로 fallback한다.
- 게시판 목록과 게시글 상세는 Supabase DB를 우선 조회한다.
- 글쓰기 화면은 `createPost` server action으로 `public.posts`에 insert한다.
- 게시글 수정은 `updatePost` server action으로 제목과 본문을 update한다.
- 나만의 레시피 공개/비공개 설정은 `recipe_publications` 참조와 `posts.visibility`를 함께 갱신한다.
- 게시글 상세 진입 시 `/api/post-reads`로 `post_reads`를 upsert해 메인화면 N 표시 기준으로 사용한다.
- 게시글 삭제는 `deletePost` server action으로 `deleted_at`을 채우는 soft delete로 처리한다.
- 인증 상태는 Supabase session과 `public.profiles` 기준으로 판단한다.

## 로컬 테스트 seed

`202605310002_recipe_publications.sql`은 활성 profile이 있으면 `나만의 레시피`에 `비공개 레시피 테스트 글`을 1개 생성한다.
여러 계정이 있는 Supabase 프로젝트에서 특정 계정으로 테스트하려면 migration 안의 주석 처리된 email 조건을 본인 이메일로 바꾼 뒤 실행한다.
앱에서 본인 글로 판정하는 기준은 `posts.author_id = auth.users.id`이며, 서버에서는 현재 로그인한 사용자 id를 `auth.uid()`/Supabase session으로 확인한다.

## 게시글 수정/삭제 정책

- 작성자 본인 또는 운영자만 수정/삭제 버튼을 볼 수 있다.
- 직접 수정 URL로 접근해도 server action과 화면에서 다시 권한을 검증한다.
- 삭제는 실제 row 삭제가 아니라 `posts.deleted_at = now()`로 처리한다.
- 앱의 목록/상세 조회는 `deleted_at is null` 조건을 사용하므로 삭제된 글은 보이지 않는다.
- 삭제 확인란에 `삭제`를 입력해야 soft delete action이 실행된다.
