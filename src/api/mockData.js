export const MOCK_CATEGORIES = [
  { id: 1, name: 'Dev Tools',    slug: 'dev-tools',    icon: '🛠' },
  { id: 2, name: 'Productivity', slug: 'productivity', icon: '⚡' },
  { id: 3, name: 'Design',       slug: 'design',       icon: '🎨' },
  { id: 4, name: 'Security',     slug: 'security',     icon: '🔒' },
  { id: 5, name: 'AI Tools',     slug: 'ai-tools',     icon: '🤖' },
  { id: 6, name: 'DevOps',       slug: 'devops',       icon: '📡' },
  { id: 7, name: 'Mobile',       slug: 'mobile',       icon: '📱' },
]

const devTools    = MOCK_CATEGORIES[0]
const productivity = MOCK_CATEGORIES[1]
const design      = MOCK_CATEGORIES[2]
const security    = MOCK_CATEGORIES[3]
const aiTools     = MOCK_CATEGORIES[4]
const devops      = MOCK_CATEGORIES[5]
const mobile      = MOCK_CATEGORIES[6]

export const MOCK_REVIEWS = [
  {
    id: 1,
    slug: 'cursor-1-0',
    title: 'Cursor 1.0',
    tagline: 'The AI-first code editor finally hits stable — and it might actually dethrone VS Code for daily use.',
    verdict: 'recommended',
    is_pinned: true,
    upvote_count: 847,
    comment_count: 127,
    user_has_upvoted: false,
    user_has_bookmarked: false,
    hero_image_url: null,
    platforms: 'macOS · Windows · Linux',
    release_date: '2026-05-22',
    external_url: 'https://cursor.com',
    category: devTools,
    tags: [{ id: 1, name: 'AI' }, { id: 2, name: 'editor' }, { id: 3, name: 'TypeScript' }],
    body: `## Overview

Cursor 1.0 marks the end of a long preview period that began when the team forked VS Code and started layering AI features directly into the editor surface. The result no longer feels like "VS Code with an AI plugin" — it feels like an editor designed with AI assistance as a first-class primitive.

## What's New in 1.0

- **Tab completion redesign** — context-aware multi-line completions that track what you edited three files ago.
- **Composer agent mode** — give a natural language goal; Composer edits multiple files and runs terminal commands to reach it.
- **Background indexing** — the entire repo is indexed on first launch and kept live, so context retrieval is instant.
- **Notepads** — persistent scratchpads that attach to a conversation for long-running tasks.

## What Still Needs Work

The free tier is tight — 500 fast requests per month disappears quickly on a large codebase. The privacy mode (no code sent to servers) is there but requires a Pro plan. Extension compatibility is 95% of VS Code's ecosystem, which is good but "not 100%" will matter to teams with niche tooling.

## Verdict

If you write code every day, Cursor 1.0 earns its place as a daily driver. The AI integration is deep enough that working without it starts to feel like coding without autocomplete. **Recommended** — especially for solo developers and small teams. Larger orgs should evaluate the data privacy model first.`,
  },
  {
    id: 2,
    slug: 'linear-5-0',
    title: 'Linear 5.0',
    tagline: 'An overhaul of the timeline and roadmap UX that makes quarterly planning feel native rather than bolted on.',
    verdict: 'recommended',
    is_pinned: false,
    upvote_count: 612,
    comment_count: 34,
    user_has_upvoted: false,
    user_has_bookmarked: false,
    hero_image_url: null,
    platforms: 'Web · macOS · iOS',
    release_date: '2026-05-20',
    external_url: 'https://linear.app',
    category: productivity,
    tags: [{ id: 4, name: 'project-management' }, { id: 5, name: 'roadmap' }],
    body: `## Overview

Linear has always been the darling of fast-moving engineering teams, but roadmap planning was always its weak spot. Version 5.0 fixes that with a ground-up reimagining of the timeline view.

## What's New

- **Timeline 2.0** — drag-to-resize milestones, dependency arrows, and a swimlane view by team or project.
- **Quarterly goals** — tie issues and projects to high-level OKRs without leaving the tool.
- **Triage inbox** — a dedicated view for incoming issues that keeps your backlog clean.
- **Improved API rate limits** — 3× the throughput for integrations.

## What Still Needs Work

The mobile app still lags behind the web experience. Roadmap sharing with external stakeholders (clients, investors) requires a workaround via public links — a proper guest view would round this out nicely.

## Verdict

Linear 5.0 finally delivers on the "one tool for the whole product lifecycle" promise. **Recommended** for product and engineering teams of 5–100 people.`,
  },
  {
    id: 3,
    slug: 'arc-browser-2-0',
    title: 'Arc Browser 2.0',
    tagline: 'The Browser Company goes even further from the Chrome paradigm with Profiles, Spaces, and a redesigned command bar.',
    verdict: 'worth_watching',
    is_pinned: false,
    upvote_count: 489,
    comment_count: 58,
    user_has_upvoted: false,
    user_has_bookmarked: false,
    hero_image_url: null,
    platforms: 'macOS · Windows',
    release_date: '2026-05-18',
    external_url: 'https://arc.net',
    category: productivity,
    tags: [{ id: 6, name: 'browser' }, { id: 7, name: 'macOS' }],
    body: `## Overview

Arc 2.0 doubles down on the spatial browser metaphor. Tabs are still called tabs, but they behave more like documents in a filing cabinet — sorted into Spaces, grouped under Profiles, and retrievable via a natural-language command bar.

## What's New

- **AI command bar** — type "the Figma file from last Tuesday" and Arc finds it.
- **Cross-device Spaces** — your work/personal split now syncs to the Windows client.
- **Arc Max** — an AI layer that auto-summarizes pages, rewrites search results, and answers questions about the current page.
- **Easels** — a lightweight canvas for collecting web content alongside notes.

## Concerns

Arc Max's data handling deserves scrutiny before rolling it out to a team. Some users also report the vertical tab sidebar eats horizontal space on 13-inch screens.

## Verdict

Genuinely innovative, but the AI features need a trust-building period. **Worth Watching** — revisit in 6 months when Arc Max's privacy posture is clearer.`,
  },
  {
    id: 4,
    slug: 'figma-4-0',
    title: 'Figma 4.0',
    tagline: 'Code annotations, component variables, and a reworked inspect panel that designers and engineers can finally agree on.',
    verdict: 'recommended',
    is_pinned: false,
    upvote_count: 401,
    comment_count: 21,
    user_has_upvoted: false,
    user_has_bookmarked: false,
    hero_image_url: null,
    platforms: 'Web · macOS · Windows',
    release_date: '2026-05-15',
    external_url: 'https://figma.com',
    category: design,
    tags: [{ id: 8, name: 'design' }, { id: 9, name: 'React' }, { id: 10, name: 'CSS' }],
    body: `## Overview

Figma 4.0 is the release that finally makes Dev Mode feel like a first-class product rather than a tacked-on export tool. The design-to-code gap has always been Figma's open wound — this update closes a lot of it.

## What's New

- **Component variables** — design tokens that flow from design into code with a single source of truth.
- **Code annotations** — designers can attach implementation notes directly to components; engineers see them in inspect.
- **Reworked inspect panel** — CSS, iOS, and Android code previews that actually match what developers write in 2026.
- **Figma AI** — auto-layout suggestions, copy rewrites, and an image generation panel baked into the sidebar.

## What Still Needs Work

Variable scoping gets complex fast. And the AI image generation feels like a checkbox feature — it's there, but the quality lags behind Midjourney by a year.

## Verdict

The inspect panel overhaul alone is worth the upgrade. **Recommended** for any team with a design-engineering handoff problem.`,
  },
  {
    id: 5,
    slug: '1password-9',
    title: '1Password 9',
    tagline: 'Full passkey management is the headline, but the revamped team admin dashboard deserves equal billing.',
    verdict: 'recommended',
    is_pinned: false,
    upvote_count: 377,
    comment_count: 17,
    user_has_upvoted: false,
    user_has_bookmarked: false,
    hero_image_url: null,
    platforms: 'macOS · Windows · iOS · Android',
    release_date: '2026-05-12',
    external_url: 'https://1password.com',
    category: security,
    tags: [{ id: 11, name: 'security' }, { id: 12, name: 'passkeys' }, { id: 13, name: 'self-hosted' }],
    body: `## Overview

1Password 9 arrives at the right moment — just as passkeys are going mainstream and teams are scrambling to manage them alongside traditional credentials. This release makes 1Password the most complete passkey manager available.

## What's New

- **Passkey vault** — create, store, and share passkeys across devices with the same UX as passwords.
- **Admin dashboard v3** — granular permission controls, audit logs, and a new "provisioning groups" model for large orgs.
- **Watchtower improvements** — now flags weak passkey implementations, not just weak passwords.
- **SSH agent** — manage SSH keys directly in 1Password with biometric unlock.

## What Still Needs Work

The SSH agent is macOS-only for now. Browser extension startup time on Firefox is noticeably slower than in v8.

## Verdict

The best password manager just got significantly better. **Recommended** for individuals and teams — the admin improvements make the Business plan genuinely compelling.`,
  },
  {
    id: 6,
    slug: 'vercel-v0-2-0',
    title: 'Vercel v0 2.0',
    tagline: 'Multi-component generation, Tailwind v4 output, and a Figma import path that almost closes the design-to-code gap.',
    verdict: 'worth_watching',
    is_pinned: false,
    upvote_count: 298,
    comment_count: 45,
    user_has_upvoted: false,
    user_has_bookmarked: false,
    hero_image_url: null,
    platforms: 'Web',
    release_date: '2026-05-10',
    external_url: 'https://v0.dev',
    category: aiTools,
    tags: [{ id: 14, name: 'AI' }, { id: 15, name: 'React' }, { id: 16, name: 'TypeScript' }],
    body: `## Overview

v0 2.0 is Vercel's biggest bet on AI-generated UI. The original v0 was impressive for one-off component generation. Version 2.0 goes further: it can now generate entire page layouts, wire up state between components, and accept a Figma frame as input.

## What's New

- **Multi-component projects** — generate an entire page (navbar, hero, cards, footer) in one prompt.
- **Tailwind v4 output** — generated code uses the latest Tailwind syntax by default.
- **Figma import** — paste a Figma share link and v0 converts the frame to React + Tailwind.
- **Edit mode** — click any part of the preview to refine it with a follow-up prompt.

## What Still Needs Work

The Figma import works best on simple layouts. Complex auto-layout with overlapping elements often produces messy CSS. Generated accessibility markup is also inconsistent — always audit before shipping.

## Verdict

Excellent for prototyping and scaffolding. Not production-ready without a code review pass. **Worth Watching** — another 6 months of iteration and this could replace boilerplate generation entirely.`,
  },
  {
    id: 7,
    slug: 'supabase-2-0',
    title: 'Supabase 2.0',
    tagline: 'Database branching is out of preview. Pair with GitHub Actions and you have a real staging-to-prod pipeline for Postgres.',
    verdict: 'recommended',
    is_pinned: false,
    upvote_count: 256,
    comment_count: 29,
    user_has_upvoted: false,
    user_has_bookmarked: false,
    hero_image_url: null,
    platforms: 'Web · CLI',
    release_date: '2026-05-08',
    external_url: 'https://supabase.com',
    category: devTools,
    tags: [{ id: 17, name: 'Postgres' }, { id: 18, name: 'open-source' }, { id: 19, name: 'API' }],
    body: `## Overview

Supabase has been the "Firebase but with Postgres" answer for years. Version 2.0 makes a strong case that it's grown beyond that comparison — database branching alone changes how teams manage schema evolution.

## What's New

- **Database branching (GA)** — spin up isolated Postgres branches for PRs; merge schema changes like code.
- **Edge Functions v2** — faster cold starts, native npm support, and a built-in key-value store.
- **Log drains** — stream your Supabase logs to Datadog, Axiom, or any webhook.
- **Supabase AI** — natural language to SQL inside the dashboard, plus auto-generated TypeScript types.

## What Still Needs Work

Branching incurs cost at scale — each branch is a full Postgres instance. The pricing model will surprise teams that spin up many PR previews. The CLI DX still has rough edges on Windows.

## Verdict

Database branching alone is worth the version bump. **Recommended** for any team running Postgres who wants better preview environments.`,
  },
  {
    id: 8,
    slug: 'raycast-2-0',
    title: 'Raycast 2.0',
    tagline: 'Cloud sync, team extensions, and a notes layer integrated with clipboard history. Spotlight feels ancient now.',
    verdict: 'recommended',
    is_pinned: false,
    upvote_count: 214,
    comment_count: 12,
    user_has_upvoted: false,
    user_has_bookmarked: false,
    hero_image_url: null,
    platforms: 'macOS',
    release_date: '2026-05-05',
    external_url: 'https://raycast.com',
    category: productivity,
    tags: [{ id: 20, name: 'macOS' }, { id: 21, name: 'CLI' }, { id: 22, name: 'productivity' }],
    body: `## Overview

Raycast started as a Spotlight replacement and has quietly become one of the most essential pieces of software on macOS. Version 2.0 makes the leap from a personal tool to something teams can share and standardize on.

## What's New

- **Cloud sync** — your extensions, snippets, and settings follow you across machines instantly.
- **Team extensions** — publish internal extensions to your org; no App Store, no approval process.
- **Raycast Notes** — a lightweight note layer that integrates with your clipboard history and AI chat.
- **AI improvements** — model switching (GPT-4o, Claude, Gemini) without leaving the launcher.

## What Still Needs Work

The Team plan pricing ($10/user/month) is steep for small teams who mostly use free extensions. Notes is useful but can't replace Obsidian or Notion for anything non-trivial.

## Verdict

If you're on macOS and not using Raycast, you're leaving productivity on the table. **Recommended** — especially now that team sharing makes it viable for entire orgs.`,
  },
  {
    id: 9,
    slug: 'expo-sdk-53',
    title: 'Expo SDK 53',
    tagline: 'React Native\'s new architecture is now the default. Bridgeless mode, faster startup, and a revamped EAS workflow.',
    verdict: 'worth_watching',
    is_pinned: false,
    upvote_count: 189,
    comment_count: 8,
    user_has_upvoted: false,
    user_has_bookmarked: false,
    hero_image_url: null,
    platforms: 'iOS · Android',
    release_date: '2026-05-03',
    external_url: 'https://expo.dev',
    category: mobile,
    tags: [{ id: 23, name: 'React' }, { id: 24, name: 'mobile' }, { id: 25, name: 'open-source' }],
    body: `## Overview

SDK 53 is the release where React Native's "new architecture" stops being an opt-in experiment and becomes the default. After three years of preview, the bridgeless renderer and concurrent features are now what you get out of the box.

## What's New

- **New architecture default** — JSI, Fabric renderer, and TurboModules are now on by default for new projects.
- **Faster cold starts** — 30–40% startup improvement on mid-range Android devices in our testing.
- **EAS Build overhaul** — parallel builds, smarter caching, and a new dashboard that shows build minutes per team member.
- **expo-camera v2** — rebuilt on AVFoundation/Camera2 with 60fps support and a cleaner API.

## What Still Needs Work

Third-party libraries that haven't migrated to the new architecture will cause silent failures. The migration guide is thorough but the actual migration on large codebases is a weekend project at minimum.

## Verdict

If you're starting a new React Native project, SDK 53 is the obvious choice. Existing apps should migrate carefully — validate every native module first. **Worth Watching** if you have a large app; **Recommended** for greenfield.`,
  },
  {
    id: 10,
    slug: 'zed-1-0',
    title: 'Zed 1.0',
    tagline: 'The Rust-built editor built for speed ships its stable release with collaborative editing and an AI assistant baked in.',
    verdict: 'recommended',
    is_pinned: false,
    upvote_count: 163,
    comment_count: 41,
    user_has_upvoted: false,
    user_has_bookmarked: false,
    hero_image_url: null,
    platforms: 'macOS · Linux',
    release_date: '2026-05-01',
    external_url: 'https://zed.dev',
    category: devTools,
    tags: [{ id: 26, name: 'editor' }, { id: 27, name: 'Rust' }, { id: 28, name: 'open-source' }],
    body: `## Overview

Zed has been making waves since it went open-source, but the 1.0 release is the first version the team is ready to stand behind for production daily use. Built in Rust from the ground up, it benchmarks faster than any Electron-based editor — and it shows.

## What's New

- **Stable channel** — 1.0 marks the first release with a guaranteed stable update cadence.
- **Zed AI (GA)** — inline AI editing, multi-file context, and a chat panel powered by Claude. No separate subscription.
- **Collaborative editing** — real-time multiplayer editing with voice, similar to Figma's collab model but for code.
- **Extension marketplace** — LSP extensions, themes, and key bindings via a curated registry.

## What Still Needs Work

Windows support is still in preview and feels it — several extensions don't load correctly. The extension ecosystem is a fraction of VS Code's. Vim mode is good but misses some edge cases that Neovim users will notice.

## Verdict

The fastest native editor available today, with surprisingly mature AI and collaboration features. **Recommended** for macOS/Linux developers willing to accept a smaller extension ecosystem in exchange for raw performance.`,
  },
]

export const MOCK_COMMENTS = {
  'cursor-1-0': [
    { id: 1, user: { id: 99, display_name: 'alex_dev' }, body: 'Been using it since the RC. The Composer agent mode genuinely surprised me — asked it to add dark mode to a Next.js app and it touched 8 files correctly on the first try.', created_at: '2026-06-14T10:30:00Z', is_deleted: false },
    { id: 2, user: { id: 100, display_name: 'sarahk' }, body: 'The indexing is the real unlock. My 300k line repo indexes in about 90 seconds and the context accuracy is noticeably better than when I was using Continue.dev.', created_at: '2026-06-14T07:15:00Z', is_deleted: false },
    { id: 3, user: { id: 101, display_name: 'mrobinson' }, body: 'Fair review. I\'d add that the pricing cliff between free and Pro ($20/mo) is steep for hobbyists. A $5 indie tier would unlock so many more users.', created_at: '2026-06-14T04:00:00Z', is_deleted: false },
  ],
  'linear-5-0': [
    { id: 4, user: { id: 102, display_name: 'pmlife' }, body: 'The roadmap view is night and day vs v4. We finally retired our Notion roadmap doc.', created_at: '2026-06-13T14:00:00Z', is_deleted: false },
    { id: 5, user: { id: 103, display_name: 'tobi_eng' }, body: 'Triage inbox is underrated. It solved our "who owns this inbound bug" problem immediately.', created_at: '2026-06-13T09:00:00Z', is_deleted: false },
  ],
  'zed-1-0': [
    { id: 6, user: { id: 104, display_name: 'rustacean' }, body: 'Cold start on my M3 MacBook is instant. Coming from VS Code the speed difference is shocking.', created_at: '2026-06-12T16:00:00Z', is_deleted: false },
    { id: 7, user: { id: 105, display_name: 'vim_enjoyer' }, body: 'Vim mode is 90% there. Missing a few ex commands I rely on daily. Will keep an eye on the issue tracker.', created_at: '2026-06-12T11:00:00Z', is_deleted: false },
  ],
}
