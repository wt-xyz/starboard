import { Context, useContext } from 'react';

/**
 * Wrapper around useContext that validates the context value is not null/undefined.
 * Throws a descriptive error if the context is empty.
 *
 * @param context - React context object
 * @throws Error if context value is null or undefined
 * @returns The context value
 */
export function useRequiredContext<T>(context: Context<T | null>): T {
  const value = useContext(context);

  if (value === null) {
    throw new Error(`${context.displayName ?? 'Context'} is not provided`);
  }

  return value;
}
