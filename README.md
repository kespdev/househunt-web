# HouseHunt

A collaborative apartment hunting app for groups of roommates or friends. Create a hunt, invite your group, add listings, rate them together, and track your search from first look to final choice.

**Platforms:** iOS, Android, Web
**Framework:** React Native + Expo + TypeScript

## Features

- **Group Hunts** - Create or join apartment hunts via invite codes
- **Add Listings** - Paste a URL to auto-extract listing details (address, price, photos) or enter manually
- **Rate Together** - Love, Maybe, or Pass on each apartment with group-wide rating summaries
- **Track Status** - Move apartments through stages: New, Shortlist, Tour, Rejected, or Final Choice
- **Notes** - Leave notes on any listing for your group to see
- **Complete Hunts** - Mark a hunt as done when you find your place (or stop searching)
- **Responsive** - Adapts to small phones, standard phones, tablets, and web browsers

## Getting Started

### Prerequisites

- [Node.js](https://github.com/nvm-sh/nvm) (v18+)
- [Bun](https://bun.sh/docs/installation)

### Installation

```bash
git clone https://github.com/kespdev/househunt-web.git
cd househunt-web
bun install
```

### Development

```bash
# Web (recommended for quick testing)
bun run start-web

# iOS/Android (requires Expo Go app on your device)
bun run start
# Then scan the QR code, or press "i" for iOS Simulator / "a" for Android Emulator
```

### Other Commands

```bash
bun run lint               # Run linter
npx tsc --noEmit           # TypeScript type check
npx expo export --platform web  # Production web build (outputs to dist/)
```

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React Native 0.81 + Expo SDK 54 |
| Routing | Expo Router (file-based) |
| Language | TypeScript 5.9 |
| State | React Context + AsyncStorage |
| Server State | React Query (TanStack) |
| Icons | Lucide React Native |
| Fonts | DM Sans (Google Fonts) |
| Styling | React Native StyleSheet |

## Project Structure

```
app/                        # Screens (Expo Router file-based routing)
├── (tabs)/                 # Tab navigation
│   ├── (home)/             # Home tab stack
│   │   ├── index.tsx       # Hunts list
│   │   └── apartment/
│   │       └── [apartmentId].tsx  # Apartment detail
│   └── profile.tsx         # Profile tab
├── hunt/[huntId].tsx       # Hunt detail with apartment list
├── create-group.tsx        # Create hunt (modal)
├── join-group.tsx          # Join hunt (modal)
└── add-apartment.tsx       # Add apartment (modal)

components/                 # Reusable UI components
contexts/AppContext.tsx      # Global state (single context for all data)
constants/                  # Design tokens (colors, fonts)
hooks/                      # Custom hooks (useResponsive)
types/index.ts              # TypeScript type definitions
mocks/data.ts               # Mock data (seed data for development)
```

## Data Model

- **Group (Hunt)** - A named apartment search with invite code, move date, and status
- **Apartment** - A listing with address, price, beds/baths, photos, status, and source URL
- **Rating** - A user's vote on an apartment (Love / Maybe / Pass)
- **Note** - A text comment on an apartment from a group member
- **User** - Name, email, avatar (currently mock users)

All data is persisted locally via AsyncStorage. No backend server is required.

## Deployment

### Web

```bash
npx expo export --platform web
# Deploy the dist/ folder to Vercel, Netlify, or any static host
```

### iOS / Android

```bash
bun install -g @expo/eas-cli
eas build:configure
eas build --platform ios      # or android
eas submit --platform ios     # or android
```

See [Expo deployment docs](https://docs.expo.dev/submit/introduction/) for full details.

## License

Private project.
