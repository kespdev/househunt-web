# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
bun run start              # Start Expo dev server with tunnel
bun run start-web          # Web preview with auto-reload
bun run start-web-dev      # Web with debug mode
bun run lint               # Run expo lint
npx tsc --noEmit           # TypeScript type check
npx expo export --platform web  # Production web build (outputs to dist/)
```

Package manager is **bun** (uses `bun.lock`).

## Architecture

**Stack:** React Native + Expo (SDK 54) + Expo Router (file-based routing) + TypeScript

**Collaborative apartment hunting app** where groups of users rate and track apartments together. Currently uses mock data with AsyncStorage persistence (no backend).

### Routing

Expo Router file-based routing with three navigation layers:
- **Tabs:** Home and Profile (`app/(tabs)/_layout.tsx`)
- **Stacks:** Home tab has a stack for apartment detail (`app/(tabs)/(home)/_layout.tsx`)
- **Modals:** `create-group`, `join-group`, `add-apartment` use `presentation: "modal"`
- **Dynamic routes:** `hunt/[huntId]`, `apartment/[apartmentId]`

### State Management

Single React Context (`contexts/AppContext.tsx`) is the source of truth for all data. Uses `@nkzw/create-context-hook` to export `[AppProvider, useApp]`.

All mutations update in-memory state AND persist to AsyncStorage (keys prefixed `roomscout_`). On startup, loads from AsyncStorage or falls back to mock data from `mocks/data.ts`.

Key context methods: `createGroup`, `joinGroup`, `addApartment`, `addOrUpdateRating`, `addNote`, `updateApartmentStatus`, `completeHunt`, `reactivateHunt`. Getter methods like `getGroupApartments` return enriched types (e.g., `ApartmentWithMeta` includes ratings and user's own rating).

### Data Model

```
User → GroupMember → Group → Apartment → Rating (Love/Maybe/Pass)
                                       → Note
```

Status flow: `New → Shortlist → Tour → Rejected | FinalChoice`
Hunt status: `active | completed`

Types defined in `types/index.ts`.

## Design System

- **Colors:** Centralized in `constants/colors.ts`. Primary: `#4F7D6A` (sage green). Status colors, rating colors (love/maybe/pass), and semantic colors all defined there.
- **Fonts:** DM Sans (4 weights) via `@expo-google-fonts/dm-sans`, constants in `constants/fonts.ts`.
- **Icons:** `lucide-react-native` throughout.
- **Styling:** React Native `StyleSheet.create()` in each file. No Tailwind or CSS-in-JS libraries.

## Responsive Design

`hooks/useResponsive.ts` provides screen size utilities. Breakpoints:
- **Small** (<380px): iPhone SE - compact sizing, stacked layouts
- **Medium** (380-767px): Standard phones
- **Large** (≥768px): Tablets/web - content constrained to maxWidth (500-600px) centered

Components also use `useWindowDimensions` directly for simple cases. Tablet support is enabled (`supportsTablet: true`).

## Path Aliases

`@/*` maps to project root (configured in `tsconfig.json`). Use `@/components/...`, `@/contexts/...`, `@/constants/...`, etc.
