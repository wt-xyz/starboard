import type { Plugin } from 'vite';

/**
 * Vite plugin that transforms `use(SomeContext)!` into `useRequiredContext(SomeContext)`
 *
 * This plugin detects the pattern `use(XxxContext)!` and replaces it with
 * `useRequiredContext(XxxContext)` which provides runtime null checks.
 *
 * Example:
 * - Input:  `const { control } = use(PositionFormKernelContext)!;`
 * - Output: `const { control } = useRequiredContext(PositionFormKernelContext);`
 *
 * The useRequiredContext import is auto-added when needed.
 */
export function useContextAssertPlugin(): Plugin {
  return {
    name: 'vite-plugin-use-context-assert',
    enforce: 'pre',

    transform(code: string, id: string) {
      if (!id.endsWith('.tsx') && !id.endsWith('.ts')) {
        return null;
      }

      // Quick check: does this file have the pattern we're looking for?
      if (!code.includes('use(') || !code.includes('Context)!')) {
        return null;
      }

      // Match: use(SomeContext)! where SomeContext ends with "Context"
      const pattern = /\buse\((\w+Context)\)!/g;

      if (!pattern.test(code)) {
        return null;
      }

      // Reset regex state
      pattern.lastIndex = 0;

      let transformed = code;
      let needsImport = false;

      transformed = code.replace(pattern, (_match, contextName: string) => {
        needsImport = true;
        return `useRequiredContext(${contextName})`;
      });

      if (needsImport && transformed !== code) {
        // Check if useRequiredContext is already imported
        const hasImport = /\buseRequiredContext\b/.test(
          code.match(/^import\s+.*$/gm)?.join('\n') ?? ''
        );

        if (!hasImport) {
          transformed = `import { useRequiredContext } from '@/lib/useRequiredContext';\n${transformed}`;
        }
      }

      // Clean up unused 'use' import if it's no longer needed
      // Only if we transformed something and 'use' is no longer used
      if (transformed !== code) {
        const hasOtherUseUsage = /\buse\s*\(/.test(transformed);
        if (!hasOtherUseUsage) {
          // Remove 'use' from import { use, ... } from 'react'
          transformed = transformed.replace(
            /import\s*\{\s*([^}]*)\buse\b,?\s*([^}]*)\}\s*from\s*['"]react['"]/g,
            (_match, before, after) => {
              const remaining = `${before}${after}`
                .replace(/,\s*,/g, ',')
                .replace(/^\s*,|,\s*$/g, '')
                .trim();
              if (!remaining) {
                return ''; // Remove entire import if empty
              }
              return `import { ${remaining} } from 'react'`;
            }
          );
        }
      }

      return {
        code: transformed,
        map: null,
      };
    },
  };
}
