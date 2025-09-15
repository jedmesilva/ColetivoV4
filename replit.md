# Project Overview

This is a full-stack web application for managing group investment funds, built with React frontend and Express.js backend. The application allows users to create and view investment funds, track contributions, and monitor fund performance with features like balance visibility controls and growth metrics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with custom color scheme featuring warm orange/cream tones
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API endpoints following conventional patterns (/api/funds, /api/contributions)
- **Database**: ⚠️ EXCLUSIVELY SUPABASE PostgreSQL - NO OTHER databases allowed for security
- **Storage**: Supabase-only storage implementation with interface pattern - SECURITY ENFORCED
- **Error Handling**: Centralized error middleware with structured JSON responses

### Database Schema (SUPABASE ONLY)
- **Accounts Table**: id, email, password, name (stored in Supabase PostgreSQL)
- **Funds Table**: id, name, objective, contribution_rate, retribution_rate, etc. (stored in Supabase PostgreSQL)
- **Contributions Table**: id, fund_id, account_id, amount, status (stored in Supabase PostgreSQL)
- **Fund Members Table**: fund membership relationships (stored in Supabase PostgreSQL)
- **Validation**: Zod schemas for runtime type checking and API validation
- **⚠️ SECURITY**: ALL data MUST be stored in Supabase - NO other databases permitted

### Development Tools
- **Build System**: Vite for fast development and optimized production builds
- **Type Safety**: TypeScript across the entire codebase with shared types
- **Database Migrations**: Drizzle Kit for SUPABASE schema management and migrations ONLY
- **Code Quality**: ESM modules throughout, strict TypeScript configuration

### Key Features
- **Fund Management**: Create, view, and track investment funds with emoji identifiers
- **Financial Tracking**: Balance display with toggle visibility, growth percentage calculations
- **Responsive Design**: Mobile-first approach with bottom navigation and touch-friendly interactions
- **Real-time Updates**: React Query enables optimistic updates and background synchronization

## External Dependencies

### Database & Storage (SUPABASE ONLY - SECURITY ENFORCED)
- **⚠️ SUPABASE**: EXCLUSIVELY used PostgreSQL database service - NO OTHER databases allowed
- **Supabase Client**: Official Supabase JavaScript client (@supabase/supabase-js)
- **Drizzle ORM**: Type-safe database toolkit for SUPABASE PostgreSQL operations ONLY

### UI & Styling
- **Radix UI**: Comprehensive set of accessible React components (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Utility for building type-safe component variants

### Development & Runtime
- **Vite**: Build tool with React plugin and development server
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form library with resolver integration
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation utilities

### Replit Integration
- **Replit Vite Plugins**: Development error overlay and cartographer for enhanced debugging