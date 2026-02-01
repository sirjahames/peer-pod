# PeerPod - Technology Stack

## Overview

PeerPod is built as a modern full-stack web application using the latest technologies for performance, developer experience, and scalability.

## Frontend

### Next.js 16
- **App Router** - File-based routing with layouts and nested routes
- **Server Components** - Default server-side rendering
- **Client Components** - Interactive components with "use client" directive
- **Server Actions** - Direct database calls from components
- **Turbopack** - Fast bundler for development and production

### React 18
- Hooks-based architecture
- Context API for state management (AuthContext)
- Concurrent features support

### TypeScript 5
- Strict type checking enabled
- Comprehensive type definitions in `types.ts`
- Interface-first development

### Tailwind CSS 3.4
- Utility-first CSS framework
- Custom color palette (primary, accent, dark, light)
- Custom animations (fadeIn, slideInLeft, slideInRight, pulse)
- Responsive design utilities

## Backend

### Supabase
- **PostgreSQL Database** - Relational data storage
- **Row Level Security (RLS)** - Fine-grained access control at database level
- **Real-time subscriptions** - Live data updates (ready for implementation)
- **Supabase Auth** - Secure authentication with `@supabase/ssr`
  - Password hashing (bcrypt)
  - Secure HttpOnly session cookies
  - OAuth support ready
  - Email confirmation (disabled for dev, enable for production)

### Database Triggers
- `handle_new_user()` - Creates user profile when auth user signs up
- Runs with `SECURITY DEFINER` to bypass RLS during signup

### Server Actions
- Next.js 16 "use server" directive
- Direct database calls without API routes
- Supabase SSR for session management
- Automatic request/response serialization

## AI Integration

### OpenAI
- **GPT-4o-mini** model for cost-effective AI analysis
- JSON response format for structured outputs
- Graceful fallback to algorithmic matching
- Temperature 0.3-0.4 for consistent results

## Database

### PostgreSQL (via Supabase)
- UUID primary keys
- JSONB for flexible quiz data storage
- Array types for skills and team members
- Proper foreign key relationships
- Indexed queries for performance

## Development Tools

### Package Manager
- npm (Node Package Manager)

### Linting & Formatting
- ESLint with Next.js configuration
- TypeScript strict mode

### Build Tools
- PostCSS for CSS processing
- Autoprefixer for browser compatibility

## Dependencies

### Production Dependencies
```json
{
  "@supabase/ssr": "^0.8.0",        // Supabase SSR helpers
  "@supabase/supabase-js": "^2.93.3", // Supabase client
  "next": "^16.1.6",                 // Next.js framework
  "openai": "^6.17.0",               // OpenAI SDK
  "react": "^18.2.0",                // React library
  "react-dom": "^18.2.0"             // React DOM
}
```

### Development Dependencies
```json
{
  "@types/node": "^20",              // Node.js types
  "@types/react": "^18",             // React types
  "@types/react-dom": "^18",         // React DOM types
  "autoprefixer": "^10.4.20",        // CSS vendor prefixes
  "eslint": "^8",                    // Code linting
  "eslint-config-next": "14.2.21",   // Next.js ESLint config
  "postcss": "^8.4.49",              // CSS processing
  "tailwindcss": "^3.4.17",          // Utility CSS
  "typescript": "^5"                  // TypeScript compiler
}
```

## Environment Variables

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (Optional - enables AI matching)
OPENAI_API_KEY=sk-your-api-key
```

## Deployment Requirements

- Node.js 18+ runtime
- PostgreSQL database (Supabase)
- Environment variables configured
- Build command: `npm run build`
- Start command: `npm start`

## Recommended Hosting

- **Vercel** - Optimal for Next.js
- **Supabase** - Managed PostgreSQL
- **OpenAI API** - AI capabilities
