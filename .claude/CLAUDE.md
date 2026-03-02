# Starboard Development Guidelines

## Git Workflow

### Branching

- Format: `yourname/<type>/<issue-number>-<issue-name-kebab-cased>`
- Example: `johndoe/feat/ABC-1-add-login-page`
- Always rebase: `git rebase main` (NEVER `git merge`)
- Force push after rebase: `git push --force-with-lease`

### Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/). Format: `type(scope): description`

**Types:** fix, feat, docs, test, chore, style, refactor, perf, build, ci, revert

**Scope structure:** `[first-level]/[platforms]`

- First level: `ui` (visual changes), `api` (backend only), `config` (configs only), or blank
- Platforms: `docs`, `web`, `arch` (in that order, comma-separated if multiple)
- E2E tests: add `-e2e` suffix (e.g., `web-e2e`)

**Examples:**

```text
fix(ui/web): dashboard login button misaligned on mobile
feat(api/web,docs): create user data retrieval endpoints
chore(config/web): add default coverage directory to jest config
docs(installation): add pnpm install commands
perf(api/web): optimize database queries for user data
```

**Commit rules:**

- One logical change per commit
- Each commit must be deployable
- Use `git commit --amend` for fixes to previous commit (unless already on main)

## Architecture

### SDK Pattern

- Front-end MUST use SDK as single entry point
- Front-end MUST NOT talk to Indexer directly

### Testing

- Front-end: Wrap in SDK provider with Fake/Real implementation
- SDK: Use dependency injection with in-memory fake services
- Indexer: Define events in memory for unit tests

### Indexer API Reference

When exploring indexer GraphQL schema or available queries, read from local files - do NOT fetch from live API:

- `indexer/schema.graphql` - main entity definitions
- `indexer/schema.derivatives.graphql` - derived entities (candles, prices, aggregates)
- `indexer/db/migrations/` - SQL views for computed data (open interest, volume)
- `indexer/src/model/generated/` - TypeScript models

For contract constants (decimals, precision), check `contracts/contracts/core/vault/src/main.sw`.

## Styling

### Theme Contract

All CSS-in-JS styles (`*.css.ts`) MUST use tokens from the theme contract (`@/styles/theme.contract.css`) instead of hardcoded values. Never use raw `rem`, `px`, or color literals when a token exists.

| Category       | Import                          | Tokens                                                                                               |
| -------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Colors         | `vars.color.*`                  | `pageBg`, `cardBg`, `inputBg`, `surfaceHover`, `textPrimary`, `textSecondary`, `borderDefault`, etc. |
| Spacing        | `vars.space.*`                  | `2xs` (2px), `xs` (4px), `sm` (8px), `md` (12px), `lg` (16px), `xl` (24px), `2xl` (32px)             |
| Radius         | `vars.radius.*`                 | `button`, `input`, `card` (8px), `panel` (12px), `full` (9999px)                                     |
| Font size      | `vars.fontSize.*`               | `h1`–`h3`, `subtitle`, `bodyLg`, `body`, `bodySm`, `caption`, `label`, `micro`                       |
| Font weight    | `vars.fontWeight.*`             | `normal`, `medium`, `semibold`                                                                       |
| Line height    | `vars.lineHeight.*`             | `tight`, `normal`, `relaxed`                                                                         |
| Letter spacing | `vars.letterSpacing.*`          | `tight`, `normal`, `wide`                                                                            |
| Transitions    | `vars.transition.*`             | `fast` (100ms), `normal` (150ms), `slow` (300ms)                                                     |
| Opacity        | `alpha()` from `@/styles/alpha` | `alpha(color, percent)` for transparent overlays                                                     |

**Acceptable hardcoded values:** viewport calcs (`calc(100vh - ...)`), component-specific fixed dimensions (e.g., sidebar width `420px`, header height `4rem`), `0`, `none`, `auto`, `100%`.

## Code Organization

### Module Design Principles

**Module types:**

- **Client modules** (pages/routes/views): Consumers that import, export only core composition
- **Provider modules**: Atomic, bounded, dumb reusable units

**Provider module traits:**

- **Atomic**: As small as possible for full encapsulated functionality
- **Bounded**: Own API via index.ts, respect module internals, never import from other modules' internals
- **Dumb**: No knowledge of external world, no global store access, all needs via props/context

**File organization standards:**

- utils/lib, common/shared, types/models, pages, views, components, store, hooks, contexts, api, styles

**Code splitting levels:**

1. **Single file**: General to detail, functions below component, styles in `$` namespace
2. **Nested files**: Extract to `Component.utils.ts`, `Component.css.ts` (import as $)
3. **Submodules**: Folder per component when children need own helpers

**Module navigation:**

- Maintain Single Level of Abstraction (SLAB)
- Code should read top-to-bottom like prose
- Enable directed graph traversal through imports

### Module Imports

- **Namespace** (`import * as Module`): Components, Providers, Contexts, Context Types, Utils
- **Direct**: Types/Models, Schemas only (fully-qualified: `OrderEntryFormModel`, `DecreasePositionFormSchema`)
- **Styles**: Always `import * as $`
- **No barrel** at `@/modules/index.ts` - kills code splitting

### Component Propification

Use `propify` from `@/lib/propify` to create preset variants of base components:

```tsx
// Propified variants at top, base component at bottom
export const EntryPriceStat = propify(PositionStatBase, {
  label: 'Entry',
  Value: PositionStats.EntryPrice,
});

export const MarkPriceStat = propify(PositionStatBase, {
  label: 'Mark',
  Value: PositionStats.MarkPrice,
});

// Base component (not exported from index)
function PositionStatBase({ label, positionId, Value }: PositionStatBaseProps) {
  return (
    <div css={$.cell}>
      <span css={$.label}>{label}</span>
      <span css={$.value}>
        $<Value positionId={positionId} />
      </span>
    </div>
  );
}
```

**Rules:**

- Propified exports go at the top of the file
- Base component stays at the bottom (not exported via index.ts)
- Use for creating variants with preset props (labels, icons, Value components)

### Module Contexts

- **`OptionsContext`**: External configurables (inputs)
- **`KernelContext`**: Internal state/controls (outputs)
- **Short names**: `OptionsContext`, `KernelContext` (accessed via `Module.KernelContext`)
- **Separation**: Context definitions in `contexts/`, Providers in `components/`
- **Inheritance**: Child modules cast base context with stricter generic types

## Code Review

Use [Conventional Comments](https://conventionalcomments.org/) format:

- **Bolden** the label and decorations
- Wrap comments in code blocks for easy copying to GitHub
- Be brief and to the point
- Suggest HOW to change without providing pastable solutions

**Example:**

```text
**suggestion (non-blocking):** Consider extracting this logic into a separate function for better testability.
```
