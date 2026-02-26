/** @type {import('eslint').Rule.RuleModule} */
export const exportsFirstRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce exports first, non-exports ordered by first usage, export clauses at bottom',
    },
    fixable: 'code',
    schema: [],
    messages: {
      moveBelow: 'Non-exported "{{name}}" should be placed below exports.',
      exportClauseBottom: '"export { }" clause should be at the bottom of the file.',
      reorder:
        '"{{nameA}}" (used line {{lineA}}) should appear before "{{nameB}}" (used line {{lineB}}).',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function isValueDeclaration(node) {
      return (
        node.type === 'VariableDeclaration' ||
        node.type === 'FunctionDeclaration' ||
        node.type === 'ClassDeclaration' ||
        node.type === 'TSTypeAliasDeclaration' ||
        node.type === 'TSInterfaceDeclaration' ||
        node.type === 'TSEnumDeclaration'
      );
    }

    function isExportWithDeclaration(node) {
      return (
        (node.type === 'ExportNamedDeclaration' && node.declaration != null) ||
        node.type === 'ExportDefaultDeclaration'
      );
    }

    function isExportClause(node) {
      return (
        node.type === 'ExportNamedDeclaration' && node.declaration == null && node.source == null
      );
    }

    function getDeclaredVarNames(node) {
      const vars = sourceCode.getDeclaredVariables(node).map((v) => v.name);
      if (vars.length > 0) return vars;
      if (node.id?.type === 'Identifier') return [node.id.name];
      return [];
    }

    function isAttachedExpression(stmt, varNames) {
      if (!stmt || stmt.type !== 'ExpressionStatement') return false;
      const expr = stmt.expression;
      if (expr.type === 'AssignmentExpression' && expr.left.type === 'MemberExpression') {
        return expr.left.object.type === 'Identifier' && varNames.includes(expr.left.object.name);
      }
      return false;
    }

    /**
     * Computes body indices that are transitive dependencies of exports.
     * Only module-scope references count — references inside function bodies
     * don't create initialization-time dependencies.
     */
    function computeExportDeps(stmts) {
      const keepAbove = new Set();
      const stmtMap = new Map();

      for (const s of stmts) {
        stmtMap.set(s.bodyIdx, s);
        if (s.isExportWithDecl) keepAbove.add(s.bodyIdx);
      }

      let changed = true;
      while (changed) {
        changed = false;
        for (const stmt of stmts) {
          if (stmt.isExportWithDecl || keepAbove.has(stmt.bodyIdx)) continue;
          if (!isValueDeclaration(stmt.node)) continue;

          const vars = sourceCode.getDeclaredVariables(stmt.node);
          outer: for (const v of vars) {
            for (const ref of v.references) {
              if (ref.from.type !== 'module' && ref.from.type !== 'global') continue;

              const pos = ref.identifier.range[0];
              for (const idx of keepAbove) {
                const keepNode = stmtMap.get(idx).node;
                if (pos >= keepNode.range[0] && pos <= keepNode.range[1]) {
                  keepAbove.add(stmt.bodyIdx);
                  changed = true;
                  break outer;
                }
              }
            }
          }
        }
      }

      return keepAbove;
    }

    /**
     * Returns the earliest line where a group's declared variables are
     * referenced outside the group itself. Returns Infinity if never referenced.
     */
    function getFirstUsageLine(declNode, groupNodes) {
      const vars = sourceCode.getDeclaredVariables(declNode);
      let earliest = Infinity;
      const groupStart = groupNodes[0].range[0];
      const groupEnd = groupNodes[groupNodes.length - 1].range[1];

      for (const v of vars) {
        for (const ref of v.references) {
          const pos = ref.identifier.range[0];
          if (pos >= groupStart && pos <= groupEnd) continue;
          const line = ref.identifier.loc.start.line;
          if (line < earliest) earliest = line;
        }
      }
      return earliest;
    }

    function isTypeDeclaration(node) {
      return node.type === 'TSTypeAliasDeclaration' || node.type === 'TSInterfaceDeclaration';
    }

    function isReferencedInNode(declNode, targetNode) {
      const vars = sourceCode.getDeclaredVariables(declNode);
      for (const v of vars) {
        for (const ref of v.references) {
          const pos = ref.identifier.range[0];
          if (pos >= targetNode.range[0] && pos <= targetNode.range[1]) return true;
        }
      }
      return false;
    }

    /**
     * Collects declaration "groups" — a value declaration followed by
     * attached expression statements (e.g. Comp.displayName = '...').
     * Type/interface declarations that are referenced by a nearby value
     * declaration are merged into that declaration's group as a prefix.
     */
    function collectGroups(body, startIdx, endIdx) {
      const groups = [];
      let i = startIdx;

      while (i <= endIdx) {
        const node = body[i];

        if (isExportClause(node)) {
          i++;
          continue;
        }

        if (isValueDeclaration(node)) {
          const varNames = getDeclaredVarNames(node);
          const nodes = [node];
          let j = i + 1;
          while (j <= endIdx && isAttachedExpression(body[j], varNames)) {
            nodes.push(body[j]);
            j++;
          }
          const firstUsage = getFirstUsageLine(node, nodes);
          groups.push({ nodes, declNode: node, firstUsage, startBodyIdx: i });
          i = j;
        } else {
          // Non-declaration statement — preserve position
          groups.push({ nodes: [node], declNode: null, firstUsage: Infinity, startBodyIdx: i });
          i++;
        }
      }

      // Merge type declaration groups into their consumer value declaration groups.
      // Types become prefixes so they appear above the component that uses them.
      for (let g = groups.length - 1; g >= 0; g--) {
        const group = groups[g];
        if (!group.declNode || !isTypeDeclaration(group.declNode)) continue;

        // Find the nearest non-type value declaration that references this type
        let consumerIdx = -1;
        for (let j = g + 1; j < groups.length; j++) {
          if (
            groups[j].declNode &&
            !isTypeDeclaration(groups[j].declNode) &&
            isReferencedInNode(group.declNode, groups[j].declNode)
          ) {
            consumerIdx = j;
            break;
          }
        }
        if (consumerIdx === -1) {
          for (let j = g - 1; j >= 0; j--) {
            if (
              groups[j].declNode &&
              !isTypeDeclaration(groups[j].declNode) &&
              isReferencedInNode(group.declNode, groups[j].declNode)
            ) {
              consumerIdx = j;
              break;
            }
          }
        }

        if (consumerIdx !== -1) {
          groups[consumerIdx].nodes = [...group.nodes, ...groups[consumerIdx].nodes];
          groups.splice(g, 1);
        }
      }

      return groups;
    }

    return {
      'Program:exit'(program) {
        const body = program.body;

        // Classify all non-import statements
        const stmts = [];
        for (let i = 0; i < body.length; i++) {
          const node = body[i];
          if (node.type === 'ImportDeclaration' || node.type === 'ExportAllDeclaration') continue;
          stmts.push({
            node,
            bodyIdx: i,
            isExportWithDecl: isExportWithDeclaration(node),
            isExportClause: isExportClause(node),
          });
        }

        // === CHECK A: Non-exports above last export-with-declaration ===

        let lastExportDeclStmtIdx = -1;
        for (let i = stmts.length - 1; i >= 0; i--) {
          if (stmts[i].isExportWithDecl) {
            lastExportDeclStmtIdx = i;
            break;
          }
        }

        if (lastExportDeclStmtIdx > 0) {
          const keepAbove = computeExportDeps(stmts);
          const lastExportNode = stmts[lastExportDeclStmtIdx].node;

          for (let i = 0; i < lastExportDeclStmtIdx; i++) {
            const stmt = stmts[i];
            if (stmt.isExportWithDecl || stmt.isExportClause) continue;
            if (!isValueDeclaration(stmt.node)) continue;
            if (keepAbove.has(stmt.bodyIdx)) continue;

            const varNames = getDeclaredVarNames(stmt.node);

            // Non-hoistable declarations (const/let/var, class, enum) with
            // module-scope references outside their own group cannot be moved
            // below exports — they would hit TDZ errors at runtime.
            // Only function declarations are hoistable and safe to move freely.
            if (stmt.node.type !== 'FunctionDeclaration' && !isTypeDeclaration(stmt.node)) {
              const groupNodes = [stmt.node];
              let ni = stmt.bodyIdx + 1;
              while (ni < body.length && isAttachedExpression(body[ni], varNames)) {
                groupNodes.push(body[ni]);
                ni++;
              }
              const exportClauseNodes = stmts.filter((s) => s.isExportClause).map((s) => s.node);
              const vars = sourceCode.getDeclaredVariables(stmt.node);
              const hasExternalModuleRef = vars.some((v) =>
                v.references.some((ref) => {
                  if (ref.from.type !== 'module' && ref.from.type !== 'global') return false;
                  const pos = ref.identifier.range[0];
                  if (groupNodes.some((gn) => pos >= gn.range[0] && pos <= gn.range[1]))
                    return false;
                  if (exportClauseNodes.some((ec) => pos >= ec.range[0] && pos <= ec.range[1]))
                    return false;
                  return true;
                })
              );
              if (hasExternalModuleRef) continue;
            }

            const name = varNames[0] ?? '(declaration)';

            context.report({
              node: stmt.node,
              messageId: 'moveBelow',
              data: { name },
              fix(fixer) {
                const toMove = [stmt.node];
                let nextIdx = stmt.bodyIdx + 1;
                while (nextIdx < body.length) {
                  if (isAttachedExpression(body[nextIdx], varNames)) {
                    toMove.push(body[nextIdx]);
                    nextIdx++;
                  } else break;
                }

                const moveText = toMove.map((n) => sourceCode.getText(n)).join('\n');
                const first = toMove[0];
                const last = toMove[toMove.length - 1];
                const tokenBefore = sourceCode.getTokenBefore(first, { includeComments: true });
                const removeFrom = tokenBefore ? tokenBefore.range[1] : first.range[0];

                return [
                  fixer.removeRange([removeFrom, last.range[1]]),
                  fixer.insertTextAfter(lastExportNode, '\n\n' + moveText),
                ];
              },
            });
          }
        }

        // === CHECK B: Export clauses not at bottom ===

        const exportClauses = stmts.filter((s) => s.isExportClause);
        if (exportClauses.length > 0) {
          let lastNonClauseStmtIdx = -1;
          for (let i = stmts.length - 1; i >= 0; i--) {
            if (!stmts[i].isExportClause) {
              lastNonClauseStmtIdx = i;
              break;
            }
          }

          for (const clause of exportClauses) {
            const clauseStmtIdx = stmts.indexOf(clause);
            if (clauseStmtIdx < lastNonClauseStmtIdx) {
              const lastNonClause = stmts[lastNonClauseStmtIdx].node;

              context.report({
                node: clause.node,
                messageId: 'exportClauseBottom',
                fix(fixer) {
                  const text = sourceCode.getText(clause.node);
                  const tokenBefore = sourceCode.getTokenBefore(clause.node, {
                    includeComments: true,
                  });
                  const removeFrom = tokenBefore ? tokenBefore.range[1] : clause.node.range[0];

                  return [
                    fixer.removeRange([removeFrom, clause.node.range[1]]),
                    fixer.insertTextAfter(lastNonClause, '\n\n' + text),
                  ];
                },
              });
            }
          }
        }

        // === CHECK C: Non-export ordering by first usage ===

        if (lastExportDeclStmtIdx < 0) return;

        const lastExportBodyIdx = stmts[lastExportDeclStmtIdx].bodyIdx;
        const groups = collectGroups(body, lastExportBodyIdx + 1, body.length - 1);
        const declGroups = groups.filter((g) => g.declNode != null);

        if (declGroups.length <= 1) return;

        // Sort by first usage, stable tie-break by original position
        const sorted = [...declGroups].sort((a, b) => {
          if (a.firstUsage !== b.firstUsage) return a.firstUsage - b.firstUsage;
          return a.startBodyIdx - b.startBodyIdx;
        });

        const isOrdered = declGroups.every((g, idx) => g.startBodyIdx === sorted[idx].startBodyIdx);
        if (isOrdered) return;

        // Report on the first out-of-order group, fix reorders the entire section
        const firstBadIdx = declGroups.findIndex(
          (g, idx) => g.startBodyIdx !== sorted[idx].startBodyIdx
        );
        const badGroup = declGroups[firstBadIdx];
        const shouldBeGroup = sorted[firstBadIdx];

        const nameA = getDeclaredVarNames(shouldBeGroup.declNode)[0] ?? '?';
        const nameB = getDeclaredVarNames(badGroup.declNode)[0] ?? '?';

        context.report({
          node: badGroup.nodes[0],
          messageId: 'reorder',
          data: {
            nameA,
            lineA: shouldBeGroup.firstUsage === Infinity ? '∞' : String(shouldBeGroup.firstUsage),
            nameB,
            lineB: badGroup.firstUsage === Infinity ? '∞' : String(badGroup.firstUsage),
          },
          fix(fixer) {
            // Replace entire non-export declaration section with correctly ordered groups
            const sectionStart = declGroups[0].nodes[0].range[0];
            const lastDeclGroup = declGroups[declGroups.length - 1];
            const sectionEnd = lastDeclGroup.nodes[lastDeclGroup.nodes.length - 1].range[1];

            // Bail out if non-declaration groups exist between the first and last
            // declGroups — their correct position after reordering is ambiguous
            // and replacing the range would silently drop them.
            const hasNonDeclInRange = groups.some(
              (g) =>
                g.declNode == null &&
                g.nodes[0].range[0] >= sectionStart &&
                g.nodes[g.nodes.length - 1].range[1] <= sectionEnd
            );
            if (hasNonDeclInRange) return null;

            const reorderedText = sorted
              .map((g) => g.nodes.map((n) => sourceCode.getText(n)).join('\n'))
              .join('\n\n');

            return fixer.replaceTextRange([sectionStart, sectionEnd], reorderedText);
          },
        });
      },
    };
  },
};
