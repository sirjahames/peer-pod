# PeerPod - Known Issues & Limitations

## Current Issues

### 1. NaN Compatibility Score Display
**Status:** 🔴 Open  
**Severity:** Medium  
**Location:** Freelancer dashboard, project cards

**Description:**
The compatibility score for freelancers sometimes displays as "NaN%" on project cards.

**Possible Causes:**
- Incomplete profile data (missing quiz responses)
- Division by zero in compatibility algorithm
- Skill matching returns undefined when no skills match
- Profile JSONB fields not properly parsed

**Investigation Points:**
- `src/lib/compatibility.ts` - `computeProjectCompatibility()` function
- `src/lib/actions.ts` - `getProjectsWithCompatibility()` function
- Check if `profile.skills`, `profile.personality`, `profile.workStyle` exist before calculations

**Workaround:**
Add null checks and default values in compatibility calculations.

---

### 2. Inconsistent Page Padding
**Status:** 🔴 Open  
**Severity:** Low  
**Location:** Various pages

**Description:**
Pages have inconsistent padding and margins, leading to visual inconsistency across the application.

**Affected Pages:**
- Landing page
- Login page
- Quiz pages
- Dashboard pages

**Fix:**
Standardize container classes across all pages:
```tsx
<main className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
  <div className="max-w-7xl mx-auto">
    {/* Content */}
  </div>
</main>
```

---

### 3. No Session Persistence Across Browser Close
**Status:** 🟡 Known Limitation  
**Severity:** Low  

**Description:**
User sessions are stored in cookies that expire. If browser is closed and reopened, user may need to log in again.

**Current Behavior:**
- Cookie expires in 7 days
- No "Remember Me" option

---

### 4. No Email Verification
**Status:** 🟡 Known Limitation  
**Severity:** Medium  

**Description:**
Users can log in with any name without email verification. This is intentional for hackathon simplicity but should be addressed for production.

**For Production:**
- Implement Supabase Auth
- Add email verification flow
- Add password authentication

---

### 5. No Real-Time Updates
**Status:** 🟡 Known Limitation  
**Severity:** Low  

**Description:**
Dashboard data doesn't update in real-time. Users need to refresh to see new projects or invitations.

**Future Enhancement:**
- Implement Supabase Realtime subscriptions
- Add WebSocket connections for live updates

---

### 6. AI Rate Limiting Not Implemented
**Status:** 🟡 Known Limitation  
**Severity:** Medium  

**Description:**
No rate limiting on AI compatibility calls. Could lead to excessive API costs or rate limit errors from OpenAI.

**Recommendations:**
- Add caching for AI results
- Implement request throttling
- Add user-level rate limits

---

### 7. No Mobile Optimization
**Status:** 🟡 Known Limitation  
**Severity:** Medium  

**Description:**
While Tailwind provides some responsive classes, the app is not fully optimized for mobile devices.

**Areas to Improve:**
- Navigation menu (needs hamburger menu)
- Quiz forms (need touch-friendly inputs)
- Dashboard cards (need mobile layout)

---

### 8. Timezone Handling
**Status:** 🟡 Known Limitation  
**Severity:** Low  

**Description:**
Timezone comparisons in compatibility scoring are simplified. Complex timezone overlap calculations are not implemented.

**Current Behavior:**
- Direct timezone string comparison
- No actual overlap calculation

---

## Technical Debt

### 1. Type Safety in Compatibility
Some type assertions (`as any`) are used in compatibility calculations. Should be properly typed.

### 2. Error Handling
Some server actions catch errors silently. Should implement proper error boundaries and user feedback.

### 3. Loading States
Not all async operations show loading indicators. User feedback could be improved.

### 4. Form Validation
Client-side validation is minimal. Should add Zod or similar validation library.

### 5. Test Coverage
No automated tests exist. Should add:
- Unit tests for compatibility algorithms
- Integration tests for server actions
- E2E tests for critical flows

---

## Performance Considerations

### 1. N+1 Queries
Some data fetching could be optimized with joins instead of multiple queries.

### 2. AI Call Batching
Currently makes individual AI calls. Could batch multiple compatibility checks.

### 3. Image Optimization
No images currently, but should use Next.js Image component when added.

---

## Security Considerations

### 1. Cookie Security
Current cookie configuration is basic. For production:
- Add `secure` flag
- Add `sameSite` attribute
- Consider HTTP-only cookies

### 2. Input Sanitization
User inputs should be sanitized before storing in database.

### 3. Rate Limiting
No rate limiting on API endpoints. Should implement for production.

### 4. Row Level Security
Supabase RLS is not fully configured. Users could potentially access other users' data.

---

## Future Enhancements (Not Bugs)

1. **OAuth Authentication** - Google, GitHub login
2. **Profile Pictures** - Upload and display avatars
3. **Messaging System** - In-app communication
4. **Project Timeline** - Milestones and deadlines
5. **Payment Integration** - Stripe for payments
6. **Reviews & Ratings** - Post-project feedback
7. **Skill Verification** - Tests or portfolio verification
8. **Notification System** - Email and in-app notifications
9. **Advanced Filtering** - Filter projects by multiple criteria
10. **Team Chat** - Real-time team communication

---

## Reporting New Issues

When reporting issues, include:
1. Page/component where issue occurs
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Browser and device info
6. Console errors (if any)
