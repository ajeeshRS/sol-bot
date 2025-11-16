# AI Agent Instructions for bonkbot-like

This document provides essential context for AI agents working in this codebase.

## Project Overview

This is a TypeScript project using [Bun](https://bun.sh) as the runtime environment. It's set up as a module-type project with TypeScript support.

## Critical Development Context

### Runtime Environment

- This project uses Bun exclusively as the runtime and package manager
- Do not suggest Node.js, npm, yarn, or pnpm based solutions
- Bun handles TypeScript compilation natively - no separate transpilation needed

### Key Commands

```bash
bun install        # Install dependencies
bun run index.ts   # Run the application
bun test          # Run tests (when added)
bun --hot ./index.ts  # Run with hot reloading
```

### Project Structure

```
├── index.ts          # Main entry point
├── package.json      # Project configuration
├── tsconfig.json     # TypeScript configuration
└── bun.lock         # Bun lock file
```

### Development Patterns

1. **Package Management**
   - Always use `bun install` for adding dependencies
   - Direct imports from `.ts`, `.tsx`, `.jsx`, `.js`, and `.css` files are supported

2. **Built-in Features**
   - Use `Bun.serve()` for HTTP/WebSocket servers instead of Express
   - Prefer Bun's native APIs over Node.js alternatives:
     - `Bun.file` over `node:fs`
     - `Bun.sql` for Postgres
     - `Bun.redis` for Redis
     - Built-in `WebSocket` support

3. **Environment Variables**
   - Bun loads `.env` files automatically - no need for dotenv

4. **Testing**
   - Use `bun:test` for testing:
   ```typescript
   import { test, expect } from "bun:test";
   ```

## Integration Points

The project is set up to support:
- WebSocket connections
- HTTP API routes
- React components with CSS imports
- Hot Module Reloading (HMR)

## Common Tasks

### Adding a New Route
```typescript
Bun.serve({
  routes: {
    "/api/new-route": {
      GET: (req) => new Response("Hello!")
    }
  }
})
```

### WebSocket Integration
```typescript
Bun.serve({
  websocket: {
    open: (ws) => ws.send("Connected!"),
    message: (ws, msg) => ws.send(msg)
  }
})
```

For detailed API documentation, refer to `node_modules/bun-types/docs/**.md`.