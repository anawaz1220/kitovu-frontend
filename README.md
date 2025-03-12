# TrackOS - Kitovu Farmer Platform

A Progressive Web App (PWA) for managing farmer data collection, farm mapping and form submission through enumerators.

## Tech Stack

- **Frontend**: React.js + Vite
- **UI Components**: Tailwind CSS, HeadlessUI
- **Form Management**: React Hook Form
- **State Management**: React Query, Zustand
- **Map Integration**: Leaflet + React Leaflet
- **PWA Support**: Vite PWA Plugin
- **Offline Storage**: Dexie.js

## Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd trakos-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── common/         # Shared components
│   ├── farmer/         # Farmer-related components
│   ├── map/           # Map-related components
│   └── layout/        # Layout components
├── hooks/             # Custom hooks
├── context/          # React context providers
├── services/         # API and service layer
├── utils/            # Utility functions
└── pages/            # Page components
```

## Key Components

- **Farmer Registration**: Multi-step form for farmer data collection
- **Location Info**: Address and GPS location mapping
- **Farm Info**: Farm boundary mapping with area calculation
- **KYC Info**: Identity verification with photo capture
- **Cooperative Info**: Cooperative membership details



## Development

- Use `npm run dev` for development
- Use `npm run build` for production build
- Use `npm run preview` to preview production build


## License

Copyright © 2025 Kitovu Technology Company. All rights reserved.