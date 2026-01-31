# PeerPod - Components & Pages

## Page Structure

### Public Pages

| Route     | File                  | Description                           |
| --------- | --------------------- | ------------------------------------- |
| `/`       | `app/page.tsx`        | Landing page with hero, features, CTA |
| `/login`  | `app/login/page.tsx`  | User login form                       |
| `/signup` | `app/signup/page.tsx` | User registration form                |
| `/quiz`   | `app/quiz/page.tsx`   | Compatibility assessment quiz         |

### Freelancer Pages

| Route                     | File                                  | Description                        |
| ------------------------- | ------------------------------------- | ---------------------------------- |
| `/freelancer`             | `app/freelancer/page.tsx`             | Freelancer home/dashboard          |
| `/freelancer/discover`    | `app/freelancer/discover/page.tsx`    | Browse projects with compatibility |
| `/freelancer/groups`      | `app/freelancer/groups/page.tsx`      | List of joined teams               |
| `/freelancer/groups/[id]` | `app/freelancer/groups/[id]/page.tsx` | Team details, chat, tasks          |
| `/freelancer/onboarding`  | `app/freelancer/onboarding/page.tsx`  | Legacy onboarding flow             |

### Client Pages

| Route                      | File                                   | Description                    |
| -------------------------- | -------------------------------------- | ------------------------------ |
| `/dashboard`               | `app/dashboard/page.tsx`               | Client project list            |
| `/dashboard/create`        | `app/dashboard/create/page.tsx`        | Create new project             |
| `/dashboard/projects/[id]` | `app/dashboard/projects/[id]/page.tsx` | Project management, applicants |

---

## Layouts

### Root Layout (`app/layout.tsx`)
- Wraps entire app with `AuthProvider`
- Sets global fonts and metadata
- Includes global CSS

### Dashboard Layout (`app/dashboard/layout.tsx`)
- Navigation for client pages
- AuthGuard protection
- Consistent padding and structure

### Freelancer Layout (`app/freelancer/layout.tsx`)
- Navigation for freelancer pages
- AuthGuard protection
- Consistent padding and structure

---

## Shared Components

### Navigation (`components/navigation.tsx`)
Responsive navigation bar with:
- Logo/brand link
- Role-based navigation links
- User dropdown with logout
- Mobile hamburger menu

**Props:** None (uses AuthContext)

### AuthGuard (`components/auth-guard.tsx`)
Protects routes requiring authentication.

**Props:**
- `children: ReactNode` - Content to render if authenticated
- `requiredRole?: 'client' | 'freelancer'` - Optional role requirement

**Behavior:**
- Redirects to `/login` if not authenticated
- Redirects to appropriate dashboard if wrong role
- Shows loading state while checking auth

---

## Page Components Detail

### Landing Page (`/`)
```
┌─────────────────────────────────────────┐
│  Hero Section                           │
│  - Animated background blobs            │
│  - "PeerPod" title with gradient        │
│  - Tagline and description              │
│  - CTA buttons (Get Started, Login)     │
├─────────────────────────────────────────┤
│  Features Section                       │
│  - AI-Powered Matching card             │
│  - Personality Compatibility card       │
│  - Smart Team Formation card            │
├─────────────────────────────────────────┤
│  How It Works Section                   │
│  - Step 1: Take Quiz                    │
│  - Step 2: Browse Projects              │
│  - Step 3: Join Team                    │
├─────────────────────────────────────────┤
│  Footer with links                      │
└─────────────────────────────────────────┘
```

### Quiz Page (`/quiz`)
Multi-section assessment:

**Section 1: Personality (9 questions)**
- Slider-based answers (1-5 scale)
- Questions map to Big Five traits
- Progress indicator

**Section 2: Work Style (5 questions)**
- Multiple choice format
- Grade expectations
- Deadline preferences
- Team role preference

**Section 3: Scheduling**
- Availability grid (days × time blocks)
- Response time preferences
- Meeting format preferences
- Schedule flexibility

### Discover Page (`/freelancer/discover`)
```
┌─────────────────────────────────────────┐
│  Header: "Discover Projects"            │
│  Subtitle: explanation                  │
├─────────────────────────────────────────┤
│  Project Card Grid                      │
│  ┌─────────────────┐ ┌─────────────────┐│
│  │ Project Title   │ │ Project Title   ││
│  │ 85% Match ████░ │ │ 72% Match ███░░ ││
│  │ Skills: React.. │ │ Skills: Python..││
│  │ Due: 2026-03-15 │ │ Due: 2026-02-28 ││
│  │ [View] [Apply]  │ │ [View] [Apply]  ││
│  └─────────────────┘ └─────────────────┘│
│  ...                                    │
└─────────────────────────────────────────┘
```

### Project Details (`/dashboard/projects/[id]`)
```
┌─────────────────────────────────────────┐
│  Project Header                         │
│  Title, Status Badge, Edit Button       │
├─────────────────────────────────────────┤
│  Project Details                        │
│  Description, Skills, Timeline, Budget  │
├─────────────────────────────────────────┤
│  Team Section (if formed)               │
│  Member list with roles                 │
├─────────────────────────────────────────┤
│  Applicants Section                     │
│  Ranked by compatibility                │
│  ┌─────────────────────────────────────┐│
│  │ Alice (92%) ████████░░              ││
│  │ Skills: React, TS  [Add to Team]    ││
│  └─────────────────────────────────────┘│
│  ...                                    │
├─────────────────────────────────────────┤
│  AI Team Suggestions                    │
│  [Alice + Bob + Carol] 88% - Form Team  │
│  [Alice + Dan + Eve] 85% - Form Team    │
└─────────────────────────────────────────┘
```

### Group Page (`/freelancer/groups/[id]`)
```
┌─────────────────────────────────────────┐
│  Group Header                           │
│  Project Name, Team Members             │
├─────────────────────────────────────────┤
│  Tasks Panel                            │
│  ☑ Completed task                       │
│  ☐ Pending task - Assigned to: Bob      │
│  [Add Task Button]                      │
├─────────────────────────────────────────┤
│  Chat Panel                             │
│  Message history                        │
│  [Input field] [Send]                   │
└─────────────────────────────────────────┘
```

---

## Styling Patterns

### Color Palette (Tailwind Config)
```css
primary: {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
}
accent: {
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
}
```

### Common Utilities
- `page-hero` - Hero section gradient background
- `animate-fadeIn` - Fade in animation
- `animate-slideInLeft` - Slide from left
- `animate-slideInRight` - Slide from right
- `pulse-dot` - Pulsing indicator dot
- `bg-gradient-brand` - Brand gradient background

### Card Pattern
```jsx
<div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
  {/* Card content */}
</div>
```

### Button Patterns
```jsx
// Primary button
<button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">

// Secondary button
<button className="px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition">

// Ghost button
<button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
```

---

## State Management

### AuthContext
Global authentication state:

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}
```

**Usage:**
```jsx
const { user, loading, login, logout } = useAuth();
```

### Local Component State
Pages use React `useState` for:
- Loading states
- Form data
- API response data
- UI toggles

### Data Fetching Pattern
```jsx
useEffect(() => {
  async function loadData() {
    if (!user) return;
    setLoading(true);
    const data = await serverAction(user.id);
    setData(data);
    setLoading(false);
  }
  loadData();
}, [user]);
```
