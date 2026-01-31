You are a senior software engineer. Build a clean, production-ready web app using Next.js (App Router) and React.

The app is called PeerPod.

PeerPod is a platform where clients form small freelance teams for projects based on compatibility (skills, personality, availability).

STRICT RULES:
- No garbage code.
- No placeholder components or fake logic.
- No overengineering.
- No unnecessary abstractions.
- No unused files, variables, or imports.
- No commented-out code.
- Keep everything readable and efficient.
- Business logic must be isolated from UI.
- Prefer server components when possible.
- Minimal client-side state.
- If something is not required, do not include it.
- Do not explain concepts — implement them.

TECH STACK:
- Next.js (latest stable, App Router)
- React
- TypeScript
- Minimal CSS or Tailwind
- In-memory/mock data only (clearly isolated for future replacement)
- No real payments, emails, or external AI APIs

ROLES:
- Client
- Freelancer

AUTH:
- Login page
- Signup page
- Role selection
- Simulated auth state

FREELANCER FEATURES:

1. Onboarding
- Personality assessment (20 questions, numeric answers)
- Skills selection with proficiency levels
- Availability (hours per week, timezone)

2. Freelancer Home
- View joined projects
- View applied projects

3. Job / Group Discovery
- Browse all open projects
- Show a personalized compatibility score per project
- Allow filtering by skills and availability
- Allow applying to a project

CLIENT FEATURES:

1. Client Dashboard
- View created projects
- Create new project

2. Project Creation
- Title, description
- Required skills
- Team size
- Due date
- Generate join code or open listing

MATCHING & COMPATIBILITY LOGIC:

- Compatibility is numeric and deterministic
- Personality scoring:
  - Strong similarity: +2
  - Partial similarity: +1
  - Neutral: 0
  - Strong conflict: -2
- Skill scoring:
  - Match required skills with proficiency
  - Penalize missing skills
  - Diminishing returns for redundancy
- Availability overlap increases score
- Total compatibility = weighted sum
- Keep this logic isolated in a single module

TEAM FORMATION:

- Freelancers enter a candidate pool per project
- System computes compatibility between:
  - Freelancer ↔ project
  - Freelancer ↔ existing group members
- Client sees ranked candidates and suggested team combinations
- Client manually finalizes the team

GROUP SPACE:

- Show project info and due date
- Show group members with skills summary
- Show group status:
  - ACTIVE until due date
  - OPEN for 7 days after due date
  - CLOSED (read-only) after that
- Disable chat and task edits when closed

AI TASK DISTRIBUTION (SIMULATED):

- Generate a task list for the project
- Assign tasks to freelancers based on:
  - Skill strengths
  - Personality tendencies
  - Availability
- Tasks are suggestions only
- No role-based assignments

CHAT:
- Simple group chat
- Local state only
- Disabled when group is closed

ROUTING & STRUCTURE:
- Clean, predictable routing
- Shared layout with role-aware navigation
- Small, focused components
- Minimal styling

OUTPUT:
- Full folder structure
- All required files
- App runs immediately after install
