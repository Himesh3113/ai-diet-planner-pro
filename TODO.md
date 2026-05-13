# TODO - Onboarding redirect fix

- [ ] Identify why router push("/dashboard") doesn’t result in navigation after onboarding completion.
- [x] Fix onboarding_completed handling if it’s written but not immediately reflected in server-side middleware/layout.
- [x] Ensure client-side redirect to `/dashboard` happens after DB updates and session/profile context refresh.

- [x] Verify middleware allows `/dashboard` and doesn’t redirect back to `/onboarding` due to stale profile.
- [x] Implement minimal code changes preserving existing UI and Supabase logic.
- [x] Show changed files before editing.
- [x] Apply fixes automatically and run basic checks (TypeScript build / lint if available).


