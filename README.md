# Froebel

<p align="center">
  <img src="frontend/public/logo@2x.png" alt="Froebel Logo" width="200">
</p>

<p align="center">
  <strong>A modern AI-powered quiz platform</strong>
</p>

<p align="center">
  <sub>Named after <a href="https://en.wikipedia.org/wiki/Friedrich_Froebel">Friedrich Froebel</a> (1782-1852), the German educator who invented kindergarten.</sub>
</p>

---

## Why "Froebel"?

**Friedrich Froebel** (1782-1852) was a German educator who invented kindergarten -a word he coined himself, meaning "children's garden" in German. He saw education as nurturing growth, not forcing it.

His core belief: **learning happens through play and discovery, not rote memorization**. He created "Froebel Gifts" -a set of educational toys (blocks, balls, shapes) designed to help children discover mathematical and natural principles through hands-on exploration.

This philosophy inspired our approach to quizzes: learning should be engaging and interactive, helping knowledge stick through active participation rather than passive repetition.

---

## Screenshots

<!-- Add your screenshots here -->

| Quiz Taking                                      | Quiz Editor                                      |
| ------------------------------------------------ | ------------------------------------------------ |
| ![Quiz Taking](docs/screenshots/quiz-taking.png) | ![Quiz Editor](docs/screenshots/quiz-editor.png) |

| Course Management                        | Dashboard                                    |
| ---------------------------------------- | -------------------------------------------- |
| ![Courses](docs/screenshots/courses.png) | ![Dashboard](docs/screenshots/dashboard.png) |

---

## Features

-   **8 Question Types**  - Multiple choice, multiple answer, true/false, fill blank, dropdown, free text, numeric, file upload
-   **AI-Powered Grading**  - Integrates with Gemini, OpenAI, Claude, and DeepSeek
-   **Course Management**  - Materials, quizzes, enrollment, and progress tracking
-   **OAuth2 Authentication**  - Google, GitHub, and Microsoft login
-   **Rich Text Editor**  - LaTeX and code syntax support via Lexical
-   **Quiz Analytics**  - Performance insights, score distribution, pass rates

---

## Tech Stack

| Backend                | Frontend                 |
| ---------------------- | ------------------------ |
| Spring Boot 4.0.1      | Next.js 15.5             |
| Java 25                | React 19                 |
| PostgreSQL             | TypeScript               |
| Flyway migrations      | Tailwind CSS             |
| JWT + OAuth2           | Radix UI components      |
| Bucket4j rate limiting | Lexical rich text editor |

---

## Quick Start

### Prerequisites

-   Java 25+
-   Node.js 20+
-   PostgreSQL 15+

### 1. Clone the repository

```bash
git clone <repository-url>
cd Froebel
```

### 2. Backend Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE froebel;
```

Set environment variables (or create `backend/.env`):

```bash
export DB_USERNAME=your_db_user
export DB_PASSWORD=your_db_password
export JWT_SECRET=your_jwt_secret_key
export FRONTEND_URL=http://localhost:3000
```

Run the backend:

```bash
cd backend
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 3. Frontend Setup

Set environment variables (create `frontend/.env.local`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Optional AI grading keys:

```bash
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
CLAUDE_API_KEY=your_key
DEEPSEEK_API_KEY=your_key
```

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

### Backend

| Variable                  | Description                               | Required |
| ------------------------- | ----------------------------------------- | -------- |
| `DB_USERNAME`             | PostgreSQL username                       | Yes      |
| `DB_PASSWORD`             | PostgreSQL password                       | Yes      |
| `JWT_SECRET`              | Secret key for JWT signing                | Yes      |
| `FRONTEND_URL`            | Frontend URL for CORS and OAuth callbacks | Yes      |
| `GOOGLE_CLIENT_ID`        | Google OAuth2 client ID                   | No       |
| `GOOGLE_CLIENT_SECRET`    | Google OAuth2 client secret               | No       |
| `GITHUB_CLIENT_ID`        | GitHub OAuth2 client ID                   | No       |
| `GITHUB_CLIENT_SECRET`    | GitHub OAuth2 client secret               | No       |
| `MICROSOFT_CLIENT_ID`     | Microsoft OAuth2 client ID                | No       |
| `MICROSOFT_CLIENT_SECRET` | Microsoft OAuth2 client secret            | No       |
| `MAIL_HOST`               | SMTP server host                          | No       |
| `MAIL_USERNAME`           | SMTP username                             | No       |
| `MAIL_PASSWORD`           | SMTP password                             | No       |

### Frontend

| Variable              | Description                     | Required |
| --------------------- | ------------------------------- | -------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL            | Yes      |
| `GEMINI_API_KEY`      | Gemini API key for AI grading   | No       |
| `OPENAI_API_KEY`      | OpenAI API key for AI grading   | No       |
| `CLAUDE_API_KEY`      | Claude API key for AI grading   | No       |
| `DEEPSEEK_API_KEY`    | DeepSeek API key for AI grading | No       |

---

## Development Commands

### Backend

```bash
./mvnw spring-boot:run      # Run dev server (hot reload)
./mvnw test                 # Run tests
./mvnw package              # Build JAR
./mvnw flyway:migrate       # Apply database migrations
./mvnw flyway:info          # Check migration status
./mvnw flyway:clean         # Reset database (destructive!)
```

### Frontend

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint check
npm run format    # Prettier format
npm start         # Production server
```

---

## Project Structure

```
├── backend/                 # Spring Boot API
│   ├── src/main/java/io/froebel/backend/
│   │   ├── auth/            # Authentication (JWT, OAuth2)
│   │   ├── quiz/            # Quiz management
│   │   ├── course/          # Course management
│   │   └── ...
│   └── src/main/resources/
│       └── db/migration/    # Flyway migrations
│
├── frontend/                # Next.js application
│   ├── src/app/             # App Router pages
│   ├── src/components/      # React components
│   ├── src/contexts/        # State management
│   └── src/lib/             # Utilities
│
```

---

<p align="center">
  <sub>Proprietary software</sub>
</p>
