import type { ComponentPropsWithRef, FC, JSX } from 'react';
import { createElement } from 'react';

export function propify<TProps extends object, TFilledProps extends Partial<TProps>>(
  Component: FC<TProps>,
  defaultProps: TFilledProps
): FC<Omit<TProps, keyof TFilledProps> & Partial<TFilledProps>> {
  const PropifiedComponent: FC<Omit<TProps, keyof TFilledProps> & Partial<TFilledProps>> = (
    props
  ) => {
    return <Component {...defaultProps} {...(props as TProps)} />;
  };

  PropifiedComponent.displayName = `Propified(${Component.displayName || Component.name || 'Component'})`;

  return PropifiedComponent;
}

export function propifyEl<
  TTag extends keyof JSX.IntrinsicElements,
  TFilledProps extends Partial<ComponentPropsWithRef<TTag>>,
>(
  tag: TTag,
  defaultProps: TFilledProps
): FC<Omit<ComponentPropsWithRef<TTag>, keyof TFilledProps> & Partial<TFilledProps>> {
  const PropifiedElement: FC<
    Omit<ComponentPropsWithRef<TTag>, keyof TFilledProps> & Partial<TFilledProps>
  > = (props) => {
    return createElement(tag, { ...defaultProps, ...props } as ComponentPropsWithRef<TTag>);
  };

  PropifiedElement.displayName = `Propified(${tag})`;

  return PropifiedElement;
}
