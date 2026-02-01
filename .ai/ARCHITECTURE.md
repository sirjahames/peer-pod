# PeerPod - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Landing   │  │    Auth     │  │  Freelancer │  │   Client    │ │
│  │    Page     │  │   Pages     │  │  Dashboard  │  │  Dashboard  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS APP ROUTER                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Server Components                         │    │
│  │  • Layout.tsx (root layout with providers)                   │    │
│  │  • Page.tsx files (server-rendered pages)                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Client Components                         │    │
│  │  • "use client" interactive components                       │    │
│  │  • AuthContext (user state management)                       │    │
│  │  • Navigation, Forms, Real-time UI                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     Server Actions                           │    │
│  │  • actions.ts ("use server" functions)                       │    │
│  │  • Direct database operations                                │    │
│  │  • AI compatibility calls                                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
            │  Supabase   │ │   OpenAI    │ │   Cookies   │
            │  PostgreSQL │ │  GPT-4o-mini│ │   Session   │
            └─────────────┘ └─────────────┘ └─────────────┘
```

## Directory Structure

```
peer-pod-v2/
├── .ai/                    # AI documentation (this folder)
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── layout.tsx      # Root layout with AuthProvider
│   │   ├── page.tsx        # Landing page
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   ├── quiz/           # Compatibility quiz
│   │   ├── dashboard/      # Client dashboard
│   │   │   ├── layout.tsx  # Dashboard layout with nav
│   │   │   ├── page.tsx    # Project list
│   │   │   ├── create/     # Create project
│   │   │   └── projects/   # Project details [id]
│   │   └── freelancer/     # Freelancer dashboard
│   │       ├── layout.tsx  # Freelancer layout with nav
│   │       ├── page.tsx    # Home/overview
│   │       ├── discover/   # Browse projects
│   │       ├── groups/     # Team groups [id]
│   │       └── onboarding/ # Legacy onboarding
│   ├── components/         # Shared components
│   │   ├── auth-guard.tsx  # Auth protection wrapper
│   │   └── navigation.tsx  # Navigation component
│   └── lib/                # Core logic
│       ├── actions.ts      # Server actions (Supabase CRUD)
│       ├── ai-compatibility.ts  # OpenAI integration
│       ├── compatibility.ts     # Algorithmic matching
│       ├── auth-context.tsx     # Auth state management
│       ├── types.ts        # TypeScript interfaces
│       ├── constants.ts    # Quiz questions, etc.
│       ├── task-distribution.ts # Task assignment logic
│       ├── data-supabase.ts     # Supabase data layer
│       └── supabase/       # Supabase utilities
│           ├── client.ts   # Browser client
│           ├── server.ts   # Server client
│           └── database.types.ts
├── supabase/
│   └── schema.sql          # Database schema
├── public/                 # Static assets
├── .env.local              # Environment variables
└── package.json            # Dependencies
```

## Data Flow

### 1. User Authentication Flow
```
Signup Page → signup() action → supabase.auth.signUp() → DB Trigger creates profile
                                        │
                                        ▼
                                Session cookie set → Redirect to dashboard
                                        │
                                        ▼
                                AuthContext.onAuthStateChange → UI updates

Login Page → login() action → supabase.auth.signInWithPassword() → Session cookie
                                        │
                                        ▼
                                Fetch user profile → Redirect to dashboard
```

**Security Notes:**
- Middleware refreshes session on every request
- Protected routes checked in middleware before page load
- RLS policies enforce data access at database level
- Database trigger (SECURITY DEFINER) creates user profiles

### 2. Compatibility Calculation Flow
```
User Profile ─────┐
                  │
                  ▼
         ┌───────────────────┐
         │ useAI flag set?   │
         └───────────────────┘
                  │
         ┌───────┴───────┐
         │               │
         ▼               ▼
    [AI Enabled]    [AI Disabled]
         │               │
         ▼               ▼
   OpenAI API      Algorithmic
   (GPT-4o-mini)   (Big Five scoring)
         │               │
         └───────┬───────┘
                 ▼
         Compatibility Score + Reasoning
```

### 3. Team Formation Flow
```
Client creates project
         │
         ▼
Freelancers apply (with compatibility scores)
         │
         ▼
Client views ranked candidates
         │
         ├──→ AI suggests optimal teams
         │
         ▼
Client forms team (creates group)
         │
         ▼
Tasks auto-assigned based on skills/personality
         │
         ▼
Team collaboration (chat, tasks)
```

## Component Relationships

```
AuthProvider (root)
    │
    ├── Navigation
    │       └── Links, User menu
    │
    ├── AuthGuard
    │       └── Protected routes
    │
    └── Page Components
            │
            ├── Client Components ("use client")
            │       └── Forms, Interactive UI
            │
            └── Server Actions ("use server")
                    └── Database operations
```

## Session Management

- **Supabase Auth** with `@supabase/ssr` for cookie-based sessions
- **Middleware** refreshes session on every request (`src/middleware.ts`)
- **Auth callback** handles OAuth/email confirmation (`src/app/auth/callback/route.ts`)
- **AuthContext** uses `onAuthStateChange` for real-time auth state
- **Protected routes**: `/dashboard`, `/freelancer`, `/quiz`
- **RLS policies** enforce data access at database level

## Caching Strategy

- **Server Components** - Cached by Next.js
- **Static pages** - Pre-rendered at build time
- **Dynamic pages** - Server-rendered on request
- **Database queries** - No caching (real-time data)
