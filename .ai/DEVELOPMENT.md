# PeerPod - Development Guide

## Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** or **pnpm**
- **Supabase account** (for database)
- **OpenAI API key** (optional, for AI features)

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd peer-pod-v2
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Configure Environment
Create `.env.local` in the project root:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (Optional - for AI compatibility)
OPENAI_API_KEY=sk-your-openai-api-key
```

### 4. Set Up Database
Run the SQL schema in Supabase:
```bash
# Copy contents of src/lib/schema.sql to Supabase SQL Editor
```

### 5. Seed Data (Optional)
```bash
# Seed data is automatically inserted when schema runs
# Or manually run seed.sql
```

### 6. Start Development Server
```bash
npm run dev
# or
pnpm dev
```

Server runs at `http://localhost:3000` (or next available port)

---

## Project Structure

```
peer-pod-v2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Global styles
│   │   ├── login/              # Login page
│   │   ├── quiz/               # Compatibility quiz
│   │   ├── freelancer/         # Freelancer dashboard
│   │   └── client/             # Client dashboard
│   │       └── project/[id]/   # Dynamic project pages
│   ├── components/             # Shared React components
│   │   ├── Navbar.tsx
│   │   ├── QuizProgress.tsx
│   │   └── ...
│   └── lib/                    # Core business logic
│       ├── actions.ts          # Server actions
│       ├── supabase.ts         # Supabase client
│       ├── data-supabase.ts    # Database access layer
│       ├── compatibility.ts    # Algorithmic matching
│       ├── ai-compatibility.ts # AI-powered matching
│       └── schema.sql          # Database schema
├── public/                     # Static assets
├── .env.local                  # Environment variables (not in git)
├── .env.example                # Example environment file
└── tailwind.config.ts          # Tailwind configuration
```

---

## Development Workflow

### Making Changes

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes** to relevant files

3. **Test locally**
   ```bash
   npm run dev
   ```

4. **Check for errors**
   ```bash
   npm run build
   ```

5. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

### Code Style

- TypeScript strict mode enabled
- Use Server Components by default
- Client Components only when needed (`"use client"`)
- Server Actions for all mutations (`"use server"`)
- Tailwind CSS for styling

---

## Available Scripts

| Script          | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

---

## Key Concepts

### Authentication Flow
```
1. User visits /login
2. Enters name and selects role (freelancer/client)
3. Cookie set with session info
4. Redirected to appropriate dashboard
5. Session checked on each protected page
```

### Compatibility Quiz Flow
```
1. Freelancer visits /quiz
2. Completes 6-step quiz:
   - Skills & Proficiency
   - Availability & Timezone
   - Personality (Big Five)
   - Work Style
   - Scheduling Preferences
   - Confirmation
3. Profile created in Supabase
4. Redirected to freelancer dashboard
```

### Project Matching Flow
```
1. Client creates project with requirements
2. System queries all freelancers
3. Compatibility calculated:
   - Algorithmic (default)
   - AI-powered (if enabled)
4. Candidates ranked by score
5. Client can invite/add to team
```

---

## Database Management

### Supabase Dashboard
Access at: https://supabase.com/dashboard

### Useful SQL Queries

**View all users:**
```sql
SELECT * FROM users;
```

**View freelancer profiles:**
```sql
SELECT u.name, f.* 
FROM freelancer_profiles f
JOIN users u ON f.user_id = u.id;
```

**View project applications:**
```sql
SELECT p.title, u.name, pg.status
FROM project_groups pg
JOIN projects p ON pg.project_id = p.id
JOIN users u ON pg.freelancer_id = u.id;
```

**Reset all data:**
```sql
TRUNCATE users, freelancer_profiles, projects, project_groups CASCADE;
```

---

## Testing AI Features

### Enable AI Compatibility
1. Add `OPENAI_API_KEY` to `.env.local`
2. Restart dev server
3. AI functions will be used when `useAI: true` is passed

### Test AI Ranking
```typescript
// In your code
const candidates = await getRankedCandidates(projectId, true);
console.log(candidates[0].aiReasoning);
```

### Debug AI Responses
```typescript
// In ai-compatibility.ts, add:
console.log("AI Response:", content);
```

---

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Supabase connection issues
- Check environment variables are set
- Verify Supabase project is active
- Check Row Level Security policies

### AI not working
- Verify `OPENAI_API_KEY` is set
- Check API key has credits
- Look for errors in console

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- -p 3001
```

### TypeScript errors
```bash
# Check for type errors
npx tsc --noEmit
```

---

## Environment Variables Reference

| Variable                        | Required | Description                    |
| ------------------------------- | -------- | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous key         |
| `OPENAI_API_KEY`                | No       | OpenAI API key for AI features |

---

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Build for Production
```bash
npm run build
npm run start
```

### Environment Variables in Production
Set all environment variables in your hosting platform's dashboard.

---

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

### Commit Message Format
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
```

Examples:
- `feat(quiz): add personality assessment`
- `fix(auth): resolve session timeout issue`
- `docs(readme): update installation steps`
