# Telegram PDF Transfer Bot Dashboard

## Overview

This is a full-stack web application that provides a dashboard for managing a Telegram userbot that automatically transfers PDF files from a source bot to a target channel. The application features a React frontend with a setup wizard for Telegram authentication, real-time bot status monitoring, and transfer logging capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme and CSS variables
- **Animations**: Framer Motion for smooth transitions
- **Form Handling**: React Hook Form with Zod validation

The frontend is organized in `client/src/` with:
- `pages/` - Main route components (dashboard, auth, not-found)
- `components/` - Reusable components including setup wizard and settings dialog
- `components/ui/` - shadcn/ui component library
- `hooks/` - Custom React hooks for auth, bot operations, and utilities
- `lib/` - Utility functions and query client configuration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Build Tool**: Vite for development, esbuild for production bundling
- **API Design**: REST API with typed routes defined in `shared/routes.ts`
- **Validation**: Zod schemas for request/response validation

The backend is organized in `server/` with:
- `index.ts` - Express server setup and middleware
- `routes.ts` - API route handlers
- `storage.ts` - Database access layer
- `services/telegram.ts` - Telegram client service using GramJS
- `replit_integrations/auth/` - Authentication system

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit with migrations in `./migrations`

Key database tables:
- `users` - User accounts (required for auth)
- `sessions` - Session storage for authentication
- `bot_configs` - Telegram bot configuration per user (API credentials, session strings, source/target settings)
- `transfer_logs` - History of PDF transfers with status and timestamps

### Authentication
- Session-based authentication using express-session
- PostgreSQL session storage via connect-pg-simple
- Currently configured with a mock/default user for development
- OAuth integration scaffold for Replit Auth (openid-client, passport)

### Telegram Integration
- **Library**: GramJS (telegram package) for userbot functionality
- **Session Management**: String sessions stored in database
- **Features**: 
  - Send verification codes to phone numbers
  - Handle 2FA password verification
  - Listen for new messages from configured source bot
  - Forward PDF documents to target channel

## External Dependencies

### Third-Party Services
- **Telegram API**: User authentication and message handling via MTProto
- **PostgreSQL Database**: Requires `DATABASE_URL` environment variable

### Key NPM Packages
- `telegram` (GramJS) - Telegram client library
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `express` / `express-session` - Web server and session handling
- `@tanstack/react-query` - Server state management
- `zod` - Runtime type validation
- `react-hook-form` - Form state management
- Radix UI primitives - Accessible UI components

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session secret (optional, has default)
- `ISSUER_URL` - OpenID Connect issuer for Replit Auth (optional)
- `REPL_ID` - Replit environment identifier (auto-set in Replit)