# Starboard - Issue Checklist

## 1. CI/CD Workflow Issues

### 1.1 Missing CI Stages
- [ ] Compare CI workflow between `main` and `scaffold-fe` branches
- [ ] Identify dropped stages (compare line 32-33 in main vs current)
- [ ] Restore missing CI checks:
  - [ ] Postinstall script stage (tradingview extraction)
  - [ ] Any other missing test/build stages

### 1.2 Node Version Update in Indexer Config
- [ ] Update [indexer/squid.testnet.yaml:7](indexer/squid.testnet.yaml#L7) - change `node_version` from `'20'` to `'22'`
- [ ] Verify consistency with package.json and CI workflows

---

## 2. TypeScript Configuration

### 2.1 Test File Compilation Issue
- [ ] Create `tsconfig.test.json` for fuel-ts-sdk tests
- [ ] Update [fuel-ts-sdk/tsconfig.json:22](fuel-ts-sdk/tsconfig.json#L22) to exclude test files:
  - Add `"**/*.test.ts"` to exclude array
  - Add `"**/*.test.tsx"` to exclude array
  - OR relocate test files outside of `src/` directory
- [ ] Verify tests are not emitting `.d.ts` declarations when building
- [ ] Test the build: `pnpm --filter fuel-ts-sdk build`

---

## 3. Frontend Plugin Improvements

### 3.1 CSS/TW Transform Plugin - AST-based Rewrite
**Location:** [frontend/plugins/css-tw-transform.ts:53-64](frontend/plugins/css-tw-transform.ts#L53-L64)

Current regex-based approach misses:
- Self-closing tags (`<div css={styles.x} />`)
- Single-quoted props (`tw='p-4'`)
- Template literal props
- Props without leading space
- Multi-line attributes
- Nested JSX with `>` characters

- [ ] Install dependencies: `@babel/parser`, `@babel/generator`, `@babel/traverse`, `@babel/types`
- [ ] Rewrite plugin to use AST transformation:
  - [ ] Parse file with `@babel/parser` (JSX plugin)
  - [ ] Traverse `JSXOpeningElement` nodes
  - [ ] Inspect `JSXAttribute`/`JSXExpressionContainer` for `css`/`tw` attributes
  - [ ] Handle `StringLiteral`, `TemplateLiteral`, and `Expression` values
  - [ ] Modify/remove attributes as needed
  - [ ] Generate code with `@babel/generator` (preserve formatting/source maps)
- [ ] Test with all JSX variations (self-closing, multiline, nested)

### 3.2 TW Prop Extraction Enhancement
**Location:** [frontend/plugins/css-tw-transform.ts:86](frontend/plugins/css-tw-transform.ts#L86)

- [ ] Verify Prettier config enforces double quotes (checked: ✓ `singleQuote: true` uses single quotes)
- [ ] Update ESLint config if needed to enforce quote style for JSX attributes
- [ ] Document constraint OR extend regex to handle:
  - [ ] Single quotes: `tw='p-4'`
  - [ ] Template literals: `tw={\`p-4\`}`
  - [ ] JSX expressions: `tw={condition ? "p-4" : "p-2"}`

### 3.3 Duplicate className Handling
**Location:** [frontend/plugins/css-tw-transform.ts:130-133](frontend/plugins/css-tw-transform.ts#L130-L133)

- [ ] Detect existing `className` prop in `cleanedProps`
- [ ] If `className` exists:
  - **Option A:** Merge with `clsx`: `className={clsx(<existingValue>, <newClassExpr>)}`
  - **Option B:** Throw clear error instructing manual merge
- [ ] Ensure correct whitespace/commas and JSX expression syntax
- [ ] Test with elements that already have `className`

### 3.4 clsx Import Detection
**Location:** [frontend/plugins/css-tw-transform.ts:137](frontend/plugins/css-tw-transform.ts#L137)

- [ ] Make import detection more robust to catch:
  - [ ] Default import: `import clsx from 'clsx'`
  - [ ] Aliased import: `import { clsx as cx } from 'clsx'`
- [ ] Consider AST-based import detection
- [ ] Prevent duplicate imports

---

## 4. Frontend Code Issues

### 4.1 Starboard Client Re-creation
**Location:** [frontend/src/contexts/StarboardClient.provider.tsx:8-13](frontend/src/contexts/StarboardClient.provider.tsx#L8-L13)

- [ ] Import `useMemo` from React
- [ ] Extract indexer URL to a constant
- [ ] Wrap client creation in `useMemo`:
  ```tsx
  const indexerUrl = getEnv('VITE_INDEXER_URL');
  const client = useMemo(
    () => createStarboardClient({ indexerUrl }),
    [indexerUrl]
  );
  ```
- [ ] Verify client reference is stable across renders

### 4.2 Async Effect Cleanup
**Location:** [frontend/src/pages/Home.tsx:11-28](frontend/src/pages/Home.tsx#L11-L28)

- [ ] Add cleanup logic to effect:
  - [ ] Create `AbortController` OR `let mounted = true` flag
  - [ ] Pass `signal` to API call if supported
  - [ ] In cleanup function: abort controller OR set `mounted = false`
  - [ ] Check abort/mounted status before calling setState
- [ ] Prevent state updates after unmount

### 4.3 Replace css prop with className
**Location:** [frontend/src/pages/Home.tsx:31-54](frontend/src/pages/Home.tsx#L31-L54)

Vanilla Extract exports class name strings, not CSS-in-JS objects.

- [ ] Replace all `css={styles.*}` with `className={styles.*}`:
  - [ ] Line 31: `<div css={styles.page}>` → `<div className={styles.page}>`
  - [ ] Line 32: `<div css={styles.container}>` → `<div className={styles.container}>`
  - [ ] Line 33: `<div css={styles.header}>` → `<div className={styles.header}>`
  - [ ] Line 34: `<h1 css={styles.title}>` → `<h1 className={styles.title}>`
  - [ ] Line 35: `<p css={styles.subtitle}>` → `<p className={styles.subtitle}>`
  - [ ] Line 38: `<div css={styles.statusCard}>` → `<div className={styles.statusCard}>`
  - [ ] Line 39: `<h2 css={styles.statusTitle}>` → `<h2 className={styles.statusTitle}>`
  - [ ] Line 40: `<p css={styles.statusLoading}>` → `<p className={styles.statusLoading}>`
  - [ ] Line 41: `<p css={styles.statusError}>` → `<p className={styles.statusError}>`
  - [ ] Line 43: `<p css={styles.statusSuccess}>` → `<p className={styles.statusSuccess}>`
  - [ ] Line 49: `<div css={styles.buttonContainer}>` → `<div className={styles.buttonContainer}>`
  - [ ] Line 50: `<button css={styles.button}>` → `<button className={styles.button}>`
  - [ ] Line 51: `<button css={styles.buttonSecondary}>` → `<button className={styles.buttonSecondary}>`
- [ ] Run app to verify styles render correctly

---

## 5. Backend Schema Issues

### 5.1 Missing GraphQL Input Types
**Location:** fuel-ts-sdk/src/trading/src/positions/adapter/operations/get-positions.query.ts:4-30

- [ ] Review the GraphQL query for referenced input types
- [ ] Add to indexer schema (`indexer/schema.graphql` or `indexer/schema.views.graphql`):
  - [ ] `PositionWhereInput` with filterable fields:
    - Position ID fields
    - Nested positionKey fields
    - Numeric fields: `collateralAmount`, `size`, `timestamp`, `latest`, `change`
    - Any other fields used for filtering
  - [ ] `PositionOrderByInput` with sortable fields
- [ ] Regenerate client schema/types
- [ ] Verify query validates against server schema

---

## 6. Dependency Management

### 6.1 Tailwind Version Stability
**Location:** [frontend/package.json:17-33](frontend/package.json#L17-L33)

- [ ] Research Tailwind v4.1.18 stability issues with Vite
- [ ] Downgrade to stable v3.x:
  - [ ] Change `"tailwindcss": "^4.1.18"` to `"tailwindcss": "^3.4.x"`
  - [ ] Update `"@tailwindcss/vite": "^4.1.18"` accordingly (or remove if v3)
- [ ] Run full dev build: `pnpm --filter frontend dev`
- [ ] Run CI test suite
- [ ] Verify styles render correctly

### 6.2 Testing Library Version
**Location:** [frontend/package.json:38](frontend/package.json#L38)

- [ ] Research `@testing-library/react@^16.3.1` issues with Suspense/act
- [ ] Pin or upgrade to version that addresses regressions
- [ ] OR adjust tests to work around issues
- [ ] Add note in CI to run visual/CSS checks before merging
- [ ] Run tests: `pnpm --filter frontend test`

---

## 7. Code Quality & Linting

### 7.1 Frontend ESLint Configuration
**Location:** [frontend/eslint.config.js:14-48](frontend/eslint.config.js#L14-L48)

#### 7.1.1 Missing React Recommended Rules
- [ ] The `react` plugin is registered (line 32) but not extended in the `extends` array
- [ ] This means standard React rules aren't enabled:
  - `react/jsx-key`
  - `react/no-direct-mutation-state`
  - `react/prop-types`
  - And many others
- [ ] Add to extends array (line 16-22):
  ```js
  extends: [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    react.configs.flat.recommended,        // Add this
    react.configs.flat['jsx-runtime'],     // Add this (React 19 automatic JSX)
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
    prettier,
  ],
  ```
- [ ] Test linting: `pnpm --filter frontend lint`

### 7.2 Frontend TypeScript Configuration
**Location:** [frontend/tsconfig.app.json:33](frontend/tsconfig.app.json#L33)

- [ ] Remove redundant `"src/main.tsx"` from include array
- [ ] The entry `"src"` already includes all files in the src directory
- [ ] Change line 33 from:
  ```json
  "include": ["src", "src/main.tsx"]
  ```
  to:
  ```json
  "include": ["src"]
  ```

### 7.3 Prettier Quote Configuration
- [ ] Review [.prettierrc.json:3](.prettierrc.json#L3) - currently `"singleQuote": true`
- [ ] Determine if JSX attributes should use double quotes
- [ ] If yes, configure separate JSX quote style OR add ESLint rule
- [ ] Run: `pnpm lint:fix` and verify consistency

### 7.4 ESLint Configuration Review
- [ ] Ensure ESLint rules align with Prettier for quote styles
- [ ] Add rule to enforce double quotes in JSX attributes if needed
- [ ] Test linting: `pnpm lint`

---

## Testing & Validation

### Final Checks
- [ ] Run full build: `pnpm build`
- [ ] Run all tests: `pnpm test`
- [ ] Run linting: `pnpm lint`
- [ ] Verify CI passes on PR
- [ ] Manual testing:
  - [ ] Frontend renders correctly
  - [ ] Styles apply (Vanilla Extract + Tailwind)
  - [ ] No console errors
  - [ ] Indexer connection works
  - [ ] GraphQL queries succeed

---

## Notes
- Current branch: `scaffold-fe`
- Main branch: `main`
- Git status: Modified `indexer/squid.testnet.yaml`
