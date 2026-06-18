# ScholarMate Frontend

ScholarMate는 사용자의 학적, 지역, 소득, 관심 조건을 바탕으로 장학금을 탐색하고 추천받을 수 있는 React 기반 프론트엔드입니다. 장학금 목록, 맞춤 추천, 관심 장학금, 마감 캘린더, 커뮤니티, 공지, 1:1 메시지 기능을 제공합니다.

## 주요 기능

- JWT 로그인, 회원가입, 이메일 인증, 아이디/비밀번호 찾기
- 장학금 목록 검색, 유형 필터, 정렬, 페이지네이션
- 사용자 장학 정보 기반 맞춤 장학금 추천과 추천 이유 확인
- 관심 장학금 등록, 해제, 목록 관리
- 장학금 마감 캘린더, 제출 완료 표시, 마감 알림 등록
- 커뮤니티 게시글, 댓글, 대댓글, 좋아요, 북마크, 공유
- 공지사항 목록과 상세 페이지
- 사용자 간 1:1 메시지와 읽음 처리
- React Query 기반 서버 상태 캐싱과 JWT 자동 갱신

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 런타임 | React 18, Vite 6 |
| 언어 | JavaScript, JSX |
| 라우팅 | React Router |
| 서버 상태 | TanStack React Query |
| 클라이언트 상태 | Redux Toolkit |
| API 통신 | Axios |
| UI | CSS, Tailwind CSS, Ant Design, React Icons |
| 품질 확인 | ESLint, Node test runner, Lighthouse, axe-core |

## 시작하기

### 요구 사항

- Node.js 18 이상
- npm
- ScholarMate 백엔드 API 서버

### 설치

```bash
npm install
```

### 환경 변수

`.env.example`을 참고해 `.env`를 생성합니다.

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=
VITE_WITH_CREDENTIALS=false
```

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 프론트엔드에서 사용할 API base URL | `/api` |
| `VITE_API_PROXY_TARGET` | 개발 서버 프록시 대상 백엔드 URL | 빈 값 |
| `VITE_WITH_CREDENTIALS` | 쿠키 기반 인증이 필요할 때 Axios credentials 활성화 | `false` |

로컬 개발에서 백엔드가 `http://localhost:8000`에서 실행 중이라면 다음처럼 설정할 수 있습니다.

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:8000
VITE_WITH_CREDENTIALS=false
```

### 개발 서버 실행

```bash
npm run dev
```

기본 개발 서버 주소는 `http://localhost:5173`입니다.

### 프로덕션 빌드

```bash
npm run build
```

빌드 결과물은 `dist/`에 생성됩니다.

### 빌드 결과 미리보기

```bash
npm run preview
```

## 사용 가능한 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | Vite 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 생성 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | ESLint 검사 |
| `npm test` | Node test runner 기반 단위 테스트 실행 |
| `npm run test:e2e` | 프로덕션 E2E 및 접근성 smoke 테스트 |
| `npm run test:lighthouse` | Lighthouse 리포트 측정 |
| `npm run test:performance` | API 연동 성능 측정 |

QA 리포트와 측정 결과는 `.portfolio-work/`에 생성되며, 이 폴더는 커밋 대상에서 제외됩니다.

## 주요 라우트

| 경로 | 화면 |
| --- | --- |
| `/` | 홈 |
| `/login`, `/register` | 로그인, 회원가입 |
| `/scholarships` | 장학금 목록 |
| `/recommendation` | 맞춤 장학금 추천 |
| `/interest` | 관심 장학금 |
| `/calendar` | 장학금 마감 캘린더 |
| `/userinfor` | 나의 장학 정보 입력 |
| `/community`, `/community/:id` | 커뮤니티 목록과 상세 |
| `/notice`, `/notice/:id` | 공지사항 목록과 상세 |
| `/messages`, `/messages/:conversationId` | 메시지 목록과 대화 |
| `/profile` | 사용자 프로필 |
| `/introduction` | 서비스 소개 |

## 프로젝트 구조

```text
src/
  api/                 API 클라이언트와 도메인별 요청 함수
  app/                 Redux store 설정
  assets/              CSS와 이미지 리소스
  components/          공통 컴포넌트와 홈 섹션 컴포넌트
  data/                정적 데이터
  features/            도메인별 컴포넌트, 훅, 유틸
  pages/               라우트 단위 페이지
  shared/              공통 훅, query key, query client, 유틸
```

## API 연동

API 요청은 `src/api/axios.js`의 공통 Axios 인스턴스를 사용합니다. Access token은 `localStorage`의 `token`, refresh token은 `refreshToken` 키를 사용하며, access token 만료 시 `/auth/jwt/refresh/`로 자동 갱신합니다.

개발 서버에서 `VITE_API_PROXY_TARGET`을 설정하면 `/api`, `/media`, `/static` 요청이 백엔드 서버로 프록시됩니다.

## 배포

Vercel 배포 설정은 `vercel.json`에 포함되어 있습니다.

- 빌드 명령어: `npm run build`
- 출력 디렉터리: `dist`
- SPA 라우팅을 위해 정적 자산을 제외한 요청은 `index.html`로 rewrite

## 검증

현재 기준으로 `npm run build`가 성공해야 배포 가능한 상태로 봅니다. 기능 변경 후에는 변경 범위에 따라 `npm test`, `npm run lint`, `npm run test:e2e`를 추가로 실행하는 것을 권장합니다.
