# PeerPod - AI Project Documentation

This folder contains comprehensive documentation for AI assistants and developers working on the PeerPod project.

## Contents

- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - High-level project description and goals
- [TECH_STACK.md](./TECH_STACK.md) - Complete technology stack details
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and data flow
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure and relationships
- [API_REFERENCE.md](./API_REFERENCE.md) - Server actions and API documentation
- [COMPONENTS.md](./COMPONENTS.md) - UI components and page structure
- [AI_INTEGRATION.md](./AI_INTEGRATION.md) - OpenAI integration details
- [PROMPTS.md](./PROMPTS.md) - AI prompts used in the system
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development setup and workflows
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) - Known bugs and improvement areas

## Quick Start for AI Assistants

When working on this project:

1. **Backend logic** is in `src/lib/actions.ts` (server actions with Supabase)
2. **AI compatibility** is in `src/lib/ai-compatibility.ts` (OpenAI integration)
3. **Algorithmic compatibility** is in `src/lib/compatibility.ts` (fallback)
4. **Types** are defined in `src/lib/types.ts`
5. **Database schema** is in `supabase/schema.sql`
6. **Pages** use Next.js App Router in `src/app/`

## Project Purpose

PeerPod is a freelance team formation platform that uses **AI-powered compatibility matching** to help clients build harmonious teams based on personality, skills, work style, and availability.
