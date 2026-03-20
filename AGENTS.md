# OpenCode Instructions - Invoice App

## Build/Lint/Test Commands

### Development
- `npm start` or `expo start` - Start dev server
- `npm run android` / `npm run ios` - Run on device/emulator
- `npm run web` - Run web version
- `npm run prebuild` - Prebuild native projects

### Testing & Linting
- `npm run test` - Run tests with Jest (watchAll mode)
- `npm test -- --testNamePattern="test name"` - Run specific test by name
- `npm test -- path/to/test.file.tsx` - Run specific test file
- `npm run lint` - Run Expo linter

### Database
- `npx drizzle-kit generate` - Generate migrations
- `npx drizzle-kit push` - Push schema changes
- `npx drizzle-kit studio` - Open Drizzle Studio

## Code Style Guidelines

### React & Components
- Use functional components with hooks
- Component files: `.tsx` extension, PascalCase naming (e.g., `DatePicker`, `BaseCard`)
- Keep components single-responsibility and focused
- Use React.memo for performance-critical components

### Styling (Tailwind CSS / NativeWind)
- Use Tailwind classes with consistent naming
- Follow light/dark theme pattern: `light-primary/dark-primary`, `light-text/dark-text`
- Use `className` prop for styling, combine with `style` for platform-specific shadows

### Forms & Validation
- Use React Hook Form for form state management
- Validate with Zod schemas (defined in `/db/zodSchema.ts`)
- Use `zodResolver` for integration
- Display validation errors consistently

### Database (Drizzle ORM + SQLite)
- Use Drizzle ORM with Expo SQLite
- Define schemas in `/db/schema.ts`, Zod schemas in `/db/zodSchema.ts`
- Types end with 'Type' (e.g., `TransactionType`), interfaces plain (e.g., `User`)
- Export types from respective domain files

### State Management
- Use Zustand for global state (stores in `/store/`)
- Keep state as close to where it's used as possible
- Prefer local state for component-specific data

### TypeScript & Types
- Enable strict mode (see `tsconfig.json`)
- Use interfaces for props and object shapes
- Use type aliases for unions, primitives, or computed types
- Use path aliases: `@/` for project root imports

### Naming Conventions
- **Functions**: camelCase (e.g., `handleSaveInvoice`, `getUsers`)
- **Async event handlers**: prefix with `handle` (e.g., `handleSendInvoice`)
- **Variables**: camelCase for variables, UPPER_SNAKE_CASE for constants
- **Files**: kebab-case for utilities, PascalCase for components

### Imports
- Order: React → Third-party libraries → Local imports
- Use path aliases (`@/components/...`) instead of relative paths
- Group imports by type with blank lines between groups

### Error Handling
- Use try/catch for async operations
- Display user-friendly errors via Alert or toast
- Log errors to Sentry (configured in `/app/_layout.tsx`)

### Performance
- Use `React.memo` and `useCallback` for optimization
- Virtualize long lists with `FlashList`
- Debounce expensive operations

## Project Structure
```
/app/(tabs)/          - Tab navigation screens
/app/(stack)/         - Stack navigation screens
/components/          - Reusable UI components
/db/                  - Database schemas and operations
/store/               - Zustand state stores
/context/             - React contexts (Theme, AppSettings)
/types/               - TypeScript type definitions
/utils/               - Utility functions
/drizzle/             - Drizzle migrations
```

## Additional Notes
- Use expo-router for file-based routing
- Sentry for error monitoring (initialized in root layout)
- Quick Actions for app shortcuts
- Support both iOS and Android platforms
- Use platform-specific code when needed (Platform.OS checks)

## General Behavior
- **Be Concise:** Do not explain code unless I ask. Only output the code changes.
- **Strict Adherence:** Do not refactor code that is outside the scope of my request.
- **No Extra Features:** Do not add "improvement" or "extra" features I didn't ask for.
- **Comments** Do not add not necessary comments to the code.