# MyTransit - Real-time Public Transit Tracker

A modern web application for tracking real-time public transportation in Malaysia, built with React, TypeScript, and Mapbox. MyTransit provides live vehicle positions, route visualization, schedules, and directions for buses and trains across multiple operators.

## Overview

**MyTransit is the first and only public transport app in the Malaysian market to offer true real-time live vehicle tracking.** While the most capable competitor app updates positions only every 30 seconds and suffers from a sluggish, non-user-friendly interface, MyTransit revolutionizes the transit experience with smooth, continuous tracking that updates every 100ms through intelligent interpolation between data refreshes.

This breakthrough allows users to accurately estimate journey times, anticipate delays, plan their trips with confidence, and make informed decisions about their commute. MyTransit connects to Malaysia's GTFS (General Transit Feed Specification) data to display real-time positions of public transportation vehicles, featuring an interactive map with vehicle tracking, route overlays, search functionality, favorites management, and integration with Google Maps for directions.

## Features

### Core Functionality
- **Real-time Vehicle Tracking**: True live positions of buses and trains with 30-second data refresh intervals
- **Smooth Vehicle Interpolation**: Industry-leading 100ms position updates between GTFS data refreshes based on speed and bearing for seamless tracking
- **Journey Estimation**: Accurately predict arrival times and foresee potential delays in real-time
- **Interactive Map**: Custom-styled Mapbox maps with dark/light mode support
- **Route Visualization**: Display complete route shapes with progress tracking
- **Multiple Operators**: Support for Prasarana (RapidKL, MRT Feeder, Rapid Penang, Rapid Kuantan) and KTMB
- **Vehicle Search**: Real-time search across all active vehicles
- **Favorites System**: Save and manage favorite routes and vehicles
- **Schedule Information**: View stop times and route schedules
- **Directions**: Get Google Maps directions to/from transit stops
- **User Location**: Optional GPS tracking with visual marker

### Technical Features
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Theme Support**: Dark and light modes with custom map styling
- **Authentication**: Supabase-based auth with guest mode option
- **Performance Optimized**: Efficient rendering with React Context and memoization
- **Type-Safe**: Full TypeScript implementation with strict typing
- **Real-time Updates**: Automatic data refresh and state management

## Tech Stack

### Frontend Framework
- **React 19.2**: UI library with latest concurrent features
- **TypeScript 5**: Type-safe development
- **Next.js 16**: App router and server components (though primarily client-side app)

### Mapping & Visualization
- **Mapbox GL JS**: Interactive vector maps with custom styling
- **Google Maps API**: Directions and routing integration

### Data & State Management
- **React Context API**: Global state for transit, map, auth, and theme
- **SWR Patterns**: Data caching and revalidation
- **Custom Hooks**: Reusable logic for favorites, debouncing, etc.

### Styling & UI
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality component library
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon system

### Backend Services
- **Supabase**: Authentication and user data storage
- **Malaysia Open Data API**: GTFS real-time and static feeds
- **Protocol Buffers**: GTFS real-time data parsing

### Build Tools
- **Vite/Webpack**: Fast development and optimized builds
- **PostCSS**: CSS processing with Autoprefixer
- **ESLint**: Code quality and consistency

## Project Structure

```
mytransit/
├── src/
│   ├── components/           # React components
│   │   ├── auth/            # Authentication UI
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── LeftSidebar.tsx
│   │   │   └── RightSidebar.tsx
│   │   ├── map/             # Map-related components
│   │   │   ├── MapView.tsx
│   │   │   ├── VehicleMarkers.tsx
│   │   │   ├── RouteOverlay.tsx
│   │   │   └── DirectionsOverlay.tsx
│   │   ├── tabs/            # Sidebar tab panels
│   │   │   ├── RoutesTab.tsx
│   │   │   ├── FavouritesTab.tsx
│   │   │   ├── SchedulesTab.tsx
│   │   │   └── AboutTab.tsx
│   │   └── ui/              # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── SearchBar.tsx
│   │       ├── Filters.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── VehiclePopup.tsx
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.tsx      # Authentication state
│   │   ├── TransitContext.tsx   # Transit data & vehicles
│   │   ├── MapContext.tsx       # Map instance & location
│   │   └── ThemeContext.tsx     # Dark/light theme
│   ├── hooks/               # Custom React hooks
│   │   ├── useDebounce.ts       # Debounced values
│   │   └── useFavorites.ts      # Favorites management
│   ├── services/            # External service integrations
│   │   ├── gtfsService.ts       # GTFS data fetching/parsing
│   │   ├── googleMapsService.ts # Google Maps API
│   │   └── supabaseClient.ts    # Supabase configuration
│   ├── types/               # TypeScript type definitions
│   │   ├── vehicle.ts           # Vehicle & filter types
│   │   ├── gtfs.ts              # GTFS data types
│   │   └── user.ts              # User & auth types
│   ├── utils/               # Utility functions
│   │   ├── constants.ts         # App constants & config
│   │   ├── formatters.ts        # Data formatting utilities
│   │   └── distance.ts          # Geospatial calculations
│   ├── App.tsx              # Root application component
│   ├── index.tsx            # Application entry point
│   └── index.css            # Global styles
├── components/              # shadcn/ui components (Next.js)
│   └── ui/
├── public/                  # Static assets
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Core Components

### Context Providers

#### TransitContext (`src/contexts/TransitContext.tsx`)
Manages all transit-related data and state:
- **State Management**:
  - `vehicles`: Filtered list of active vehicles
  - `allVehicles`: Complete vehicle list
  - `staticData`: GTFS static data (routes, stops, trips, shapes)
  - `selectedVehicle`: Currently selected vehicle
  - `filters`: Active filters (operator, vehicle type, route)
  - `selectedFeed`: Current GTFS feed selection
  
- **Functions**:
  - `refreshVehicles()`: Fetch latest GTFS real-time data
  - `setSelectedVehicle()`: Select a vehicle for details
  - `setFilters()`: Apply vehicle filters
  - `getShapeForVehicle()`: Retrieve route shape for a vehicle
  - `enrichVehiclesWithShapes()`: Add route and shape data to vehicles
  
- **Features**:
  - Automatic 30-second data refresh
  - 100ms interpolation for smooth vehicle movement
  - Progress calculation along routes
  - Error handling and loading states

#### MapContext (`src/contexts/MapContext.tsx`)
Manages map instance and user location:
- `map`: Mapbox GL JS map instance
- `userLocation`: GPS coordinates if enabled
- `isLocationEnabled`: Location permission status
- `requestLocation()`: Request user's location
- `flyTo()`: Animate map to coordinates

#### AuthContext (`src/contexts/AuthContext.tsx`)
Handles user authentication via Supabase:
- `user`: Current authenticated user
- `isGuest`: Guest mode status
- `isAuthenticated`: Authentication state
- `signIn()`: Email/password login
- `signUp()`: User registration
- `signOut()`: Logout
- `continueAsGuest()`: Skip authentication
- `exitGuestMode()`: Return to auth screen

#### ThemeContext (`src/contexts/ThemeContext.tsx`)
Manages application theme:
- `isDark`: Dark mode enabled state
- `toggleTheme()`: Switch between themes
- Persists preference to localStorage

### Layout Components

#### MainLayout (`src/components/layout/MainLayout.tsx`)
Main application shell:
- Navbar at top with logo and tab navigation
- Left sidebar (desktop) or drawer (mobile) with search and filters
- Center map view taking full viewport
- Right sidebar for tab content (routes, favorites, schedules, about)
- Vehicle popup overlay when vehicle selected
- Responsive breakpoints for mobile/tablet/desktop

#### MapView (`src/components/map/MapView.tsx`)
Core mapping component:
- Initializes Mapbox GL JS map
- Custom color schemes for dark/light themes
- Navigation controls (zoom, compass, scale)
- User location marker with pulsing animation
- Vehicle count overlay
- Calibrating indicator on data refresh
- Manages map lifecycle and style changes

#### VehicleMarkers (`src/components/map/VehicleMarkers.tsx`)
Renders vehicle markers on map:
- Custom HTML markers for each vehicle
- Color-coded by operator
- Rotation based on bearing
- Animated movement using interpolated positions
- Click handlers for vehicle selection
- Efficient updates using refs to avoid re-renders

#### RouteOverlay (`src/components/map/RouteOverlay.tsx`)
Displays route shapes on map:
- GeoJSON line layer for selected vehicle's route
- Operator-specific colors
- Progress indicator along route
- Animates into view when vehicle selected

#### DirectionsOverlay (`src/components/map/DirectionsOverlay.tsx`)
Shows Google Maps directions:
- Polyline rendering of route steps
- Start/end markers
- Turn-by-turn visualization
- Clears when directions closed

### Service Layers

#### gtfsService (`src/services/gtfsService.ts`)
Handles all GTFS data operations:
- **GTFS Real-time**:
  - Fetches vehicle positions from Malaysia Open Data API
  - Parses Protocol Buffer format using custom proto definition
  - Transforms to internal Vehicle type
  - Supports multiple operators and feed types
  
- **GTFS Static**:
  - Downloads ZIP archives of static data
  - Parses CSV files (routes, stops, trips, stop_times, shapes)
  - Builds optimized data structures
  - Groups shapes by shape_id
  
- **Data Enrichment**:
  - Assigns operator names based on feed category
  - Sets route colors per operator
  - Maps vehicle types (bus/train)

#### googleMapsService (`src/services/googleMapsService.ts`)
Google Maps integration:
- `getDirections()`: Calculate routes between points
- Handles travel modes (driving, walking, transit)
- Returns decoded polylines and step-by-step instructions
- Error handling for API failures

#### supabaseClient (`src/services/supabaseClient.ts`)
Supabase initialization:
- Creates authenticated client
- Configured with environment variables
- Used by AuthContext for auth operations

## Key Features Explained

### Real-time Vehicle Tracking
The app fetches GTFS real-time data every 30 seconds, then interpolates vehicle positions every 100ms for smooth movement:

1. **Data Fetch**: `fetchGTFSRealtime()` retrieves Protocol Buffer data
2. **Parsing**: Decodes GTFS-RT messages to extract vehicle positions
3. **Enrichment**: Adds static data (routes, shapes, colors)
4. **Interpolation**: `interpolatePosition()` calculates intermediate positions based on speed/bearing
5. **Rendering**: Updates map markers with new positions

### Route Visualization
When a vehicle is selected:
1. System finds associated trip_id and shape_id
2. Retrieves shape points from GTFS static data
3. Calculates vehicle's progress along the route
4. Renders GeoJSON line on map with progress indicator
5. Colors match operator branding

### Search & Filtering
- **Live Search**: Debounced search across vehicle labels, routes, and operators
- **Operator Filter**: Filter by transit agency
- **Vehicle Type**: Show only buses or trains
- **Route Filter**: Display specific routes

### Favorites System
- Uses custom `useFavorites()` hook
- Stores favorites in localStorage (can be upgraded to Supabase)
- Support for favorite vehicles and routes
- Quick access from sidebar

### Schedules
- Displays GTFS stop_times for selected routes
- Shows arrival/departure times at each stop
- Formatted for readability
- Highlights current position if available

## Environment Variables

Create a `.env` file with:

```bash
REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_token
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Getting API Keys

**Mapbox** (Required):
- Sign up at [mapbox.com](https://mapbox.com)
- Create access token with `styles:read` and `fonts:read` scopes
- Free tier: 50,000 map loads/month

**Supabase** (Required for auth):
- Create project at [supabase.com](https://supabase.com)
- Copy URL and anon key from project settings
- Free tier: 50,000 monthly active users

**Google Maps** (Required for directions):
- Enable Directions API in [Google Cloud Console](https://console.cloud.google.com)
- Create API key with restrictions
- Free tier: $200/month credit

**GTFS Data** (No key needed):
- Uses public Malaysia Open Data API
- Base URL: `https://api.data.gov.my`

## Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd mytransit

# Install dependencies
npm install

# Create .env file with your API keys
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Supported Transit Operators

### Prasarana
- **MRT Feeder Bus**: Feeder services for MRT stations
- **RapidKL**: Kuala Lumpur metro area buses
- **Rapid Penang**: Penang island and mainland buses
- **Rapid Kuantan**: Kuantan city buses

### KTMB
- **Komuter**: Commuter rail services
- **ETS**: Electric Train Service
- **Intercity**: Long-distance trains

### Future Support
- MyBAS (Johor)
- Additional regional operators

## Configuration Constants

Located in `src/utils/constants.ts`:

```typescript
GTFS_REFRESH_INTERVAL = 30000     // 30 seconds
INTERPOLATION_INTERVAL = 100      // 100ms
MAP_INITIAL_CENTER = [101.6869, 3.139]  // Kuala Lumpur
MAP_INITIAL_ZOOM = 12
```

## Browser Support

- Chrome/Edge 90+ (recommended)
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Performance Optimizations

- **Memoization**: Heavy use of `useMemo` and `useCallback`
- **Refs**: Map and vehicle data stored in refs to prevent unnecessary renders
- **Debouncing**: Search inputs debounced to 300ms
- **Lazy Loading**: Components split for code splitting
- **Efficient Updates**: Only modified vehicles re-render markers
- **Data Structures**: Maps and Sets for O(1) lookups

## Known Limitations

- Vehicle data depends on operator GTFS feed quality
- Some operators may have delayed or incomplete real-time data
- Route shapes may be missing for some trips
- Guest mode doesn't persist favorites across sessions
- Interpolation is approximate and may differ from actual positions

## Future Enhancements

- [ ] **First-Person Navigation View**: Immersive street-level navigation perspective
- [ ] **AI Chatbot Integration**: Intelligent assistant for route planning and transit queries
- [ ] **AI Agent for In-App Navigation**: Smart navigation recommendations based on user preferences and real-time conditions
- [ ] PWA support for offline functionality
- [ ] Push notifications for favorite routes
- [ ] Historical data and analytics
- [ ] Multi-language support (Malay, Chinese)
- [ ] Accessibility improvements (ARIA labels, keyboard nav)
- [ ] Vehicle crowding predictions
- [ ] Integration with other Malaysian transit systems
- [ ] Trip planning with multi-modal routing

## Team

MyTransit is developed by a talented team of developers passionate about improving public transportation accessibility in Malaysia.

### Lubega - Frontend Developer

**Full-stack Developer** with expertise in frontend and backend technologies, delivering scalable web applications impacting over 3 million users globally. Skilled in React, TypeScript, Next.js, and Node.js, with proven success in AI-driven automation projects and performance optimizations. Recognized for collaborating effectively across teams to build reliable, high-quality software solutions.

**Work Experience:**

**Frontend Developer – Deriv**  
*August 2023 – Present | Cyberjaya, Malaysia*
- Maintained and enhanced cashier and payment systems for global web applications serving over 3 million customers, collaborating with backend, design, and QA teams across multiple regions using React, TypeScript, and Agile methodologies
- Increased unit test coverage to over 80% using Jest, and supported Cypress.io/Testim E2E automation
- Optimized wallet package performance using Webpack, reducing bundle load size by 74% for faster, more efficient delivery
- Contributed to the company's low-code platform redesign using Outsystems, improving maintainability and feature rollout speed
- Earned 3× Stars of Excellence awards for outstanding contributions

**Frontend Full Stack Developer (Freelance) – Mindhive Asia Sdn Bhd**  
*August 2024 – June 2025 | Shah Alam, Malaysia*
- Led front-end development for AI-driven solutions in Next.js and React, including document processing and accounts payable/receivable automation
- Partnered closely with backend engineers (Python, SQL) and designers to implement and integrate REST APIs, authentication, and data management
- Delivered 4 full projects for ZUS Coffee and contributed to 2 ongoing enterprise projects, earning positive client feedback for quality and timeliness
- Implemented reusable UI libraries and modular code structures to improve maintainability across multiple client projects

**Technical Skills:**
- **Frontend**: React, Next.js, TypeScript, JavaScript, HTML5, CSS3, SASS, TailwindCSS, Shadcn, Outsystems
- **Backend**: Node.js, Python, SQL, Redis, Docker, Firebase, Supabase, Introductory PHP & MySQL knowledge
- **Mobile**: React Native, Flutter (Dart), Bloc/Cubit architecture
- **Testing**: Jest, Cypress.io, Testim (unit & E2E testing)
- **Version Control**: Git, Linux, Ubuntu, CI/CD basics
- **Cloud & Deployment**: Intro to GCP & AWS, Docker containers
- **Languages**: English & Malay (Native), German (C1 TELC Hochschule)

---

### Anas - Mobile Developer

**Mobile Application Developer** with a passion for creating exceptional user experiences through the perfect blend of technology and creative design. Specializes in Flutter development with a strong foundation in UI/UX design principles, bringing nearly two years of Flutter experience and recent Swift development skills acquired in 2024.

**Work Experience:**

**Mobile Application Developer – OTA MY SDN. BHD.**  
*May 2025 – Present | Bangsar, Kuala Lumpur (On-site)*
- Full-time mobile application development focusing on user-centric solutions
- Applying UI/UX design expertise to create intuitive mobile experiences

**Mobile Application Developer – Deriv**  
*August 2023 – May 2025 (1 year 10 months) | Cyberjaya, Selangor (On-site)*
- Developed mobile applications using Flutter and modern mobile development practices
- Collaborated with cross-functional teams to deliver high-quality mobile solutions
- Applied comprehensive skills in web development, software development, user interface design, and 20+ additional technical competencies

**Technical Background:**
- **Mobile Development**: Flutter (2 years), Swift (2024+), React Native
- **Frontend**: Bootstrap 5, HTML5, CSS3, JavaScript
- **Backend Foundation**: MySQL, PhpMyAdmin
- **UI/UX Design**: Hobby-level expertise informing development decisions
- **Creative Skills**: Photoshoots, videography, video editing, filming, social media content creation

**Philosophy:**
Anas combines his software development background with a strong interest in the creative industry, making him highly quality-conscious in all his work. His passion for UI/UX design as a hobby helps him create better user experiences through code, bridging the gap between technical implementation and user-centered design.

## Support

For issues, questions, or suggestions:
- Open a GitHub issue
- Contact: muhdlubegasiraje@gmail.com (Web Developer) / hanasrullahhalim@gmail.com (Mobile Developer)

---

Built with ❤️ for Malaysian public transit users
