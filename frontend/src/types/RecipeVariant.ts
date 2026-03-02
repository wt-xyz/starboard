/**
 * Extracts the union of values for a specific variant key from a vanilla-extract recipe.
 *
 * @example
 * // Given: recipe({ variants: { variant: { standard: {}, error: {} } } })
 * type V = RecipeVariant<typeof cell, 'variant'>; // 'standard' | 'error'
 */
export type RecipeVariant<
  Recipe extends (...args: never[]) => string,
  Key extends keyof NonNullable<Parameters<Recipe>[0]>,
> = NonNullable<NonNullable<Parameters<Recipe>[0]>[Key]>;
