astra_notes/
├── .cursorrules          # Global AI formatting, typing, prompt rules, and architectural constraints
├── src/
│   ├── app/              # Next.js App Router (File-based routing, Layouts, Server Components)
│   │   ├── api/          # Serverless route handlers for auth webhooks and internal database mutations
│   │   ├── dashboard/    # User dashboard routing for organizing, deleting, and listing notes
│   │   ├── notes/        # Dynamic collaborative workspace route ([id]) for real-time editing
│   │   ├── layout.tsx    # Root layout providing global state providers (Auth, Query, Theme)
│   │   └── page.tsx      # High-performance marketing and landing entry point
│   ├── components/       # Atomic, reusable UI elements styled with Tailwind CSS
│   │   ├── editor/       # TipTap/Lexical collaborative editor core and toolbar components
│   │   ├── sidebar/      # Navigation, folder structures, and user profile switchers
│   │   └── ui/           # Radix UI primitives (Dialogs, Dropdowns, Buttons) styled with Tailwind
│   ├── hooks/            # Custom React hooks managing Yjs presence, state tracking, and local UI state
│   └── lib/              # Shared utilities, Supabase client initialization, and real-time sync configs
│       ├── supabase/     # Supabase client singleton setup for client and server environments
│       └── sync/         # Yjs provider configurations (Liveblocks, Supabase Realtime, or Y-Websocket)
├── prisma/
│   └── schema.prisma     # Single source of truth for PostgreSQL database models and TypeScript types
├── tailwind.config.ts    # Declarative design system definitions, animations, and color tokens
└── tsconfig.json         # Strict TypeScript compiler constraints ensuring total type safety
