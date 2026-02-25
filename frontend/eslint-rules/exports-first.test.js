import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe } from 'vitest';
import { exportsFirstRule } from './exports-first.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

describe('exports-first', () => {
  describe('Check A: non-exports above exports', () => {
    ruleTester.run('exports-first', exportsFirstRule, {
      valid: [
        {
          name: 'already correct — exports first, non-exports below',
          code: `
            export const A = () => <B />;
            const B = () => <div />;
          `,
        },
        {
          name: 'module-scope dependency stays above export',
          code: `
            const config = { timeout: 5000 };
            export const api = createApi(config);
          `,
        },
        {
          name: 'transitive module-scope dependency stays above',
          code: `
            const base = 42;
            const config = base + 1;
            export const api = createApi(config);
          `,
        },
        {
          name: 'non-hoistable const with module-scope reference in side-effect stays above',
          code: [
            'const shared = { display: "none" };',
            'export const myStyle = create();',
            'sideEffect(shared);',
          ].join('\n'),
        },
        {
          name: 'no exports — no warnings',
          code: `
            const a = 1;
            const b = 2;
          `,
        },
        {
          name: 'single export only — no warnings',
          code: `
            export const A = 1;
          `,
        },
      ],
      invalid: [
        {
          name: 'non-export above export (function-body ref is not a dependency)',
          code: ['const helper = () => {};', 'export const Main = () => helper();'].join('\n'),
          errors: [{ messageId: 'moveBelow', data: { name: 'helper' } }],
          output: ['', 'export const Main = () => helper();', '', 'const helper = () => {};'].join(
            '\n'
          ),
        },
        {
          name: 'attached displayName moves with declaration',
          code: [
            'const Helper = () => <div />;',
            "Helper.displayName = 'Helper';",
            'export const Main = () => <Helper />;',
          ].join('\n'),
          errors: [{ messageId: 'moveBelow', data: { name: 'Helper' } }],
          output: [
            '',
            'export const Main = () => <Helper />;',
            '',
            'const Helper = () => <div />;',
            "Helper.displayName = 'Helper';",
          ].join('\n'),
        },
        {
          name: 'multiple non-exports above export — first gets reported and fixed',
          code: ['const A = 1;', 'const B = 2;', 'export const Main = () => A + B;'].join('\n'),
          errors: [
            { messageId: 'moveBelow', data: { name: 'A' } },
            { messageId: 'moveBelow', data: { name: 'B' } },
          ],
          output: ['', 'const B = 2;', 'export const Main = () => A + B;', '', 'const A = 1;'].join(
            '\n'
          ),
        },
      ],
    });
  });

  describe('Check B: export clauses at bottom', () => {
    ruleTester.run('exports-first', exportsFirstRule, {
      valid: [
        {
          name: 'export clause already at bottom',
          code: `
            export const A = 1;
            const B = 2;
            export { B };
          `,
        },
        {
          name: 'multiple export clauses at bottom',
          code: `
            export const A = 1;
            const B = 2;
            const C = 3;
            export { B };
            export { C };
          `,
        },
      ],
      invalid: [
        {
          name: 'export clause before non-export',
          code: ['export const A = 1;', 'export { A as default };', 'const B = 2;'].join('\n'),
          errors: [{ messageId: 'exportClauseBottom' }],
          output: ['export const A = 1;', 'const B = 2;', '', 'export { A as default };'].join(
            '\n'
          ),
        },
      ],
    });
  });

  describe('Check C: non-export ordering by first usage', () => {
    ruleTester.run('exports-first', exportsFirstRule, {
      valid: [
        {
          name: 'non-exports already in first-usage order',
          code: [
            'export const Main = () => {',
            '  A();',
            '  B();',
            '};',
            'const A = () => {};',
            'const B = () => {};',
          ].join('\n'),
        },
        {
          name: 'single non-export — no ordering needed',
          code: `
            export const Main = () => A();
            const A = () => {};
          `,
        },
        {
          name: 'unused non-exports maintain original order',
          code: `
            export const Main = 1;
            const A = 2;
            const B = 3;
          `,
        },
      ],
      invalid: [
        {
          name: 'non-exports out of first-usage order (JSX)',
          code: [
            'export const Main = () => (',
            '  <>',
            '    <B />',
            '    <A />',
            '  </>',
            ');',
            'const A = () => <div />;',
            'const B = () => <div />;',
          ].join('\n'),
          errors: [{ messageId: 'reorder' }],
          output: [
            'export const Main = () => (',
            '  <>',
            '    <B />',
            '    <A />',
            '  </>',
            ');',
            'const B = () => <div />;',
            '',
            'const A = () => <div />;',
          ].join('\n'),
        },
        {
          name: 'reorder preserves attached displayName (JSX)',
          code: [
            'export const Main = () => (',
            '  <>',
            '    <B />',
            '    <A />',
            '  </>',
            ');',
            'const A = () => <div />;',
            "A.displayName = 'A';",
            'const B = () => <div />;',
            "B.displayName = 'B';",
          ].join('\n'),
          errors: [{ messageId: 'reorder' }],
          output: [
            'export const Main = () => (',
            '  <>',
            '    <B />',
            '    <A />',
            '  </>',
            ');',
            'const B = () => <div />;',
            "B.displayName = 'B';",
            '',
            'const A = () => <div />;',
            "A.displayName = 'A';",
          ].join('\n'),
        },
      ],
    });
  });

  describe('combined scenarios', () => {
    ruleTester.run('exports-first', exportsFirstRule, {
      valid: [
        {
          name: 'fully correct file — exports, non-exports by usage, export clause at bottom',
          code: [
            'const config = { x: 1 };',
            'export const api = init(config);',
            'export const Main = () => {',
            '  A();',
            '  B();',
            '};',
            'const A = () => {};',
            'const B = () => {};',
            'export { api as default };',
          ].join('\n'),
        },
      ],
      invalid: [
        {
          name: 'non-export above + export clause not at bottom',
          code: [
            'const helper = () => {};',
            'export { helper };',
            'export const Main = () => helper();',
          ].join('\n'),
          errors: [{ messageId: 'moveBelow' }, { messageId: 'exportClauseBottom' }],
          output: [
            '',
            'export { helper };',
            'export const Main = () => helper();',
            '',
            'const helper = () => {};',
          ].join('\n'),
        },
      ],
    });
  });

  describe('TypeScript type/interface declarations', () => {
    ruleTester.run('exports-first', exportsFirstRule, {
      valid: [
        {
          name: 'type declaration grouped with its consumer — already correct',
          code: [
            'export const Main = () => <Helper />;',
            'type HelperProps = { x: number };',
            'const Helper = (props: HelperProps) => <div />;',
          ].join('\n'),
        },
        {
          name: 'type used as module-scope dependency stays above export',
          code: [
            'type Config = { timeout: number };',
            'const config: Config = { timeout: 5000 };',
            'export const api = createApi(config);',
          ].join('\n'),
        },
      ],
      invalid: [
        {
          name: 'type declaration above export gets moved below',
          code: ['type HelperProps = { x: number };', 'export const Main = () => <div />;'].join(
            '\n'
          ),
          errors: [{ messageId: 'moveBelow', data: { name: 'HelperProps' } }],
          output: [
            '',
            'export const Main = () => <div />;',
            '',
            'type HelperProps = { x: number };',
          ].join('\n'),
        },
        {
          name: 'interface between value declarations survives reorder (grouped with consumer)',
          code: [
            'export const Main = () => (',
            '  <>',
            '    <B />',
            '    <A />',
            '  </>',
            ');',
            'const A = () => <div />;',
            'interface MyProps { x: number }',
            'const B: FC<MyProps> = () => <div />;',
          ].join('\n'),
          errors: [{ messageId: 'reorder' }],
          output: [
            'export const Main = () => (',
            '  <>',
            '    <B />',
            '    <A />',
            '  </>',
            ');',
            'interface MyProps { x: number }',
            'const B: FC<MyProps> = () => <div />;',
            '',
            'const A = () => <div />;',
          ].join('\n'),
        },
        {
          name: 'unreferenced interface between value declarations still survives reorder',
          code: [
            'export const Main = () => (',
            '  <>',
            '    <B />',
            '    <A />',
            '  </>',
            ');',
            'const A = () => <div />;',
            'interface MyProps { x: number }',
            'const B = () => <div />;',
          ].join('\n'),
          errors: [{ messageId: 'reorder' }],
          output: [
            'export const Main = () => (',
            '  <>',
            '    <B />',
            '    <A />',
            '  </>',
            ');',
            'const B = () => <div />;',
            '',
            'const A = () => <div />;',
            '',
            'interface MyProps { x: number }',
          ].join('\n'),
        },
      ],
    });
  });

  describe('function declarations', () => {
    ruleTester.run('exports-first', exportsFirstRule, {
      valid: [
        {
          name: 'function declaration below export in first-usage order',
          code: [
            'export const Main = () => {',
            '  foo();',
            '  bar();',
            '};',
            'function foo() {}',
            'function bar() {}',
          ].join('\n'),
        },
      ],
      invalid: [
        {
          name: 'function declaration above export (not module-scope dep)',
          code: ['function helper() { return 1; }', 'export const Main = () => helper();'].join(
            '\n'
          ),
          errors: [{ messageId: 'moveBelow', data: { name: 'helper' } }],
          output: [
            '',
            'export const Main = () => helper();',
            '',
            'function helper() { return 1; }',
          ].join('\n'),
        },
        {
          name: 'function declarations out of first-usage order',
          code: [
            'export const Main = () => {',
            '  second();',
            '  first();',
            '};',
            'function first() {}',
            'function second() {}',
          ].join('\n'),
          errors: [{ messageId: 'reorder' }],
          output: [
            'export const Main = () => {',
            '  second();',
            '  first();',
            '};',
            'function second() {}',
            '',
            'function first() {}',
          ].join('\n'),
        },
      ],
    });
  });
});
