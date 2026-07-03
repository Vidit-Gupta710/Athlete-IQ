Build the frontend for a hackathon project called AthleteIQ — an AI sports copilot that gives athletes persistent, memory-based coaching, injury guidance, and recovery tracking. This is a React frontend only; treat the backend as a REST API I will provide separately (mock it for now).

## Tech Stack
- React + Vite
- Tailwind CSS for styling (no component library like MUI/Ant Design)
- react-router-dom for routing
- React Context API for global state (no Redux/Zustand)
- Plain `fetch` wrapped in a small API client (no axios)
- Keep charts/timeline custom with styled divs — no charting library unless necessary

## Folder Structure
Set up exactly this structure:

```
src/
  main.jsx
  App.jsx
  index.css
  api/
    client.js
    athlete.js
    chat.js
    memory.js
  context/
    AthleteContext.jsx
  components/
    layout/
      Navbar.jsx
      PageContainer.jsx
    onboarding/
      ProfileForm.jsx
      InjuryForm.jsx
      StepIndicator.jsx
    chat/
      ChatWindow.jsx
      MessageBubble.jsx
      ChatInput.jsx
      FileUpload.jsx
    dashboard/
      InjuryCard.jsx
      AlertCard.jsx
      StatCard.jsx
    timeline/
      TimelineItem.jsx
      TimelineView.jsx
    graph/
      KnowledgeGraphViewer.jsx
  pages/
    OnboardingPage.jsx
    ChatPage.jsx
    DashboardPage.jsx
    TimelinePage.jsx
    GraphPage.jsx
  hooks/
    useAthlete.js
  utils/
    formatDate.js
    constants.js
```

Route rule: `pages/` = one file per screen/route. `components/` = reusable pieces. Never call `fetch` directly inside a component — always go through `api/`.

## Screens

**1. Onboarding (`/`)**
Two-step form: Step 1 = basic profile (name, age, sport, playing level, goals, training frequency). Step 2 = injury info (current/previous injuries, pain level, pain location, surgery history). Use `StepIndicator` for progress. On final submit, call `POST /athlete/profile`, store the returned `athlete_id` in `AthleteContext` and localStorage, then navigate to `/chat`.

**2. Chat (`/chat`)**
Full-height flex layout: scrollable message list on top (`ChatWindow` + `MessageBubble`, styled differently for user vs AI), `ChatInput` pinned to bottom, `FileUpload` for report uploads (MRI/X-ray/etc). Maintain a `messages` state array. Use optimistic UI — show the user's message immediately, then append the AI response once `POST /chat` resolves. Show a typing/loading indicator while waiting.

**3. Dashboard (`/dashboard`)**
Grid layout: top row of `StatCard` tiles (e.g. training load, recovery %, active injuries), below that a two-column section with `InjuryCard` list and `AlertCard` list (proactive smart recommendations). Fetch data on mount via `GET /athlete/{id}/dashboard`. Must handle loading and error states explicitly, and an empty state for a brand-new athlete with no data yet.

**4. Recovery Timeline (`/timeline`)**
Vertical timeline UI: a line with dated `TimelineItem` nodes branching off (event name, date, short description, icon). Fetch via `GET /athlete/{id}/timeline`, sort by date ascending.

**5. Knowledge Graph (`/graph`)**
Full-width/height container. Fetch graph data via `GET /athlete/{id}/graph` and pass it as a prop into `KnowledgeGraphViewer` — leave that component as a clearly marked placeholder/stub for now since a teammate is building it separately; just wire up the data fetching and prop passing correctly.

## Requirements
- Set up `AthleteContext` to hold: `athleteId`, `profile`, `loading`, `error`. Provide a `useAthlete` hook wrapping it.
- Set up `api/client.js` as a base fetch wrapper with a configurable `API_BASE_URL` (from `utils/constants.js`), consistent error handling, and JSON parsing.
- Mock all API responses realistically for now (clearly marked as mocks, easy to swap for real endpoints later) so the app is fully clickable end-to-end without a live backend.
- Every screen that fetches data needs explicit loading, error, and empty states — don't assume data is always present.
- Use Tailwind utility classes only, no separate CSS files beyond `index.css` imports.
- Navbar should link to all 5 routes and only be visible after onboarding is complete.

## Build Order
1. Vite + Tailwind + Router skeleton with all 5 routes rendering placeholder content, Navbar wired up.
2. `AthleteContext` + `api/client.js` with mocked responses.
3. Onboarding screen (entry point, produces `athlete_id`).
4. Chat screen.
5. Dashboard screen.
6. Recovery Timeline screen.
7. Knowledge Graph screen (stub component + data fetching only).

Build in this order, and after each screen, briefly summarize what you built and what's still mocked vs. real before moving to the next.
