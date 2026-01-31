# 🚀 PeerPod

**AI-Powered Freelance Team Formation Platform**

Form perfectly matched freelance teams based on skills, personality, work style, and compatibility using AI-powered matching.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-purple)

## 🎯 Features

- **AI Compatibility Matching** - GPT-4o-mini powered team compatibility analysis
- **Comprehensive Quiz** - Big Five personality, work style, and scheduling assessment
- **Smart Project Discovery** - Freelancers find projects matching their profile
- **Team Formation** - Clients build optimal teams from ranked candidates
- **Real-time Collaboration** - Task management and team chat

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions, Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini for compatibility analysis

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd peer-pod-v2
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-key  # Optional
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ☁️ Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/peer-pod-v2)

### Manual Deployment

1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables in Settings > Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` (optional)
4. Deploy!

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── dashboard/       # Client dashboard
│   ├── freelancer/      # Freelancer dashboard
│   ├── quiz/            # Compatibility quiz
│   └── login/           # Authentication
├── components/          # Shared components
└── lib/                 # Business logic
    ├── actions.ts       # Server actions
    ├── compatibility.ts # Matching algorithms
    ├── ai-compatibility.ts # AI-powered matching
    └── supabase/        # Database client
```

## 📚 Documentation

See the [.ai/](.ai/) folder for comprehensive documentation:
- [Project Overview](.ai/PROJECT_OVERVIEW.md)
- [Tech Stack](.ai/TECH_STACK.md)
- [Architecture](.ai/ARCHITECTURE.md)
- [API Reference](.ai/API_REFERENCE.md)
- [AI Integration](.ai/AI_INTEGRATION.md)

## 🏆 AI For Good Hackathon

Built for the [Caribbean.dev 2026 Hackathon: AI for Good](https://caribbean.dev/2026-hackathon-ai-for-good/)

Teams work collaboratively to design and build technology-driven solutions that address real-world challenges affecting students and communities.

## 📄 License

MIT
