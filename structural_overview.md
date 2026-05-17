astra_notes/
├── .cursorrules              # Global AI formatting, typing, and architectural instructions
├── src/
│   ├── app/                  # Next.js App Router (File-based routing, Layouts, Server Components)
│   │   ├── api/              # Route handlers for webhooks and custom server endpoints
│   │   ├── notes/            # Dynamic workspace route for creating and editing notes
│   │   └── page.tsx          # Marketing and landing entry point
│   ├── components/           # Atomic, reusable UI elements styled with Tailwind CSS
│   ├── hooks/                # Custom React hooks managing local sync and Markdown parsing
│   └── lib/                  # Shared utilities, Supabase client initialization, and Prisma schemas
├── prisma/
│   └── schema.prisma         # Single source of truth for database models and TypeScript types
├── tailwind.config.ts        # Declarative design system definitions
└── tsconfig.json             # Strict TypeScript compiler constraints
