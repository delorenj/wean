# WEAN-2 Mobile Recovery (2026-03-12)

- Lane: mobile
- Status: reassigned under codex-only fallback due repeated lane timeout
- Next actions:
  1) finalize adapter boundary in `src/lib/firebase/adapter.ts`
  2) migrate auth hook callsites in `hooks/useFireauth.ts`
  3) run smoke pass and report SHA
- Blockers: lane RPC timeout in this cycle
