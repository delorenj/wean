# WEAN-2 Firebase Modernization Plan

- Audit Firebase import surfaces in context/firebaseConfig.js, hooks/useFireauth.ts, and providers under context/.
- Separate auth adapter from Firestore adapter to reduce coupling in hooks.
- Define typed boundary for auth user object consumed by context/dosesProvider.js and pages/daily.js.
- Evaluate firestore-lite migration path for read-heavy screens.
- Keep anonymous auth flow intact while adding explicit token refresh error handling.
- Add emulator/dev/prod environment matrix validation for firebase config keys.
- Document migration order to avoid runtime breakage during staged rollout.
- Add post-migration smoke checklist for auth + dose write/read + settings sync.

ARTIFACT_READY
