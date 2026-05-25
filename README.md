# VibeTask 📋

> 일상 할 일과 장기 목표를 함께 관리하는 풀스택 Todo 앱

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## 📸 주요 화면

| 일일 할 일 | 장기 목표 | 캘린더 뷰 |
|:-----------:|:---------:|:---------:|
| 오늘/날짜별 과거 기록 분리 | 타임라인 진행률 바 | 월간 캘린더 + 날짜별 현황 |

---

## ✨ 주요 기능

### 🔐 인증
- JWT 기반 회원가입 / 로그인
- 토큰 만료 시 자동 로그아웃
- 비밀번호 bcrypt 해싱

### 🗒️ 일일 할 일 (Daily Todo)
- 할 일 추가 / 수정 / 삭제 / 완료 토글
- 우선순위 설정 (높음 / 보통 / 낮음)
- 기한일(dueDate) 설정 · D-Day 카운트다운
- 드래그 앤 드롭으로 순서 재정렬
- **오늘 섹션 + 날짜별 과거 기록** (최신→과거 순, 접기/펼치기)

### 🎯 장기 목표 (Long-term Goal)
- 시작일 · 종료일 필수 설정
- 타임라인 진행률 바 (경과일 / 총 기간)
- D-Day · 초과 여부 실시간 표시
- 완료 상태 토글

### 📅 캘린더 뷰
- 월간 그리드 캘린더
- 날짜별 할 일 칩 미리보기
- 완료 현황 배지 (전체 완료 / 일부 완료 / 미완료)
- 날짜 클릭 시 상세 패널 (완료율 + 할 일 목록)
- 이달 통계 (총 할 일 / 완료 / 미완료)

### 🏷️ 카테고리
- 사용자 정의 카테고리 생성 · 삭제
- 9가지 색상 선택
- 카테고리별 할 일 수 표시

### 🎨 UI / UX
- 다크 / 라이트 모드 토글
- Glassmorphism 디자인
- 검색 · 필터 (전체 / 진행 중 / 완료)
- 토스트 알림

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | React 18, TypeScript, Vite, React Router v6 |
| **Styling** | Vanilla CSS (CSS Custom Properties, Glassmorphism) |
| **Backend** | Node.js, Express 4, TypeScript |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL 16 |
| **인증** | JWT (jsonwebtoken), bcryptjs |
| **HTTP Client** | Axios |
| **컨테이너** | Docker, Docker Compose |

---

## 📁 프로젝트 구조

```
vibe_todolist/
├── docker-compose.yml          # 전체 서비스 오케스트레이션
├── .env                        # 환경 변수
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma       # DB 모델 정의
│   │   └── migrations/         # 마이그레이션 파일
│   └── src/
│       ├── index.ts            # 서버 진입점
│       ├── app.ts              # Express 앱 설정
│       ├── controllers/        # 요청 핸들러
│       ├── services/           # 비즈니스 로직
│       ├── routes/             # API 라우터
│       ├── middleware/         # 인증, 에러 핸들러
│       └── types/              # TypeScript 타입
│
└── frontend/
    ├── Dockerfile
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── App.tsx             # 라우팅 설정
        ├── main.tsx
        ├── index.css           # 전역 스타일 · 디자인 토큰
        ├── api/                # Axios 인스턴스 · API 함수
        ├── contexts/           # AuthContext, TodoContext
        ├── components/
        │   ├── auth/           # 로그인 · 회원가입
        │   ├── layout/         # Header, Sidebar
        │   └── todo/           # Todo 관련 컴포넌트
        ├── pages/              # TodoPage
        └── types/              # 공유 타입 정의
```

---

## 🗄️ 데이터베이스 스키마

```prisma
model User {
  id         String     @id @default(uuid())
  username   String     @unique
  email      String     @unique
  password   String     // bcrypt 해시
  todos      Todo[]
  categories Category[]
}

model Todo {
  id         String    @id @default(uuid())
  title      String
  type       TodoType  // DAILY | LONGTERM
  completed  Boolean   @default(false)
  priority   Priority  // HIGH | MEDIUM | LOW
  dueDate    DateTime?             // 일일: 선택적 기한
  startDate  DateTime?             // 장기: 필수 시작일
  endDate    DateTime?             // 장기: 필수 종료일
  memo       String?
  order      Int       @default(0) // 드래그 순서
  userId     String
  categoryId String?
}

model Category {
  id     String @id @default(uuid())
  name   String
  color  String @default("#6366f1")
  userId String
}
```

---

## 🚀 실행 방법

### 사전 요구사항
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd vibe_todolist
```

### 2. 환경 변수 설정

`.env` 파일이 이미 포함되어 있습니다. 프로덕션 배포 시 반드시 아래 값을 변경하세요:

```env
POSTGRES_USER=todouser
POSTGRES_PASSWORD=todopassword
POSTGRES_DB=tododb
DATABASE_URL=postgresql://todouser:todopassword@db:5432/tododb

JWT_SECRET=your-super-secret-jwt-key-change-in-production  # ← 반드시 변경
JWT_EXPIRES_IN=7d

PORT=3000
VITE_API_URL=http://localhost:3000
```

### 3. DB 마이그레이션 생성 (최초 1회)

```bash
cd backend
npm install
DATABASE_URL="postgresql://todouser:todopassword@localhost:5432/tododb" \
  npx prisma migrate dev --name init
cd ..
```

> **참고:** DB 컨테이너가 먼저 실행 중이어야 합니다.  
> 또는 `docker compose up -d db` 후 위 명령 실행

### 4. 전체 서비스 실행

```bash
docker compose up --build
```

| 서비스 | URL |
|--------|-----|
| 🌐 Frontend | http://localhost:5173 |
| 🚀 Backend API | http://localhost:3000 |
| 📡 Health Check | http://localhost:3000/health |

### 5. 서비스 종료

```bash
docker compose down
```

데이터를 포함한 볼륨까지 삭제하려면:

```bash
docker compose down -v
```

---

## 📡 API 엔드포인트

### 인증 (`/api/auth`)

| Method | Path | 설명 |
|--------|------|------|
| `POST` | `/register` | 회원가입 |
| `POST` | `/login` | 로그인 |
| `GET` | `/me` | 내 정보 조회 (인증 필요) |

### 할 일 (`/api/todos`) — 인증 필요

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/` | 전체 할 일 조회 (`?type=DAILY\|LONGTERM`) |
| `POST` | `/` | 할 일 생성 |
| `PUT` | `/:id` | 할 일 수정 |
| `PATCH` | `/:id/toggle` | 완료 상태 토글 |
| `PATCH` | `/reorder` | 순서 재정렬 |
| `DELETE` | `/:id` | 할 일 삭제 |

### 카테고리 (`/api/categories`) — 인증 필요

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/` | 카테고리 목록 조회 |
| `POST` | `/` | 카테고리 생성 |
| `DELETE` | `/:id` | 카테고리 삭제 |

---

## 🔧 개발 환경 (로컬 실행)

Docker 없이 로컬에서 실행하려면:

**Backend**
```bash
cd backend
npm install
# .env에서 DATABASE_URL을 localhost로 변경
npm run dev   # ts-node-dev, port 3000
```

**Frontend**
```bash
cd frontend
npm install
# vite.config.ts에서 proxy target을 http://localhost:3000으로 변경
npm run dev   # Vite dev server, port 5173
```

---

## 📝 라이선스

MIT
