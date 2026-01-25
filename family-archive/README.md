# Family Memory Archive

A premium digital sanctuary for preserving family history. Built with Vue 3, TypeScript, Tailwind CSS, and Pinia.

## Features

- 🎨 **Glassmorphism Design** — Premium dark theme with soft blur effects
- ⚡ **Real-time Editor** — See changes instantly as you type
- 📱 **Responsive** — Works on all devices
- 🔗 **Shareable Links** — Each family gets a unique URL
- 💾 **Local Storage** — Data persists in browser

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/editor` | Create & edit archives |
| `/smith-family` | Demo viewer page |
| `/:id` | View any family archive |

## Project Structure

```
src/
├── components/
│   ├── ui/          # BaseButton, BaseCard, BaseInput
│   ├── viewer/      # HeroSection, BentoGrid, Timeline
│   └── editor/      # EditorSidebar, EditorPreview
├── layouts/         # MainLayout
├── pages/           # LandingPage, MemoryViewer, EditorDashboard
├── services/        # memoryService (mock API)
├── stores/          # memoryStore (Pinia)
├── types/           # TypeScript interfaces
└── utils/           # Helper functions
```

## Tech Stack

- Vue 3 + Composition API
- TypeScript
- Vite
- Tailwind CSS
- Pinia
- Vue Router
