# Baking Community 개발환경 기록

작성일: 2026-05-22

이 문서는 베이킹 커뮤니티 프로젝트를 웹 우선으로 시작하기 위해 현재 PC와 workspace에 구성한 개발환경을 기록한다. 초기 방향은 웹 앱을 먼저 완성하고, 이후 같은 웹 앱을 모바일 앱의 웹뷰로 감싸는 방식이다.

## 개발 방향

- 우선순위: 웹 앱 개발
- 이후 확장: Capacitor 기반 모바일 웹뷰 앱
- 주요 언어: TypeScript
- 추천 프론트엔드: Next.js + React
- 추천 스타일링: Tailwind CSS + shadcn/ui
- 추천 백엔드/DB: Supabase + PostgreSQL
- 추천 ORM: Prisma
- 패키지 매니저: pnpm

## Workspace

현재 workspace:

```text
D:\codex project
```

설치한 portable 개발 도구는 workspace 내부의 `.tools` 폴더에 둔다.

```text
D:\codex project\.tools
```

시스템 전역 환경을 크게 바꾸지 않고, 프로젝트별 개발환경을 켜서 사용하는 방식으로 구성했다.

## 개발환경 활성화 스크립트

생성한 파일:

```text
D:\codex project\dev-env.cmd
```

사용 방법:

```cmd
cd /d "D:\codex project"
cmd /k dev-env.cmd
```

이 명령으로 열린 터미널에서는 다음 경로들이 우선 적용된다.

- Node.js portable 경로
- JDK 21 portable 경로
- Android SDK platform-tools
- Android SDK command-line tools
- Android Emulator
- VS Code CLI 경로

PowerShell에서는 `pnpm.ps1` 실행 정책 문제가 생길 수 있으므로, 현재는 `cmd` 기반 사용을 권장한다.

## Node.js

기존 시스템 Node.js:

```text
v18.17.0
```

기존 Node.js는 설치되어 있었지만, 최신 Next.js 개발 도구가 Node.js `20.9.0` 이상을 요구하므로 프로젝트 기준으로는 부족했다.

추가 설치한 portable Node.js:

```text
D:\codex project\.tools\node-v24.16.0-win-x64
```

활성화 후 버전:

```text
node v24.16.0
npm 11.13.0
corepack 0.35.0
```

사용 권장:

```cmd
node --version
npm.cmd --version
```

Windows PowerShell에서는 `npm.ps1` 실행 정책 문제가 생길 수 있으므로, `cmd`에서는 `npm.cmd`를 사용하는 것이 안전하다.

## pnpm

설치 상태:

```text
pnpm 10.29.3
```

설치 방식:

- Corepack으로 pnpm 10.29.3 준비
- npm global 설치로 `pnpm.cmd` 실행 가능하게 구성

확인 명령:

```cmd
pnpm.cmd --version
```

주의:

- PowerShell에서 `pnpm`을 직접 실행하면 `pnpm.ps1` 실행 정책 때문에 막힐 수 있다.
- `cmd`에서는 `pnpm.cmd`를 사용하면 정상 동작한다.

## Git

설치 확인:

```text
git version 2.39.1.windows.1
```

설치 경로:

```text
C:\Program Files\Git\cmd\git.exe
```

확인 명령:

```cmd
git --version
```

## VS Code

설치 확인:

```text
Visual Studio Code 1.92.1
```

CLI 경로:

```text
C:\Users\lclas\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd
```

`dev-env.cmd`에서 VS Code CLI 경로를 PATH에 추가했다.

확인 명령:

```cmd
code.cmd --version
```

## JDK

기존 시스템 Java:

```text
Java 1.8.0_121
```

기존 Java 8은 Android SDK command-line tools 실행에 부족했다. `sdkmanager` 실행 시 더 최신 Java class file version을 요구하는 오류가 발생했다.

추가 설치한 portable JDK:

```text
D:\codex project\.tools\jdk-21.0.11+10
```

활성화 후 버전:

```text
openjdk version "21.0.11" 2026-04-21 LTS
OpenJDK Runtime Environment Temurin-21.0.11+10
OpenJDK 64-Bit Server VM Temurin-21.0.11+10
```

`dev-env.cmd`에서 다음 환경변수를 설정한다.

```cmd
JAVA_HOME=D:\codex project\.tools\jdk-21.0.11+10
```

확인 명령:

```cmd
java -version
```

## Next.js

확인한 생성 도구:

```text
create-next-app 16.2.6
```

Node.js 24 환경에서 정상 실행 확인:

```cmd
npx.cmd create-next-app --version
```

초기 프로젝트 생성 시 권장 예시:

```cmd
npx.cmd create-next-app@latest baking-community --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

또는 pnpm 기준:

```cmd
pnpm.cmd create next-app baking-community --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

## Supabase CLI

설치 확인:

```text
supabase 2.101.0
```

설치 방식:

```cmd
npm.cmd install -g supabase@2.101.0
```

확인 명령:

```cmd
supabase --version
```

주의:

- 첫 실행 시 사용자 홈의 `.supabase` 설정 폴더를 생성한다.
- 로컬 Supabase 개발 환경을 쓰려면 Docker Desktop이 추가로 필요할 수 있다.
- 웹 우선 MVP에서는 Supabase 클라우드 프로젝트를 먼저 연결해서 시작해도 된다.

## Prisma

실행 확인:

```text
prisma 7.8.0
```

확인 명령:

```cmd
npx.cmd prisma --version
```

현재는 프로젝트가 아직 생성되지 않았으므로 `@prisma/client`는 설치되어 있지 않다. Next.js 프로젝트 생성 후 필요하면 프로젝트 의존성으로 추가한다.

예상 설치 명령:

```cmd
pnpm.cmd add prisma @prisma/client
```

## shadcn/ui

CLI 실행 확인:

```text
shadcn 4.8.0
```

확인 명령:

```cmd
npx.cmd shadcn@latest --version
```

Next.js 프로젝트 생성 후 초기화 예시:

```cmd
npx.cmd shadcn@latest init
```

## Capacitor

앱 웹뷰 전환을 위한 CLI 실행 확인:

```text
@capacitor/cli 8.3.4
```

확인 명령:

```cmd
npx.cmd @capacitor/cli --version
```

현재는 웹 개발에 집중하므로 Capacitor 프로젝트 초기화는 나중에 진행한다.

추후 예상 흐름:

```cmd
pnpm.cmd add @capacitor/core @capacitor/cli
npx.cmd cap init
pnpm.cmd add @capacitor/android
npx.cmd cap add android
```

## Android SDK

Android 앱 빌드는 나중 일이지만, 현재 설치 상태는 확인되어 있다.

SDK 경로:

```text
C:\Users\lclas\AppData\Local\Android\Sdk
```

`dev-env.cmd`에서 설정하는 환경변수:

```cmd
ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=%ANDROID_HOME%
```

확인된 주요 도구:

```text
adb 1.0.41
Android SDK Platform-Tools 35.0.1
Android SDK Command-line Tools 13.0
Android Emulator 34.2.15
Android SDK Platform 34
Android SDK Platform 35
Android SDK Build-Tools 30.0.3
Android SDK Build-Tools 35.0.0
```

확인 명령:

```cmd
adb version
sdkmanager.bat --list_installed
```

참고:

- Android Studio 앱 자체는 설치되어 있지 않은 것으로 보인다.
- 나중에 Capacitor Android 프로젝트를 GUI로 열고 관리하려면 Android Studio 설치를 권장한다.
- `sdkmanager` 실행 시 SDK XML version 경고가 나타났지만, 설치 목록 조회와 기본 실행은 가능했다.

## 현재 권장 개발 흐름

1. `cmd`에서 개발환경 활성화

```cmd
cd /d "D:\codex project"
cmd /k dev-env.cmd
```

2. Next.js 프로젝트 생성

```cmd
npx.cmd create-next-app@latest baking-community --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

3. 프로젝트 폴더 진입

```cmd
cd baking-community
```

4. 개발 서버 실행

```cmd
pnpm.cmd dev
```

5. 브라우저에서 확인

```text
http://localhost:3000
```

## 설치 및 확인 요약

| 항목 | 상태 | 버전/메모 |
| --- | --- | --- |
| Node.js | 설치 완료 | portable v24.16.0 |
| npm | 설치 완료 | 11.13.0 |
| pnpm | 설치 완료 | 10.29.3 |
| Git | 설치 확인 | 2.39.1.windows.1 |
| VS Code | 설치 확인 | 1.92.1 |
| JDK | 설치 완료 | Temurin 21.0.11 |
| Next.js 생성 도구 | 실행 확인 | create-next-app 16.2.6 |
| Supabase CLI | 설치 완료 | 2.101.0 |
| Prisma CLI | 실행 확인 | 7.8.0 |
| shadcn CLI | 실행 확인 | 4.8.0 |
| Capacitor CLI | 실행 확인 | 8.3.4 |
| Android SDK | 설치 확인 | API 34/35, build-tools 35 |
| Android Studio | 미설치 추정 | 앱 개발 단계에서 설치 권장 |

## 메모

- 현재 목표는 웹 우선 개발이므로 Android Studio는 당장 필수는 아니다.
- PowerShell 실행 정책을 변경하지 않고 진행했다.
- 개발 명령은 당분간 `cmd`와 `.cmd` 실행 파일을 기준으로 쓰는 것이 가장 안정적이다.
- Node.js와 JDK는 시스템 전역 설치를 바꾸지 않고 workspace portable 경로로 관리한다.
