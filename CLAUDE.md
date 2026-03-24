# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server (with Node.js compatibility shim + Turbopack)
npm run dev

# Build
npm build

# Lint
npm run lint

# Tests
npm test                    # run all tests
npm test -- path/to/file    # run a single test file
npm test -- -t "test name"  # run tests matching a pattern

# Database
npx prisma migrate dev      # apply migrations
npm run db:reset            # reset database (destructive)
```

Environment: copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY`. Without a key, the app runs with mock responses.

## Architecture

UIGen is an AI-powered React component generator. Users describe components in a chat interface; Claude generates code using tool calls; results appear in a live preview.

### Request Flow

1. User types a prompt → `ChatInterface` → POST `/api/chat`
2. `/api/chat/route.ts` calls Claude via Vercel AI SDK with two tools:
   - `str_replace_editor` (`lib/tools/str-replace.ts`) — edit existing file content
   - `file_manager` (`lib/tools/file-manager.ts`) — create/delete files
3. Tool calls stream back and update the `VirtualFileSystem` (in-memory, no disk writes)
4. `PreviewFrame` detects file changes, compiles JSX via `@babel/standalone` at runtime, and renders in an iframe using an esm.sh import map
5. If a `projectId` is present, the conversation and VFS are persisted to SQLite via Prisma

### Key Abstractions

**VirtualFileSystem** (`lib/file-system.ts`): in-memory tree of files/directories, serializable to JSON for database storage. Shared globally via `FileSystemProvider` context (`lib/contexts/file-system-context.tsx`).

**ChatProvider** (`lib/contexts/chat-context.tsx`): owns all chat state and the `useChat` hook call. Orchestrates tool result processing and triggers VFS updates when Claude writes files.

**PreviewFrame** (`components/preview/PreviewFrame.tsx`): iframe that rebuilds its import map on every VFS change, resolves inter-file imports, and injects Babel to transform JSX at runtime.

**provider.ts** (`lib/provider.ts`): single place to swap between the real Anthropic model and a mock — used by the chat API route.

**System prompt** (`lib/prompts/generation.tsx`): the instruction set that shapes how Claude generates components.

### Auth & Persistence

- JWT sessions (HTTP-only cookies, 7-day expiry) via `lib/auth.ts`
- Server actions in `actions/` handle sign-up/in/out and project CRUD
- `middleware.ts` protects project API routes
- Anonymous users can generate freely; saving requires authentication

### Directory Map

```
src/
  app/
    api/chat/route.ts     # AI streaming endpoint
    [projectId]/page.tsx  # per-project view
    main-content.tsx      # resizable panel layout
  actions/                # Next.js server actions (auth + projects)
  components/
    chat/                 # ChatInterface, MessageList, MessageInput
    editor/               # Monaco wrapper + FileTree
    preview/              # PreviewFrame (iframe + Babel runtime)
    auth/                 # Auth dialogs and forms
    ui/                   # Shadcn/Radix primitives
  lib/
    tools/                # AI tool definitions (str-replace, file-manager)
    transform/            # JSX/Babel transformation helpers
    contexts/             # React contexts for chat and VFS state
    prompts/              # Claude system prompt
prisma/schema.prisma      # SQLite schema: User, Project
```
