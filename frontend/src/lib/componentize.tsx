import {
  type ForwardRefExoticComponent,
  type HTMLAttributes,
  type RefAttributes,
  createElement,
  forwardRef,
} from 'react';
import clsx, { type ClassValue } from 'clsx';

export function componentize<T extends Record<string, ClassValue>>(styles: T): Componentized<T> {
  const cache = new Map<string, unknown>();

  return new Proxy({} as Componentized<T>, {
    get(_, prop: string) {
      if (cache.has(prop)) return cache.get(prop);

      const styleKey = prop[0].toLowerCase() + prop.slice(1);
      const tag = `s-${styleKey.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

      const Component = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
        ({ className, ...props }, ref) =>
          createElement(tag, {
            ...props,
            ref,
            className: className ? clsx(styles[styleKey], className) : styles[styleKey],
          })
      );
      Component.displayName = prop;

      cache.set(prop, Component);
      return Component;
    },
  });
}

type Componentized<T extends Record<string, ClassValue>> = {
  [K in keyof T as K extends string ? K : never]: ForwardRefExoticComponent<
    HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement>
  >;
};
