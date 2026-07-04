# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build      # Generate sitemap + tsc + vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

Environment: copy `.env.example` → `.env` and fill in Firebase credentials.

**Never run `npm run dev`** — use the existing running instance or Firebase Hosting preview instead.

## Architecture

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS, fully deployed to Firebase Hosting (SPA, all routes rewrite to index.html).

**Backend:** Firebase (Firestore + Auth + Storage). No custom server — all data access goes through service functions in `src/services/`.

### Auth & Authorization
- `src/context/AuthContext.tsx` — wraps the app; provides `user`, `isAdmin`, `isSuperAdmin`, `signInWithGoogle`, `signOut`. Only Google sign-in is supported — there is no email/password flow because admin accounts are created in Firestore (`admins` collection) and there is no provisioning step that creates a matching Firebase Auth password.
- Admin status is checked at login: user email must exist in the Firestore `admins` collection (document ID = email, lowercased)
- Two roles: regular admin (default) and super-admin (`isSuper: true` on the admin doc). Only super-admins can add/remove other admins or change their `publicName`.
- Protected routes use `src/components/admin/AdminRoute.tsx`. Super-only pages additionally check `isSuperAdmin` and redirect otherwise.
- Firestore/Storage rules enforce server-side: all reads are public; writes to content collections require any admin; writes to `admins` require super-admin (`isSuperAdmin()` rule function).

### Data Model (Firestore collections)
- `artifact_groups` — top-level showcase items (thumbnail, grade, quarter, tags, list of artifact refs). Tracks creator via `createdBy` (email) and `createdByName` (denormalized snapshot of the admin's `publicName` at creation time — does not auto-update if the admin later renames themselves).
- `artifacts` — individual embed variants belonging to a group
- `sections` — grade/quarter definitions
- `tags` — category tags
- `admins` — document ID is the admin's email (lowercase). Fields: `isSuper?`, `publicName?` (shown publicly as author name), `addedBy?`, `addedAt?`.

### Service Layer
`src/services/` contains one file per collection: `artifactGroupService.ts`, `artifactService.ts`, `sectionService.ts`, `tagService.ts`, `adminService.ts`, `storageService.ts`.

All Firebase calls go through these services — components never import `db`/`storage` directly.

### Data Fetching
Custom hooks in `src/hooks/` (`useArtifactGroups`, `useArtifacts`, `useSections`, `useTags`, `useAdmins`) wrap service calls and manage loading/error state. These are the sole data-access layer for components.

### Routing (React Router v7)
- `/` — `ShowcasePage` (public). Supports filters via query params: `grade`, `quarter`, `section`, `tags`, `other`, `author`.
- `/artifacts/:id` — `ArtifactDetailPage` (public). Shows author + date below title; author link navigates to `/?author=<email>`.
- `/login` — `LoginPage`
- `/admin/*` — protected admin routes (list, create, edit artifacts; manage sections and tags)
  - `/admin/admins` — super-admin only; manage admins and their public names

### Key Constants
`src/config/constants.ts` — grades (7–11), quarters (1–4), thumbnail size (640×360), pagination sizes (24 initial / 12 load-more for public; 20 for admin), new-artifact threshold (7 days).

### Author Display Conventions
- Author name on the showcase comes from `ArtifactGroup.createdByName` (snapshot), not a live lookup — the `admins` collection is not publicly readable.
- Fallback chain at artifact creation: `admins[email].publicName` → Firebase Auth `displayName` → email local-part.
- Renaming an admin via `/admin/admins` updates only future artifacts. Old artifacts keep the old snapshot. A bulk backfill would need to be added to `adminService.updatePublicName` if live propagation becomes important.
- `createdBy` / `createdByName` are set only on create; the edit flow does not touch them.
